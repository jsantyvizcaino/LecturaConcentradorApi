const { request, response } = require('express');
const { Barrio } = require('../models');

const obtenerBarrios = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, barrio] = await Promise.all([
        Barrio.countDocuments(),
        Barrio.find()
        .populate('provincia', 'nombre')
        .populate('canton', 'nombre')
        .populate('parroquia', 'nombre')
        .populate('ciudad', 'nombre')
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: barrio,
        total,

    });
}


const obtenerBarrio = async(req = request, res = response) => {
    const { id } = req.params
    const barrio = await Barrio.findById(id).populate('provincia', 'nombre')
        .populate('canton', 'nombre')
        .populate('parroquia', 'nombre')
        .populate('ciudad', 'nombre')
    res.json({
        ok: true,
        datos: barrio
    });
}

const actualizarBarrio = async(req = request, res = response) => {
    const { id } = req.params
    const { nombre } = req.body;


    const actualizado = await Barrio.findByIdAndUpdate(id, nombre);
    actualizado.nombre = nombre;
    res.json({
        ok: true,
        datos: actualizado

    });

}


const crearBarrio = async(req = request, res = response) => {
    const { nombre, parroquia, canton, ciudad, provincia } = req.body;
    const nuevo = new Barrio({ nombre, parroquia, canton, ciudad, provincia });

    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Barrio creado correctamente',
        datos: nuevo

    });
}

const eliminarBarrio = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await Barrio.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}

module.exports = {
    obtenerBarrio,
    obtenerBarrio,
    actualizarBarrio,
    crearBarrio,
    eliminarBarrio,
    obtenerBarrios
}