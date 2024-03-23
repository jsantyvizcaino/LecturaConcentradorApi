const { HistoricoMedidoresMensual, EnergiasMedidor } = require("../models")
const errorMessages = require('../utils/error_messages');

const crearHistoricoMedidorMensual = async(data) => {
    const nuevo = new HistoricoMedidoresMensual(data);
    await nuevo.save();
}

const actulizarHistoricoMedidorMensual = async(data) => {
    const filtro = data['id'];
    const actualizacion = {
        $set: {
            maximaDemanda: data['maximaDemanda'],
        },
    };
    const actualizado = await HistoricoMedidoresMensual.findOneAndUpdate(filtro, actualizacion, { new: true });
}


const obtenerHistoricosBySerialService = async(serial) => {

    const query = { serial: serial }
    const historico = await HistoricoMedidoresMensual.findOne(query);
    return historico
}

const obtenerHistoricoMensualService = async(serial, anio, mes) => {
    let query = {};
    if (!mes) {
        const salida = await HistoricoMedidoresMensual.aggregate([{
            $match: {
                $expr: {
                    $and: [
                        { $eq: [{ $year: "$fecha" }, anio] },
                        { $eq: ["$serial", serial] }
                    ]
                }
            }
        }])

        let consumosTotales = {}
        for (let i = 0; i < salida.length - 1; i++) {

            const consumoTotal = (salida[i + 1].consumoInicialMes - salida[i].consumoInicialMes).toFixed(2);

            const mes = salida[i].fecha.getMonth();
            const clave = mes;
            const valor = consumoTotal;
            consumosTotales[clave] = valor;
        }

        let data = []
        for (const mensual of salida) {
            const mes = mensual.fecha.getMonth();
            let consumoTotal = 0;
            if (consumosTotales.hasOwnProperty(mes)) {
                consumoTotal = consumosTotales[mes];
            }
            const objeto = {
                serial: mensual.serial,
                consumoTotal,
                demandaMaxima: mensual.maximaDemanda,
                anio,
                mes: mes + 1
            }

            data.push(objeto);
        }
        return data;
    }

    if (mes == 0) {
        const salida = await HistoricoMedidoresMensual.aggregate([{
            $match: {
                $expr: {
                    $and: [
                        { $eq: [{ $year: "$fecha" }, anio] },
                        { $eq: ["$serial", serial] }
                    ]
                }
            }
        }])

        var objetoFechaMenor = salida[0];
        var objetoFechaMayor = salida[0];

        // Encuentra el objeto con la fecha menor y la fecha mayor
        salida.forEach(function(objeto) {
            if (objeto.fecha < objetoFechaMenor.fecha) {
                objetoFechaMenor = objeto;
            }
            if (objeto.fecha > objetoFechaMayor.fecha) {
                objetoFechaMayor = objeto;
            }
        });

        const mayorValor = salida.reduce(function(anterior, actual) {
            return (actual.maximaDemanda > anterior.maximaDemanda) ? actual : anterior;
        });


        const data = {
            serial: objetoFechaMenor['serial'],
            consumoTotal: (objetoFechaMayor['consumoInicialMes'] - objetoFechaMenor['consumoInicialMes']).toFixed(2),
            demandaMaxima: mayorValor.maximaDemanda,
            anio,
            mes: mes ? mes : 0
        }


        return data;
    }

    if (mes === 12) {
        query = {
            fecha: {
                $gte: new Date(anio, mes - 1, 1, 0, 0, 0, 0),
                $lt: new Date(anio + 1, 1, 1, 0, 0, 0, 0)
            },
            serial: serial
        }
    } else {
        query = {
            fecha: {
                $gte: new Date(anio, mes - 1, 1, 0, 0, 0, 0),
                $lt: new Date(anio, mes + 1, 1, 0, 0, 0, 0)
            },
            serial: serial
        }
    }

    const [mesActual, mesSiguiente] = await HistoricoMedidoresMensual.find(query).sort("fecha")

    let data;
    if (mesSiguiente && mesActual) {
        data = {
            serial: mesActual['serial'],
            consumoTotal: (mesSiguiente['consumoInicialMes'] - mesActual['consumoInicialMes']).toFixed(2),
            demandaMaxima: mesActual['maximaDemanda'],
            anio,
            mes
        }
    }


    return data;
}

