const { request, response } = require('express');
const { TablaPagos } = require('../models');



const crearPagos = async(req = request, res = response) => {

    const newpago = new TablaPagos(req.body);

    await newpago.save();

    res.json({
        ok: true,
        msg: 'Tabla de Pagos creado correctamente',
        datos: newpago

    });
}

const obtenerPagosByPropeties = async(req = request, res = response) => {

    const { region, grupoConsumo } = req.query
    const tabla = await TablaPagos.findOne({ region, grupoConsumo })

    res.json({
        ok: true,
        datos: tabla

    });
}


module.exports = {
    crearPagos,
    obtenerPagosByPropeties
}