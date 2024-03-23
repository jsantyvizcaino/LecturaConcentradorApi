const { request, response } = require('express');
const { EnergiasHistorico } = require('../models');
const {
    obtenerHistoricoMensualService,
    obtenerHistoricoKwHDiaroMensualBySerialService,
    obtenerValoresKwHDiaroMensualBySerialService,
    obtenerHistoricoKwHMesAnualBySerialService,
    obtenerValoresKwHMesAnualBySerialService,
} = require('../services/historico.servicio');


const obtenerMaximaDemanda = async(req = request, res = response) => {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    const { top = 0, skip = 10, mes = mesActual, anio = anioActual, dia, serial } = req.body;

    let query = {}
    if (dia === undefined) {
        query = {
            fecha: {
                $gte: new Date(anio, mes - 1, 1),
                $lt: new Date(anio, mes, 1)
            },
            serial: serial
        }
    } else {
        fechaInicio = new Date(anio, mes - 1, dia, 0, 0, 0, 0)
        fechafin = new Date(anio, mes - 1, dia + 1, 0, 0, 0, 0)
        query = {
            fecha: {
                $gte: fechaInicio,
                $lt: fechafin
            },
            serial: serial
        }
    }

    const [total, datos] = await Promise.all([
        EnergiasHistorico.countDocuments(query),
        EnergiasHistorico.find(query)
        .sort("fecha")
        //.skip(top)
        //.limit(skip)
    ]);

    res.json({
        ok: true,
        datos,
        total,

    });
}

const obtenerHistoricoMensualMedidor = async(req = request, res = response) => {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();

    const { mes, anio = anioActual, serial } = req.body;

    const salida = await obtenerHistoricoMensualService(serial, anio, mes);


    res.json({
        ok: salida ? true : false,
        datos: salida ? salida : 'No hay registros para este cálculo'


    });
}
const obtenerHistoricoMensualMedidorByDia = async(req = request, res = response) => {
    const anioActual = new Date().getFullYear();
    const mesActual = new Date().getMonth() + 1;

    const { mes = mesActual, anio = anioActual, serial } = req.body;

    try {
        const salida = await obtenerHistoricoKwHDiaroMensualBySerialService(serial, anio, mes);


        res.json({
            ok: salida ? true : false,
            datos: salida ? salida.historico : 'No hay registros para este cálculo',
            total: salida ? salida.total : 0
        });
    } catch (error) {
        res.status(500).json({ ok: false, msg: error });
    }
}

const obtenerValoresMensualMedidorByDia = async(req = request, res = response) => {
    const anioActual = new Date().getFullYear();
    const mesActual = new Date().getMonth() + 1;

    const { mes = mesActual, anio = anioActual, serial } = req.body;

    try {
        const salida = await obtenerValoresKwHDiaroMensualBySerialService(serial, anio, mes);


        res.json({
            ok: salida ? true : false,
            datos: {
                promedioEnergia: salida ? salida.promedioEnergia : 0,
                minimoEnergia: salida ? salida.minimoEnergia : 0,
                maximoEnergia: salida ? salida.maximoEnergia : 0,
                totalEnergia: salida ? salida.totalEnergia : 0
            }
        });
    } catch (error) {
        res.status(400).json({ ok: false, msg: error });
    }
}


const obtenerHistoricoAnualMedidorByMes = async(req = request, res = response) => {
    const anioActual = new Date().getFullYear();

    const { anio = anioActual, serial } = req.body;

    try {
        const salida = await obtenerHistoricoKwHMesAnualBySerialService(serial, anio);

        res.json({
            ok: salida ? true : false,
            datos: salida ? salida : 'No hay registros para este cálculo',
            total: salida ? salida.total : 0
        });
    } catch (error) {
        res.status(500).json({ ok: false, msg: error });
    }
}

const obtenerValoresAnualMedidorByMes = async(req = request, res = response) => {
    const anioActual = new Date().getFullYear();

    const { anio = anioActual, serial } = req.body;

    try {
        const salida = await obtenerValoresKwHMesAnualBySerialService(serial, anio);


        res.json({
            ok: salida ? true : false,
            datos: {
                promedioEnergia: salida ? salida.promedioEnergia : 0,
                minimoEnergia: salida ? salida.minimoEnergia : 0,
                maximoEnergia: salida ? salida.maximoEnergia : 0,
                totalEnergia: salida ? salida.totalEnergia : 0
            }
        });
    } catch (error) {
        res.status(400).json({ ok: false, msg: error });
    }
}



module.exports = {
    obtenerMaximaDemanda,
    obtenerHistoricoMensualMedidor,
    obtenerHistoricoMensualMedidorByDia,
    obtenerValoresMensualMedidorByDia,
    obtenerHistoricoAnualMedidorByMes,
    obtenerValoresAnualMedidorByMes

}