const obtenerHistoricoKwHDiaroMensualBySerialService = async(serial, anio, mes) => {
    try {
        let queryNextMonth;
        if (mes === 12) {
            // Si el mes es diciembre, el siguiente mes será en el próximo año (anio + 1) y el mes será enero (1)
            queryNextMonth = {
                "$and": [
                    { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, 1] } },
                    { "$expr": { "$eq": [{ "$month": "$fecha" }, 1] } },
                    { "$expr": { "$eq": [{ "$year": "$fecha" }, anio + 1] } },
                    { "serial": serial }
                ]
            };
        } else {
            // Para otros meses, simplemente sumamos 1 al mes y mantenemos el mismo año
            queryNextMonth = {
                "$and": [
                    { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, 1] } },
                    { "$expr": { "$eq": [{ "$month": "$fecha" }, mes + 1] } },
                    { "$expr": { "$eq": [{ "$year": "$fecha" }, anio] } },
                    { "serial": serial }
                ]
            };
        }
        const queryCurrentMonth = {
            "$and": [
                { "$expr": { "$eq": [{ "$month": "$fecha" }, mes] } },
                { "$expr": { "$eq": [{ "$year": "$fecha" }, anio] } },
                { "serial": serial }
            ]
        };
        const [historicoDia, historico] = await Promise.all([
            EnergiasMedidor.find(queryNextMonth),
            EnergiasMedidor.find(queryCurrentMonth)
        ]);
        const historicoCombinado = historico.concat(historicoDia);
        const objetosUnicosPorDia = obtenerObjetosPorDia(historicoCombinado);
        const historicoDepurado = objetosUnicosPorDia.map((objeto, index, array) => {
            const siguienteIndice = (index + 1) % array.length;
            const siguienteObjeto = array[siguienteIndice];
            let diferenciaEnergia = siguienteObjeto ? parseFloat((siguienteObjeto.energiaActivaTotal.DataVal - objeto.energiaActivaTotal.DataVal).toFixed(2)) : 0.0
            if (diferenciaEnergia < 0) {
                diferenciaEnergia = 0.0;
            }
            return {
                diaNum: objeto.fecha.getUTCDay(),
                dia: obtenerNombreDia(objeto.fecha),
                fecha: objeto.fecha,
                serial: objeto.serial,
                energia: diferenciaEnergia,
            }
        });

        historicoDepurado.pop();

        return {
            total: historicoDepurado.length,
            historico: historicoDepurado
        };
    } catch (error) {
        throw `${errorMessages.DATABASE_QUERY_ERROR}: ${error.message}`;
    }
};


const obtenerValoresKwHDiaroMensualBySerialService = async(serial, anio, mes) => {
    try {
        let queryNextMonth;
        if (mes === 12) {
            // Si el mes es diciembre, el siguiente mes será en el próximo año (anio + 1) y el mes será enero (1)
            queryNextMonth = {
                "$and": [
                    { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, 1] } },
                    { "$expr": { "$eq": [{ "$month": "$fecha" }, 1] } },
                    { "$expr": { "$eq": [{ "$year": "$fecha" }, anio + 1] } },
                    { "serial": serial }
                ]
            };
        } else {
            // Para otros meses, simplemente sumamos 1 al mes y mantenemos el mismo año
            queryNextMonth = {
                "$and": [
                    { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, 1] } },
                    { "$expr": { "$eq": [{ "$month": "$fecha" }, mes + 1] } },
                    { "$expr": { "$eq": [{ "$year": "$fecha" }, anio] } },
                    { "serial": serial }
                ]
            };
        }
        const queryCurrentMonth = {
            "$and": [
                { "$expr": { "$eq": [{ "$month": "$fecha" }, mes] } },
                { "$expr": { "$eq": [{ "$year": "$fecha" }, anio] } },
                { "serial": serial }
            ]
        };
        const [historicoDia, historico] = await Promise.all([
            EnergiasMedidor.find(queryNextMonth),
            EnergiasMedidor.find(queryCurrentMonth)
        ]);
        const historicoCombinado = historico.concat(historicoDia);
        const objetosUnicosPorDia = obtenerObjetosPorDia(historicoCombinado);

        console.log(objetosUnicosPorDia)

        if (objetosUnicosPorDia.length === 0) {
            console.log('a')
            throw new Error(`${errorMessages.SIN_DATOS}`);
        }

        console.log('b')

        const primerDiaEnergia = objetosUnicosPorDia[0].energiaActivaTotal.DataVal;
        const ultimoDiaEnergia = objetosUnicosPorDia[objetosUnicosPorDia.length - 1].energiaActivaTotal.DataVal;
        const totalEnergia = parseFloat((ultimoDiaEnergia - primerDiaEnergia).toFixed(2));

        const historicoDepurado = objetosUnicosPorDia.map((objeto, index, array) => {
            const siguienteIndice = (index + 1) % array.length;
            const siguienteObjeto = array[siguienteIndice];
            return {
                diaNum: objeto.fecha.getUTCDay(),
                dia: obtenerNombreDia(objeto.fecha),
                fecha: objeto.fecha,
                serial: objeto.serial,
                energia: siguienteObjeto ? parseFloat((siguienteObjeto.energiaActivaTotal.DataVal - objeto.energiaActivaTotal.DataVal).toFixed(2)) : 0.0,
            }
        });

        historicoDepurado.pop();


        return {
            promedioEnergia: parseFloat(obtenerPromedioEnergia(historicoDepurado).toFixed(2)),
            minimoEnergia: obtenerValoresExtremosEnergia(historicoDepurado).minimoEnergia,
            maximoEnergia: obtenerValoresExtremosEnergia(historicoDepurado).maximoEnergia,
            totalEnergia,


        };
    } catch (error) {
        throw `${errorMessages.DATABASE_QUERY_ERROR}: ${error.message}`;
    }
};


