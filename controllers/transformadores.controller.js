const { request, response } = require('express')

const { Transformador } = require("../models");


const obtenerTransformadores = async(req = request, res = response) => {
    const { top = 0, skip = 10 } = req.query;
    const query = { estado: true }

    const [total, transformador] = await Promise.all([
        Transformador.countDocuments(query),
        Transformador.find(query)
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: transformador,
        total,

    });
}


const obtenerTransformador = async(req = request, res = response) => {
    const { id } = req.params
    const transformador = await Transformador.findById(id)
    res.json({
        ok: true,
        datos: transformador
    });
}


const crearTransformador = async(req = request, res = response) => {
    const { serial, ...body } = req.body;
    const existe = await Transformador.findOne({ serial })

    if (existe) {
        return res.status(400).json({ msg: `El Transformador con el ${existe.serial}, ya existe` })
    }

    const data = {
        serial,
        ...body
    }

    //concentrador.password = bcryptjs.hashSync(password, salt)
    const nuevo = new Transformador(data);
    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Transformador creado correctamente',
        datos: nuevo
    });
}


const actualizarTransformador = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, ...resto } = req.body;

    // if (password) {
    //     const salt = bcryptjs.genSaltSync(10);
    //     resto.password = bcryptjs.hashSync(password, salt)
    // }

    const actualizado = await Transformador.findByIdAndUpdate(id, resto);

    res.json({
        ok: true,
        datos: actualizado
    });

}

const eliminarTransformador = async(req = request, res = response) => {
    const { id } = req.params;
    //obtener el usuario autenticado
    //const usuarioAutenticado = req.usuario;
    const eliminado = await Transformador.findByIdAndUpdate(id, { estado: false });
    eliminado.estado = false
    res.json({
        ok: true,
        datos: eliminado

    });
}


module.exports = {
    obtenerTransformadores,
    obtenerTransformador,
    crearTransformador,
    actualizarTransformador,
    eliminarTransformador

}