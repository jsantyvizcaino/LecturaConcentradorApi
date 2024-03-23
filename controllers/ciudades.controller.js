const { request, response } = require('express');
const { Ciudad } = require('../models');


const obtenerCiudades = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, ciudad] = await Promise.all([
        Ciudad.countDocuments(),
        Ciudad.find()
        .populate('provincia', 'nombre')
        .populate('canton', 'nombre')
        .populate('parroquia', 'nombre')
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: ciudad,
        total,

    });
}


const obtenerCiudad = async(req = request, res = response) => {
    const { id } = req.params
    const ciudad = await Ciudad.findById(id).populate('provincia', 'nombre')
        .populate('canton', 'nombre')
        .populate('parroquia', 'nombre')

    res.json({
        ok: true,
        datos: ciudad
    });
}

const actualizarCiudad = async(req = request, res = response) => {
    const { id } = req.params
    const { parroquia, canton, provincia, ...resto } = req.body;


    const actualizado = await Ciudad.findByIdAndUpdate(id, resto);
    actualizado.nombre = nombre;
    res.json({
        ok: true,
        datos: actualizado

    });

}


const crearCiudad = async(req = request, res = response) => {
    const { nombre, parroquia, canton, provincia } = req.body;

    const nuevo = new Ciudad({ nombre, parroquia, canton, provincia });

    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Ciudad creado correctamente',
        datos: nuevo

    });
}

const eliminarCiudad = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await Ciudad.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}

module.exports = {
    obtenerCiudades,
    obtenerCiudad,
    actualizarCiudad,
    crearCiudad,
    eliminarCiudad
}