const obtenerHistoricoKwHMesAnualBySerialService = async(serial, anio) => {
    try {

        const historicoAnual = []

        for (let mes = 1; mes <= 12; mes++) {

            const datosMensual = await obtenerEnergiaMensual(serial, mes, anio);
            const historicoMensual = {
                energia: datosMensual,
                mes: mes,
                serial
            };
            historicoAnual.push(historicoMensual);
        }
        return historicoAnual;
    } catch (error) {
        throw `${errorMessages.DATABASE_QUERY_ERROR}: ${error.message}`;
    }
};


const obtenerValoresKwHMesAnualBySerialService = async(serial, anio) => {
    const diaActual = new Date().getDate();
    const anioActual = new Date().getFullYear();
    const mesActual = new Date().getMonth() + 1;
    let mesUltimoNextYear = 1
    let mesUltimo = 12
    let anioUltimo = anio + 1
    let diaUltimo = 1

    if (anio == anioActual && mesActual !== 12) {

        anioUltimo = anioActual
        mesUltimoNextYear = mesActual
        mesUltimo = mesActual
        diaUltimo = diaActual
    }

    try {

        const queryNextMonth = {
            "$and": [
                { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, diaUltimo] } },
                { "$expr": { "$eq": [{ "$month": "$fecha" }, mesUltimoNextYear] } },
                { "$expr": { "$eq": [{ "$year": "$fecha" }, anioUltimo] } },
                { "serial": serial }
            ]
        };

        const queryCurrentMonth = {
            "$and": [
                { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, 1] } },
                { "$expr": { "$eq": [{ "$month": "$fecha" }, 1] } },
                { "$expr": { "$eq": [{ "$year": "$fecha" }, anio] } },
                { "serial": serial }
            ]
        };
        let [historicoUltimoDiadelAnio, historicoPrimerDiaAnio] = await Promise.all([
            EnergiasMedidor.find(queryNextMonth).sort({ "fecha": 1 }).limit(1),
            EnergiasMedidor.find(queryCurrentMonth).sort({ "fecha": 1 }).limit(1),
        ]);

        if (historicoUltimoDiadelAnio.length === 0) {
            const queryNextMonth = {
                "$and": [
                    { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, diaUltimo - 1] } },
                    { "$expr": { "$eq": [{ "$month": "$fecha" }, mesUltimoNextYear] } },
                    { "$expr": { "$eq": [{ "$year": "$fecha" }, anioUltimo] } },
                    { "serial": serial }
                ]
            };
            historicoUltimoDiadelAnio = await EnergiasMedidor.find(queryNextMonth).sort({ "fecha": 1 }).limit(1);
        }

        const primerDiaEnergia = historicoPrimerDiaAnio[0].energiaActivaTotal.DataVal;
        const ultimoDiaEnergia = historicoUltimoDiadelAnio[0].energiaActivaTotal.DataVal;




        const totalEnergia = parseFloat((ultimoDiaEnergia - primerDiaEnergia).toFixed(2));

        const historicoAnual = []

        for (let mes = 1; mes <= mesUltimo; mes++) {

            const datosMensual = await obtenerEnergiaMensual(serial, mes, anio);
            const historicoMensual = {
                energia: datosMensual,
                mes: mes,
                serial
            };
            historicoAnual.push(historicoMensual);
        }



        const sumaEnergias = historicoAnual.reduce((acumulador, elemento) => acumulador + elemento.energia, 0);
        const promedio = parseFloat((sumaEnergias / historicoAnual.length).toFixed(2));
        const maximo = Math.max(...historicoAnual.map(elemento => elemento.energia));
        const minimo = Math.min(...historicoAnual.map(elemento => elemento.energia));

        return {
            promedioEnergia: promedio,
            minimoEnergia: minimo,
            maximoEnergia: maximo,
            totalEnergia,


        };





    } catch (error) {
        throw `${errorMessages.DATABASE_QUERY_ERROR}: ${error.message}`;
    }
};


