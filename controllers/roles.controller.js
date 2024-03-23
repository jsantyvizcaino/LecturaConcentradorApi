const { request, response } = require('express')
const Role = require("../models/role")

const obtenerRoles = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, roles] = await Promise.all([
        Role.countDocuments(),
        Role.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: roles,
        total,

    });
}


const obtenerRole = async(req = request, res = response) => {
    const { id } = req.params
    const role = await Role.findById(id)
    res.json({
        ok: true,
        datos: role
    });
}

const actualizarRole = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, role } = req.body;


    const newRole = await Role.findByIdAndUpdate(id, role);
    newRole.role = role

    res.json({
        ok: true,
        datos: newRole

    });

}


const crearRole = async(req = request, res = response) => {
    const { role } = req.body;
    const newRole = new Role({ role });

    await newRole.save();

    res.json({
        ok: true,
        msg: 'Role creado correctamente',
        datos: newRole

    });
}

const eliminarRole = async(req = request, res = response) => {
    const { id } = req.params;
    const role = await Role.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: role
    });
}

module.exports = {
    obtenerRoles,
    obtenerRole,
    actualizarRole,
    crearRole,
    eliminarRole
}