const cron = require('node-cron');
const moment = require('moment');
moment.locale('es');
const { ObjectId } = require('mongoose').Types;
const { obtenerFrecuenciaCron, crearParametrosMedidor, obtenerMedidoresService, crearEnergiaMedidor, obtenerClienteByMedidor, envioCorreoService } = require('../controllers');
const collectorApi = require('../services/collectorApi');
const { Usuario, Concentrador, Medidor, ParametrosMedidor, EnergiasMedidor, EnergiasHistorico } = require('../models');


const path = require("path");
const fs = require("fs");
const handlebars = require("handlebars");
const { crearHistoricoMedidorMensual, obtenerHistoricosBySerialService, actulizarHistoricoMedidorMensual } = require('../services/historico.servicio');
const minuto = 1

const eActivaTotal = 'Energy(A+)'
const eReactivaTotal = 'Energy(R+)'
const mDemanda = 'Maximum demand and occurrence time'


const lecturaFrecuencia = () => {
    cron.schedule('0 */1 * * *', async() => {

        const concentradorCadaHora = await obtenerFrecuenciaCron(1)
        let medidores = []

        for (const concentrador of concentradorCadaHora) {
            const salida = await buscarMedidoresByConcentrador(concentrador._id)
            medidores.push(...salida)
        }

        for (const medidor of medidores) {
            //leerParametrosMedidoresTiempoReal(medidor.serial)

        }
    });
}

const lecturaFacturacion = () => {
    cron.schedule(`0 0,8,16 * * *`, async() => {
        try {
            const medidores = await obtenerMedidoresService();
            console.log(medidores.length);

            let errores = [];
            let intentos = 0;

            for (const medidor of medidores) {
                try {
                    var res = await leerEnergiaMedidores(medidor.serial);
                    if (!res) {
                        errores.push(medidor.serial);
                    }
                } catch (error) {
                    console.error("Error al leer energía para el medidor", medidor.serial, ":", error);
                    errores.push(medidor.serial);
                }
            }

            do {
                let medidores = [...errores];
                errores = [];

                for (const serial of medidores) {
                    console.log("Reintentando lectura para el medidor", serial);
                    try {
                        const res = await leerEnergiaMedidores(serial);
                        if (!res) {
                            console.error("Error en la lectura del medidor", serial, ": No se pudo leer correctamente.");
                            errores.push(serial);
                        }
                    } catch (error) {
                        console.error("Error en la lectura del medidor", serial, ":", serial);
                        errores.push(serial);
                    }
                }
                intentos++;
            } while (errores.length > 0 && intentos < 3);


        } catch (error) {
            console.error("Error al obtener medidores:", error);
        }
    });
}


const creacionHistoricosMensuales = () => {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth()
    const meses30 = [3, 6, 8, 10]
    let dia = 31;
    if (mesActual == 1) {
        dia = 28
    } else if (meses30.includes(mesActual)) {
        dia = 30
    }

    cron.schedule(`0 0 1 * *`, async() => {
        //cron.schedule(`*/20 * * * * *`, async() => {
        const medidores = await obtenerMedidoresService()

        for (const medidor of medidores) {
            const id = medidor['_id']
            const serial = medidor.serial
            const consumo = await consumoByMedidor(serial)
            const data = {
                fecha: fechaActual,
                electricMeterID: id,
                serial,
                maximaDemanda: '',
                consumoInicialMes: consumo
            }
            await crearHistoricoMedidorMensual(data)
        }
    });
    //maxima demanda mesual
    cron.schedule('59 23 * * *', async() => {
        //cron.schedule(`*/20 * * * * *`, async() => {
        const currentDate = moment();
        const lastDayOfMonth = currentDate.endOf('month').date();

        if (currentDate.date() === lastDayOfMonth) {
            const medidores = await obtenerMedidoresService()

            for (const medidor of medidores) {
                const serial = medidor.serial
                const maximaDemanda = await maximaDemandaByMedidor(serial)
                const historico = await obtenerHistoricosBySerialService(serial)
                const data = {
                    id: historico['_id'],
                    maximaDemanda
                }
                await actulizarHistoricoMedidorMensual(data)
            }
        }
    });
}

