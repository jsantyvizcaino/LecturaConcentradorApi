const { request, response } = require('express')
const { Cliente } = require('../models')
const bcryptjs = require('bcryptjs')


const obtenerClientes = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;
    const query = { estado: true }

    const [total, clientes] = await Promise.all([
        Cliente.countDocuments(query),
        Cliente.find(query).populate('role', 'role')
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: clientes,
        total,
    });
}


const obtenerCliente = async(req = request, res = response) => {
    const { id } = req.params
    const cliente = await Cliente.findById(id).populate('role', 'role')
    res.json({
        ok: true,
        datos: cliente
    });
}

const crearCliente = async(req = request, res = response) => {
    const { username, nombre, apellido, correo, password, cedula, role } = req.body;
    const cliente = new Cliente({ username, nombre, apellido, correo, password, cedula, role });
    const salt = bcryptjs.genSaltSync(10);
    cliente.password = bcryptjs.hashSync(password, salt)

    await cliente.save();

    res.json({
        ok: true,
        msg: 'Cliente creado correctamente',
        datos: cliente
    });
}


const actualizarCliente = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, password, google, correo, ...resto } = req.body;

    if (password) {
        const salt = bcryptjs.genSaltSync(10);
        resto.password = bcryptjs.hashSync(password, salt)
    }

    const cliente = await Cliente.findByIdAndUpdate(id, resto);

    res.json({
        ok: true,
        datos: cliente
    });

}

const clientePatch = (req = request, res = response) => {
    res.json({
        ok: true,
        msg: 'salio patch controlador'
    });
}

const obtenerClienteByMedidor = async(cedula = '') => {

    const query = { cedula }
    const cliente = await Cliente.findOne(query);
    return cliente
}

const eliminarCliente = async(req = request, res = response) => {
    const { id } = req.params;
    //obtener el usuario autenticado
    //const usuarioAutenticado = req.usuario;
    const cliente = await Cliente.findByIdAndUpdate(id, { estado: false });
    cliente.estado = false
    res.json({
        ok: true,
        datos: cliente
    });
}

module.exports = {
    obtenerClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    obtenerClienteByMedidor
}