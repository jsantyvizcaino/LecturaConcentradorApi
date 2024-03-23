const { request, response } = require('express')
const Usuario = require("../models/usuario")
const bcryptjs = require('bcryptjs')

const obtenerUsuarios = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;
    const query = { estado: true }

    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query).populate('role', 'role').populate('empresa', 'nombre')
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: usuarios,
        total,
    });
}
const obtenerUsuario = async(req = request, res = response) => {
    const { id } = req.params
    const usuario = await Usuario.findById(id)
        .populate('role', 'role')
        .populate('empresa', 'nombre')
    res.json({
        ok: true,
        datos: usuario
    });
}

const crearUsuario = async(req = request, res = response) => {
    const { username, nombre, apellido, correo, password, role, empresa } = req.body;


    const usuario = new Usuario({ username, nombre, apellido, correo, password, role, empresa });
    const salt = bcryptjs.genSaltSync(10);
    usuario.password = bcryptjs.hashSync(password, salt)

    await usuario.save();

    res.json({
        ok: true,
        msg: 'Usuario creado correctamente',
        datos: usuario
    });
}

const actualizarUsuario = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, password, google, correo, ...resto } = req.body;

    if (password) {
        const salt = bcryptjs.genSaltSync(10);
        resto.password = bcryptjs.hashSync(password, salt)
    }

    const usuario = await Usuario.findByIdAndUpdate(id, resto);

    res.json({
        ok: true,
        datos: usuario
    });

}

const usuariosPatch = (req = request, res = response) => {
    res.json({
        ok: true,
        msg: 'salio patch controlador'
    });
}

const eliminarUsuarios = async(req = request, res = response) => {
    const { id } = req.params;
    //obtener el usuario autenticado
    //const usuarioAutenticado = req.usuario;
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });
    usuario.estado = false
    res.json({
        ok: true,
        datos: usuario
    });
}


module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuarios,
    usuariosPatch
}