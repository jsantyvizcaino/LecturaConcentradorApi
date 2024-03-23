const { request, response } = require('express');
const { Frecuencia } = require('../models');

const obtenerFrecuencias = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, datos] = await Promise.all([
        Frecuencia.countDocuments(),
        Frecuencia.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos,
        total,

    });
}

const obtenerFrecuencia = async(req = request, res = response) => {
    const { id } = req.params
    const datos = await Frecuencia.findById(id)
    res.json({
        ok: true,
        datos
    });
}


const actualizarFrecuencia = async(req = request, res = response) => {
    const { id } = req.params
    const {...resto } = req.body;

    const actualizado = await Canton.findByIdAndUpdate(id, resto);
    res.json({
        ok: true,
        datos: actualizado

    });

}

const crearFrecuencia = async(req = request, res = response) => {
    const { horas, nombre } = req.body;
    const nuevo = new Frecuencia({ horas, nombre });

    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Frecuencia creado correctamente',
        datos: nuevo

    });
}

const eliminarFrecuencia = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await Frecuencia.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}

module.exports = {
    obtenerFrecuencias,
    obtenerFrecuencia,
    actualizarFrecuencia,
    crearFrecuencia,
    eliminarFrecuencia
}