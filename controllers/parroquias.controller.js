const { request, response } = require('express');
const { Parroquia } = require('../models');

const obtenerParroquias = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, parroquia] = await Promise.all([
        Parroquia.countDocuments(),
        Parroquia.find()
        .populate('provincia', 'nombre')
        .populate('canton', 'nombre')
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: parroquia,
        total,

    });
}


const obtenerParroquia = async(req = request, res = response) => {
    const { id } = req.params
    const parroquia = await Parroquia.findById(id).populate('provincia', 'nombre').populate('canton', 'nombre')
    res.json({
        ok: true,
        datos: parroquia
    });
}

const actualizarParroquia = async(req = request, res = response) => {
    const { id } = req.params;
    const { canton, provincia, ...resto } = req.body;


    const actualizado = await Parroquia.findByIdAndUpdate(id, resto);
    res.json({
        ok: true,
        datos: actualizado

    });

}


const crearParroquia = async(req = request, res = response) => {
    const { nombre, canton, provincia } = req.body;
    const nuevo = new Parroquia({ nombre, canton, provincia });

    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Parroquia creado correctamente',
        datos: nuevo

    });
}

const eliminarParroquia = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await Parroquia.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}

module.exports = {
    obtenerParroquias,
    obtenerParroquia,
    actualizarParroquia,
    crearParroquia,
    eliminarParroquia
}