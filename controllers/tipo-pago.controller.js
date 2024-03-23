const { request, response } = require('express')
const { TipoPago } = require('../models');

const obtenerTipoPagos = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, tipoPagos] = await Promise.all([
        TipoPago.countDocuments(),
        TipoPago.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: tipoPagos,
        total,

    });
}


const obtenerTipoPago = async(req = request, res = response) => {
    const { id } = req.params
    const tipoPago = await TipoPago.findById(id)
    res.json({
        ok: true,
        datos: tipoPago
    });
}

const actualizarTipoPago = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, pago } = req.body;


    const newTipoPago = await TipoPago.findByIdAndUpdate(id, pago);
    newTipoPago.pago = pago

    res.json({
        ok: true,
        datos: newTipoPago

    });

}

const crearTipoPago = async(req = request, res = response) => {
    const { pago } = req.body;
    const newTipoPago = new TipoPago({ pago });

    await newTipoPago.save();

    res.json({
        ok: true,
        msg: 'Tipo de pago fue creado correctamente',
        datos: newTipoPago

    });
}

const eliminarTipoPago = async(req = request, res = response) => {
    const { id } = req.params;
    const tipoPago = await TipoPago.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: tipoPago
    });
}

module.exports = {
    obtenerTipoPagos,
    obtenerTipoPago,
    actualizarTipoPago,
    crearTipoPago,
    eliminarTipoPago
}