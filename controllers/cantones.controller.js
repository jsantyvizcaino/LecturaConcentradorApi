const { request, response } = require('express');
const { Canton } = require('../models');

const obtenerCantones = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, canton] = await Promise.all([
        Canton.countDocuments(),
        Canton.find()
        .populate('provincia', 'nombre')
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: canton,
        total,

    });
}


const obtenerCanton = async(req = request, res = response) => {
    const { id } = req.params
    const canton = await Canton.findById(id).populate('provincia', 'nombre')
    res.json({
        ok: true,
        datos: canton
    });
}

const actualizarCanton = async(req = request, res = response) => {
    const { id } = req.params
    const { provincia, ...resto } = req.body;

    const actualizado = await Canton.findByIdAndUpdate(id, resto);
    res.json({
        ok: true,
        datos: actualizado

    });

}


const crearCanton = async(req = request, res = response) => {
    const { nombre, provincia } = req.body;
    const nuevo = new Canton({ nombre, provincia });

    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Canton creado correctamente',
        datos: nuevo

    });
}

const eliminarCanton = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await Canton.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}

module.exports = {
    obtenerCantones,
    obtenerCanton,
    actualizarCanton,
    crearCanton,
    eliminarCanton
}