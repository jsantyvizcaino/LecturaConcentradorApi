const { request, response } = require('express');
const { EnergiasMedidor, Medidor, Concentrador, Empresa, TablaPagos } = require('../models');


const obtenerDatosConsumo = async(req = request, res = response) => {
    try {
        const { serial } = req.body;
        const primerDiaDelMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const query = {
            fecha: { $gte: primerDiaDelMes },
            serial: serial,
        }

        const registro = await EnergiasMedidor
            .findOne(query)
            .sort({ fecha: 1 })

        if (!registro) {
            return res.json({
                ok: true,
                mensaje: 'No se encontraron datos',
            });
        }

        const registroActual = await EnergiasMedidor
            .findOne({
                fecha: { $gte: new Date(new Date().setHours(0, 0, 0, 0)), $lt: new Date(new Date().setHours(23, 59, 59, 999)) },
                serial: serial,
            })
            .sort({ fecha: -1 })

        const valorinicial = parseInt(registro.energiaActivaTotal.DataVal, 10);
        let valorfinal = 0;
        let consumoActual

        if (registroActual) {
            valorfinal = parseInt(registroActual.energiaActivaTotal.DataVal, 10);
            consumoActual = valorfinal - valorinicial;
        } else {
            consumoActual = valorinicial;
        }


        const { grupoConsumo: { grupo }, concentrador: idConcentrador } = await Medidor.findOne({ serial: serial })
            .populate('grupoConsumo', 'grupo')

        const { empresa: idEmpresa } = await Concentrador.findById(idConcentrador);
        const { region: { region } } = await Empresa.findById(idEmpresa).populate('region', 'region');
        const maximaDemandaDelMes = await obtenerMaximaDemandaMes(serial);

        const costoEnergia = await obtenerCostoEnergia(consumoActual, grupo, region);

        const fecha = registroActual ? registroActual.fecha : Date.now();

        const datos = {
            consumoActual,
            grupoConsumo: grupo,
            region: region,
            maximaDemandaDelMes,
            costoEnergia,
            fecha: formatearFecha(fecha),
            pagos: {
                contribucionBomberos: 1.97,
                cargoPorEnergia: parseFloat((costoEnergia * consumoActual).toFixed(2)),
                alumbradoPublico: 2.12,
                cargoComercializacion: 1.41,
                tasaRecoleccionBasura: 4.0,
                subsidioConsumo: 2.12,
                total: 0
            }

        }

        datos.pagos.total = parseFloat(Object.values(datos.pagos).reduce((acc, valor) => {
            return typeof valor === 'number' ? acc + valor : acc;
        }, 0).toFixed(2));

        res.json({
            ok: true,
            datos,
        });

    } catch (error) {
        console.error('Error obtenerDatosConsumo:', error.message);
        res.status(500).json({ ok: false, mensaje: 'Error interno del servidor' });
    }
}


const obtenerMaximaDemandaMes = async(serial) => {
    try {
        const primerDiaDelMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const ultimoDiaDelMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        const resultado = await EnergiasMedidor.find({
                    fecha: {
                        $gte: primerDiaDelMes,
                        $lt: ultimoDiaDelMes
                    },
                    serial: serial,
                },

            ).sort({ 'maximaDemanda.DataVal': -1 }) // Ordena de forma descendente para obtener el máximo valor primero
            .limit(1);
        const maximoValor = resultado.length > 0 ? resultado[0].maximaDemanda.DataVal : null;
        return maximoValor;
    } catch (error) {
        console.error('Error obtenerMaximaDemandaMes:', error.message);
        return null; // O manejar el error según tus necesidades
    }
}

const obtenerCostoEnergia = async(consumo, grupo, region) => {

    const mesesPeriodo1 = [0, 1, 2, 3, 4, 11]
    const mesActual = new Date().getMonth();
    let periodo = null;
    if (region === 'COSTA') {

        if (mesesPeriodo1.includes(mesActual)) {
            periodo = 1;
        }
        periodo = 2;
    }

    const tablaPagos = await TablaPagos.findOne({ region: region, grupoConsumo: grupo, periodo: periodo });

    if (!tablaPagos) {
        console.log('No se encontró la tabla de pagos para los parámetros proporcionados.');
        return null;
    }



    const costoEncontrado = tablaPagos.pago.find(pago => consumo >= pago.min && consumo <= pago.max);

    if (!costoEncontrado) {
        console.log('No se encontró un rango de consumo válido en la tabla de pagos.');
        return null;
    }

    const costo = costoEncontrado.costo;

    return costo;
}

const formatearFecha = (fechaString) => {
    const fechaOriginal = new Date(fechaString);
    const dia = fechaOriginal.getDate().toString().padStart(2, '0');
    const mes = (fechaOriginal.getMonth() + 1).toString().padStart(2, '0'); // Meses en JavaScript van de 0 a 11
    const año = fechaOriginal.getFullYear().toString();
    const horas = fechaOriginal.getHours().toString().padStart(2, '0');
    const minutos = fechaOriginal.getMinutes().toString().padStart(2, '0');

    return `${dia}/${mes}/${año} ${horas}:${minutos}`;
}

module.exports = {
    obtenerDatosConsumo
}