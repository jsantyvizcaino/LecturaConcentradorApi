const { request, response } = require('express');
const { GrupoConsumo } = require('../models');


const obtenerGruposConsumo = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, data] = await Promise.all([
        GrupoConsumo.countDocuments(),
        GrupoConsumo.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: data,
        total,

    });
}


const obtenerGrupoConsumo = async(req = request, res = response) => {
    const { id } = req.params
    const data = await GrupoConsumo.findById(id)
    res.json({
        ok: true,
        datos: data
    });
}

const actualizarGrupoConsumo = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, grupo } = req.body;


    const actualizado = await GrupoConsumo.findByIdAndUpdate(id, grupo);
    actualizado.grupo = grupo

    res.json({
        ok: true,
        datos: actualizado

    });

}


const crearGrupoConsumo = async(req = request, res = response) => {
    const { grupo } = req.body;
    const nuevo = new GrupoConsumo({ grupo });

    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Grupo de consumo creado correctamente',
        datos: nuevo

    });
}

const eliminarGrupoConsumo = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await GrupoConsumo.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}

module.exports = {
    obtenerGruposConsumo,
    obtenerGrupoConsumo,
    actualizarGrupoConsumo,
    crearGrupoConsumo,
    eliminarGrupoConsumo
}