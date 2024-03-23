const { request, response } = require('express');
const { Vivienda } = require('../models');

const obtenerViviendas = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, vivienda] = await Promise.all([
        Vivienda.countDocuments(),
        Vivienda.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: vivienda,
        total,

    });
}


const obtenerVivienda = async(req = request, res = response) => {
    const { id } = req.params
    const vivienda = await Vivienda.findById(id)
    res.json({
        ok: true,
        datos: vivienda
    });
}

const actualizarVivienda = async(req = request, res = response) => {
    const { id } = req.params
    const { nombre } = req.body;


    const actualizado = await Vivienda.findByIdAndUpdate(id, nombre);
    actualizado.nombre = nombre;
    res.json({
        ok: true,
        datos: actualizado

    });

}


const crearVivienda = async(req = request, res = response) => {
    const { tipoHogar, metros, personas, serial } = req.body;
    const nuevo = new Vivienda({ tipoHogar, metros, personas, serial });

    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Vivienda creado correctamente',
        datos: nuevo

    });
}

const eliminarVivienda = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await Vivienda.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}

module.exports = {
    obtenerViviendas,
    obtenerVivienda,
    actualizarVivienda,
    crearVivienda,
    eliminarVivienda
}