const lecturaConcentrador = () => {
    cron.schedule(`0 8 * * *`, async() => {
        const medidores = await obtenerMedidoresService()
        for (const medidor of medidores) {
            leerEnergiaMedidores(medidor.serial)
            leerParametrosMedidoresTiempoReal(medidor.serial)
        }
    });
}

const envioCorreoMaximaDemanda = () => {
    const mesActual = new Date().getMonth() + 1
    cron.schedule(`0 8 * * *`, async() => {


        const filePath = path.join(__dirname, "../email/maximaDemanda.html");

        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handlebars.compile(source);

        const medidores = await obtenerMedidoresService()
        for (const medidor of medidores) {
            const { cedula, serial } = medidor;
            if (cedula) {
                const energiaLeida = await obtenerEnergiaMedidores(serial)
                const maximaDemanda = energiaLeida['maximaDemanda']['DataVal'];

                const { correo, nombre } = await obtenerClienteByMedidor(cedula)
                const valorReferencia = await EnergiasHistorico.findOne({
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$fecha" }, mesActual] },
                            { $eq: ["$serial", serial] }
                        ]
                    }
                })

                const nuevaMaximaDemanda = maximaDemanda.split(' ')[0]

                const cadenaFecha = maximaDemanda.split(' ')[1] + ' ' + maximaDemanda.split(' ')[2];
                const partes = cadenaFecha.split(/[-\s:]/);

                const año = 2000 + parseInt(partes[0]);
                const mes = parseInt(partes[1]) - 1; // Restar 1 al mes (los meses en JavaScript van de 0 a 11)
                const dia = parseInt(partes[2]);
                const hora = parseInt(partes[3]);
                const minutos = parseInt(partes[4]);
                const fecha = new Date(año, mes, dia, hora, minutos);


                if (!valorReferencia) {
                    const newHistorico = {
                        electricMeterID: medidor['_id'],
                        maximaDemanda: nuevaMaximaDemanda,
                        fecha: fecha,
                        serial,
                    }

                    const historico = new EnergiasHistorico(newHistorico)
                    await historico.save();
                }


                if (nuevaMaximaDemanda > valorReferencia.maximaDemanda) {
                    const id = valorReferencia['_id']
                    const data = {
                        maximaDemanda: nuevaMaximaDemanda
                    };
                    const actualizado = await EnergiasHistorico.findByIdAndUpdate(id, data);

                    const año = valorReferencia.fecha.getFullYear();
                    const mes = valorReferencia.fecha.getMonth() + 1; // Meses se indexan desde 0
                    const día = valorReferencia.fecha.getDate();
                    const hora = valorReferencia.fecha.getHours();
                    const minutos = valorReferencia.fecha.getMinutes();
                    const segundos = valorReferencia.fecha.getSeconds();
                    const replacements = {
                        nombre: nombre,
                        mes: mes,
                        anio: año,
                        hora: hora,
                        minuto: minutos
                    };
                    const htmlToSend = template(replacements);
                    const correo = await envioCorreoService('jorge_santiagovizcaino@hotmail.com', 'Máxima demanda de energía', htmlToSend)
                }
            }
        }
    });


}

