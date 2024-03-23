const { request, response } = require('express');
const { Empresa } = require('../models');


const obtenerEmpresas = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, empresas] = await Promise.all([
        Empresa.countDocuments(),
        Empresa.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: empresas,
        total,

    });
}

const obtenerEmpresa = async(req = request, res = response) => {
    const { id } = req.params
    const empresa = await Empresa.findById(id)
    res.json({
        ok: true,
        datos: empresa
    });
}


const actualizarEmpresa = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, ...resto } = req.body;


    const actualizar = await Empresa.findByIdAndUpdate(id, resto);


    res.json({
        ok: true,
        datos: actualizar

    });

}

const crearEmpresa = async(req = request, res = response) => {
    const { nombre, ...body } = req.body;
    const existeEmpresa = await Empresa.findOne({ nombre })

    if (existeEmpresa) {
        return res.status(400).json({ msg: `La empresa ${existeEmpresa.nombre}, ya existe` })
    }

    const data = {
        nombre,
        ...body
    }

    //concentrador.password = bcryptjs.hashSync(password, salt)
    const nuevo = new Empresa(data);
    await nuevo.save();

    res.json({
        ok: true,
        msg: 'Empresa creada correctamente',
        datos: nuevo
    });
}

const eliminarEmpresa = async(req = request, res = response) => {
    const { id } = req.params;
    //const eliminar = await Empresa.findByIdAndDelete(id);
    const eliminarLogico = await Empresa.findByIdAndUpdate(id, { estado: false });
    eliminarLogico.estado = false
    res.json({
        ok: true,
        datos: eliminarLogico
    });
}

module.exports = {
    obtenerEmpresa,
    obtenerEmpresas,
    actualizarEmpresa,
    crearEmpresa,
    eliminarEmpresa
}