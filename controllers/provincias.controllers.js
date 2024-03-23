const { request, response } = require('express');
const { Provincia } = require('../models');

const obtenerProvincias = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, provincia] = await Promise.all([
        Provincia.countDocuments(),
        Provincia.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: provincia,
        total,

    });
}


const obtenerProvincia = async(req = request, res = response) => {
    const { id } = req.params
    const provincia = await Provincia.findById(id)
    res.json({
        ok: true,
        datos: provincia
    });
}

const actualizarProvincia = async(req = request, res = response) => {
    const { id } = req.params
    const { nombre } = req.body;


    const actualizado = await Provincia.findByIdAndUpdate(id, nombre);
    actualizado.nombre = nombre;
    res.json({
        ok: true,
        datos: actualizado

    });

}


const crearProvincia = async(req = request, res = response) => {
    const { nombre } = req.body;
    const nuevo = new Provincia({ nombre });

    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Provincia creado correctamente',
        datos: nuevo

    });
}

const eliminarProvincia = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await Provincia.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}

module.exports = {
    obtenerProvincias,
    obtenerProvincia,
    actualizarProvincia,
    crearProvincia,
    eliminarProvincia
}