const envioCorreoEnergiaConsumidaSemanal = () => {
    const mesActual = new Date().getMonth()
    const fechaActual = moment(); // Obtener la fecha actual
    const semanaAnterior = fechaActual.subtract(1, 'weeks'); // Restar una semana
    const numeroSemanaAnterior = semanaAnterior.week();
    const numeroSemanaEnMes = semanaAnterior.week() - semanaAnterior.clone().startOf('month').week() + 1;


    cron.schedule('0 9 * * 1', async() => {
        const filePath = path.join(__dirname, "../email/energiaConsumida.html");
        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handlebars.compile(source);
        const startDate = moment().subtract(1, 'week').startOf('isoWeek').toDate();
        const endDate = moment().subtract(1, 'week').endOf('week').toDate();
        const medidores = await obtenerMedidoresService()
        for (const medidor of medidores) {

            const { cedula, serial } = medidor;

            if (cedula) {
                const { correo, nombre } = await obtenerClienteByMedidor(cedula)
                const lecturas = await EnergiasMedidor.find({
                    fecha: {
                        $gte: startDate,
                        $lte: endDate
                    },
                    serial: serial
                })

                const mapaDeDias = {};

                lecturas.forEach(objeto => {
                    const fecha = objeto.fecha;
                    const dia = fecha.getDate();
                    const diaDeLaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });

                    if (!mapaDeDias[diaDeLaSemana.toString()]) {
                        mapaDeDias[diaDeLaSemana.toString()] = [];
                    }

                    mapaDeDias[diaDeLaSemana.toString()].push(Number(objeto.energiaActivaTotal.DataVal))
                });

                const promediosPorDia = {};

                for (const dia in mapaDeDias) {
                    const valores = mapaDeDias[dia];
                    const suma = valores.reduce((acumulador, valor) => acumulador + valor, 0);
                    const promedio = suma / valores.length;
                    promediosPorDia[dia] = promedio;
                }

                const { lunes, martes, miércoles: miercoles, jueves, viernes, sabado, domingo } = promediosPorDia

                const todosLosPromedios = Object.values(promediosPorDia);
                const sumaTotal = todosLosPromedios.reduce((acumulador, promedio) => acumulador + promedio, 0);
                const promedioGeneral = (sumaTotal / todosLosPromedios.length).toFixed(2);

                const nombreMes = moment().month(mesActual).format('MMMM');

                const replacements = {
                    nombre: nombre,
                    mes: nombreMes,
                    anio: 2024,
                    lunes,
                    martes,
                    miercoles,
                    jueves,
                    viernes,
                    sabado,
                    domingo,
                    numeroSemana: numeroSemanaEnMes,
                    promedio: promedioGeneral

                };
                console.log(replacements)
                const htmlToSend = template(replacements);
                const correoEnviado = await envioCorreoService('jorge_santiagovizcaino@hotmail.com', 'Máxima demanda de energía', htmlToSend)
            }



        }
    })
}

const buscarMedidoresByConcentrador = async(search = '') => {
    const isMongoId = ObjectId.isValid(search)


    if (isMongoId) {
        existeConcentrador = await Concentrador.findById(search)


        if (!existeConcentrador) {
            return []
        }

        const medidores = await Medidor.find({
            concentrador: search
        });

        if (medidores) {
            return medidores
        }
    }

    return []
}

