const { request, response } = require('express');
const { ModeloMedidores } = require('../models');


const obtenerModelos = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, modelos] = await Promise.all([
        ModeloMedidores.countDocuments(),
        ModeloMedidores.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: modelos,
        total,

    });
}

const obtenerModelo = async(req = request, res = response) => {
    const { id } = req.params
    const modelo = await ModeloMedidores.findById(id)

    res.json({
        ok: true,
        datos: modelo
    });
}

const actualizarModelo = async(req = request, res = response) => {
    const { id } = req.params


    const actualizado = await ModeloMedidores.findByIdAndUpdate(id, req.body);
    res.json({
        ok: true,
        datos: actualizado
    });

}

const crearModelo = async(req = request, res = response) => {
    const { nombre, idApiExterna } = req.body;
    const nuevo = new ModeloMedidores({ nombre, idApiExterna });

    const existe = await ModeloMedidores.findOne({ idApiExterna })

    if (existe) {
        return res.status(400).json({ msg: `El modelo con el ${idApiExterna}, ya existe` })
    }

    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Modelo de medidor creado correctamente',
        datos: nuevo

    });
}

const eliminarModelo = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await ModeloMedidores.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}

module.exports = {
    obtenerModelo,
    obtenerModelo,
    actualizarModelo,
    crearModelo,
    eliminarModelo,
    obtenerModelos
}