module.exports = {
    crearHistoricoMedidorMensual,
    actulizarHistoricoMedidorMensual,
    obtenerHistoricosBySerialService,
    obtenerHistoricoMensualService,
    obtenerHistoricoKwHDiaroMensualBySerialService,
    obtenerValoresKwHDiaroMensualBySerialService,
    obtenerHistoricoKwHMesAnualBySerialService,
    obtenerValoresKwHMesAnualBySerialService

}


const obtenerObjetosPorDia = (datos) => {
    const objetosPorDia = {};

    datos.forEach((objeto) => {
        const fecha = new Date(objeto.fecha).toISOString().slice(0, 10); // Obtiene solo la fecha en formato ISO

        if (!objetosPorDia[fecha]) {
            objetosPorDia[fecha] = objeto;
        } else {
            const fechaExistente = new Date(objetosPorDia[fecha].fecha);
            const fechaActual = new Date(objeto.fecha);
            if (fechaActual < fechaExistente) {
                objetosPorDia[fecha] = objeto;
            }
        }
    });

    return Object.values(objetosPorDia);
}

const obtenerNombreDia = (fecha) => {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return diasSemana[fecha.getUTCDay()];
}

const obtenerPromedioEnergia = (historico) => {
    // Suma todas las energías de los días
    const sumaEnergia = historico.reduce((acumulador, dia) => acumulador + dia.energia, 0);

    // Calcula el promedio dividiendo la suma total de energías entre el número de días
    const promedio = sumaEnergia / historico.length;

    // Retorna el promedio
    return promedio;
};

const obtenerValoresExtremosEnergia = (historico) => {
    let minimoEnergia = Number.MAX_VALUE;
    let maximoEnergia = Number.MIN_VALUE;

    historico.forEach((dia) => {
        minimoEnergia = Math.min(minimoEnergia, dia.energia);
        maximoEnergia = Math.max(maximoEnergia, dia.energia);
    });

    return { minimoEnergia, maximoEnergia };
};


const obtenerUltimoDiaDelMes = (anio, mes) => {
    const fecha = new Date(anio, mes, 0);
    return fecha.getDate();
};

const obtenerEnergiaMensual = async(serial, mes, anio) => {

    try {

        let queryNextMonth;
        if (mes === 12) {
            // Si el mes es diciembre, el siguiente mes será en el próximo año (anio + 1) y el mes será enero (1)
            queryNextMonth = {
                "$and": [
                    { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, 1] } },
                    { "$expr": { "$eq": [{ "$month": "$fecha" }, 1] } },
                    { "$expr": { "$eq": [{ "$year": "$fecha" }, anio + 1] } },
                    { "serial": serial }
                ]
            };
        } else {
            // Para otros meses, simplemente sumamos 1 al mes y mantenemos el mismo año
            queryNextMonth = {
                "$and": [
                    { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, 1] } },
                    { "$expr": { "$eq": [{ "$month": "$fecha" }, mes + 1] } },
                    { "$expr": { "$eq": [{ "$year": "$fecha" }, anio] } },
                    { "serial": serial }
                ]
            };
        }


        const queryCurrentMonth = {
            "$and": [
                { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, 1] } },
                { "$expr": { "$eq": [{ "$month": "$fecha" }, mes] } },
                { "$expr": { "$eq": [{ "$year": "$fecha" }, anio] } },
                { "serial": serial }
            ]
        };
        const [historicoDia, historicoPrimerDia] = await Promise.all([
            EnergiasMedidor.find(queryNextMonth).sort({ "fecha": 1 }).limit(1),
            EnergiasMedidor.find(queryCurrentMonth).sort({ "fecha": 1 }).limit(1)
        ]);

        let energiaMensual = 0.0;

        if (historicoDia.length !== 0 && historicoPrimerDia.length !== 0) {
            energiaMensual = parseFloat(historicoDia[0].energiaActivaTotal.DataVal - historicoPrimerDia[0].energiaActivaTotal.DataVal).toFixed(2);
        }


        if (energiaMensual < 0) {
            energiaMensual = 0;
        }
        return parseFloat(energiaMensual)


    } catch (error) {
        throw `${errorMessages.DATABASE_QUERY_ERROR}: ${error.message}`;
    }
}