const leerParametrosMedidoresTiempoReal = async(serial = '') => {
    const cuerpo = {
        serial,
        Token: 'zj4GnyUmU+A=',
    }

    const { data } = await collectorApi.post('/RealTimeParamRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    // var estado = 'success'
    // var respuesta = [{
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "PFc",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.9"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.678",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "PFa",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.897"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "1.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "PFb",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.897"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Reactive Pc",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.893"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.669",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "PF total",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.893"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Active Pc",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.89"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.003",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Reactive P total",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.89"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.003",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Reactive Pa",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.89"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Reactive Pb",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.89"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.008",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Active Pa",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.887"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Active Pb",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.887"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase c current",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.883"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.008",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Active P total",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.883"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.0",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase b voltage",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.88"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.0",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase c voltage",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.88"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.102",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase a current",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.88"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase b current",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.88"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "124.3",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase a voltage",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.877"
    //     }
    // ]


    if (estado === 'error') return;

    const valores = Object.values(respuesta);
    const PFa = valores.filter(x => x.ParamName === 'PFa')[0];
    const PFb = valores.filter(x => x.ParamName === 'PFb')[0];
    const PFc = valores.filter(x => x.ParamName === 'PFc')[0];
    const PFtotal = valores.filter(x => x.ParamName === 'PF total')[0];
    const ActivePa = valores.filter(x => x.ParamName === 'Active Pa')[0];
    const ActivePb = valores.filter(x => x.ParamName === 'Active Pb')[0];
    const ActivePc = valores.filter(x => x.ParamName === 'Active Pc')[0];
    const ActivePtotal = valores.filter(x => x.ParamName === 'Active P total')[0];
    const ReactivePa = valores.filter(x => x.ParamName === 'Reactive Pa')[0];
    const ReactivePb = valores.filter(x => x.ParamName === 'Reactive Pb')[0];
    const ReactivePc = valores.filter(x => x.ParamName === 'Reactive Pc')[0];
    const ReactivePtotal = valores.filter(x => x.ParamName === 'Reactive P total')[0];
    const PhaseAvoltage = valores.filter(x => x.ParamName === 'Phase a voltage')[0];
    const PhaseBvoltage = valores.filter(x => x.ParamName === 'Phase b voltage')[0];
    const PhaseCvoltage = valores.filter(x => x.ParamName === 'Phase c voltage')[0];
    const PhaseAcurrent = valores.filter(x => x.ParamName === 'Phase a current')[0];
    const PhaseBcurrent = valores.filter(x => x.ParamName === 'Phase b current')[0];
    const PhaseCcurrent = valores.filter(x => x.ParamName === 'Phase c current')[0];
    const dataRes = {
        fecha: Date.now(),
        serial,
        PFa,
        PFb,
        PFc,
        PFtotal,
        ActivePa,
        ActivePb,
        ActivePc,
        ActivePtotal,
        ReactivePa,
        ReactivePb,
        ReactivePc,
        ReactivePtotal,
        PhaseAvoltage,
        PhaseBvoltage,
        PhaseCvoltage,
        PhaseAcurrent,
        PhaseBcurrent,
        PhaseCcurrent,
    }

    await crearParametrosMedidor(dataRes)
}

const leerEnergiaMedidores = async(serial = '') => {

    const fechaActual = new Date(Date.now());
    const eActivaTotal = 'Energy(A+)'
    const eReactivaTotal = 'Energy(R+)'
    const mDemanda = 'Maximum demand and occurrence time'
    const cuerpo = {
        DeviceAddr: serial,
        Token: 'zj4GnyUmU+A=',
    }

    console.log('inicio pedido')
    const { data } = await collectorApi.post('/EnergyRead', cuerpo)
    console.log(data)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    // var estado = 'success'
    // var respuesta = [{
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "28.40",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Energy(A+)",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:45:32.803"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "15.73",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Energy(R+)",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:45:32.803"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.0120 23-10-15 10:45",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Maximum demand and occurrence time",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:45:32.803"
    //     }
    // ]

    console.log(mensaje)
    if (estado === 'error') return false;
    const valores = Object.values(respuesta);
    const energiaActivaTotal = valores.filter(x => x.ParamName === eActivaTotal)[0];
    const energiaReactivaTotal = valores.filter(x => x.ParamName === eReactivaTotal)[0];
    const maximaDemanda = valores.filter(x => x.ParamName === mDemanda)[0];

    const dataRes = {
        fecha: fechaActual.setUTCHours(fechaActual.getUTCHours() - 5),
        serial,
        energiaActivaTotal,
        energiaReactivaTotal,
        maximaDemanda,
    }

    await crearEnergiaMedidor(dataRes)
    return true;
}

const maximaDemandaByMedidor = async(serial = '') => {

    const mDemanda = 'Maximum demand and occurrence time'
    const cuerpo = {
        DeviceAddr: serial,
        Token: 'zj4GnyUmU+A=',
    }

    const { data } = await collectorApi.post('/EnergyRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    // var estado = 'success'
    // var respuesta = [{
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "60.0000 2f-30-71 9a:2f",
    //         "ConID": "000075500001",
    //         "ParamName": "Maximum demand and occurrence time",
    //         "CreationTime": "2023-11-05T03:17:43.217"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.00",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(R-)",
    //         "CreationTime": "2023-11-05T03:17:43.16"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "100.00",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(R+)",
    //         "CreationTime": "2023-11-05T03:17:43.157"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "231103.17",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(R)",
    //         "CreationTime": "2023-11-05T03:17:42.883"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "250001.20",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(A-)",
    //         "CreationTime": "2023-11-05T03:17:41.32"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "15.85",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(A+)",
    //         "CreationTime": "2023-11-05T03:17:37.427"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "28.79",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(A)",
    //         "CreationTime": "2023-11-05T03:17:36.093"
    //     }
    // ]

    if (estado === 'error') return
    const valores = Object.values(respuesta);
    const maximaDemanda = valores.filter(x => x.ParamName === mDemanda)[0];
    return maximaDemanda['DataVal']
}

const consumoByMedidor = async(serial = '') => {

    const eActivaTotal = 'Energy(A+)'
    const cuerpo = {
        DeviceAddr: serial,
        Token: 'zj4GnyUmU+A=',
    }

    const { data } = await collectorApi.post('/EnergyRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    // var estado = 'success'
    // var respuesta = [{
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "60.0000 2f-30-71 9a:2f",
    //         "ConID": "000075500001",
    //         "ParamName": "Maximum demand and occurrence time",
    //         "CreationTime": "2023-11-05T03:17:43.217"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.00",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(R-)",
    //         "CreationTime": "2023-11-05T03:17:43.16"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "100.00",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(R+)",
    //         "CreationTime": "2023-11-05T03:17:43.157"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "231103.17",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(R)",
    //         "CreationTime": "2023-11-05T03:17:42.883"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "250001.20",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(A-)",
    //         "CreationTime": "2023-11-05T03:17:41.32"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "15.85",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(A+)",
    //         "CreationTime": "2023-11-05T03:17:37.427"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "28.79",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(A)",
    //         "CreationTime": "2023-11-05T03:17:36.093"
    //     }
    // ]

    if (estado === 'error') return 0;
    const valores = Object.values(respuesta);
    const energiaActivaTotal = valores.filter(x => x.ParamName === eActivaTotal)[0];

    return energiaActivaTotal['DataVal'];
}

const obtenerEnergiaMedidores = async(serial = '') => {
    const eActivaTotal = 'Energy(A+)'
    const eReactivaTotal = 'Energy(R+)'
    const mDemanda = 'Maximum demand and occurrence time'
    const cuerpo = {
        serial,
        Token: 'zj4GnyUmU+A=',
    }

    const { data } = await collectorApi.post('/EnergyRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    // var estado = 'success'
    // var respuesta = [{
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "28.40",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Energy(A+)",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:45:32.803"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "15.73",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Energy(R+)",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:45:32.803"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.0127 23-10-15 10:45",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Maximum demand and occurrence time",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:45:32.803"
    //     }
    // ]

    if (estado === 'error') return
    const valores = Object.values(respuesta);
    const energiaActivaTotal = valores.filter(x => x.ParamName === eActivaTotal)[0];
    const energiaReactivaTotal = valores.filter(x => x.ParamName === eReactivaTotal)[0];
    const maximaDemanda = valores.filter(x => x.ParamName === mDemanda)[0];

    return {
        fecha: Date.now(),
        serial,
        energiaActivaTotal,
        energiaReactivaTotal,
        maximaDemanda,
    }


}

module.exports = {
    lecturaFrecuencia,
    lecturaFacturacion,
    lecturaConcentrador,
    envioCorreoMaximaDemanda,
    envioCorreoEnergiaConsumidaSemanal,
    creacionHistoricosMensuales
}