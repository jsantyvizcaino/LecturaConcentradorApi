const { response, request } = require('express');
const { Usuario, Cliente } = require("../models");
const bcryptjs = require('bcryptjs');
const { generarJWT, generarJWTCliente } = require('../utils/generar_JWT');

const login = async(req = request, res = response) => {

    const { correo, password } = req.body

    try {
        const usuario = await Usuario.findOne({ correo })
            .populate('empresa', 'nombre')
            .populate('role', 'role');
        if (!usuario) return res.status(400).json({ ok: false, msg: "Usuario / Password incorrectos" })

        if (!usuario.estado) return res.status(400).json({ ok: false, msg: "Usuario / Password incorrectos" })

        const isValidPassword = bcryptjs.compareSync(password, usuario.password)
        if (!isValidPassword) return res.status(400).json({ ok: false, msg: "Usuario / Password incorrectos" })

        console.log(usuario.id)
        const token = await generarJWT(usuario.id)


        res.json({
            ok: true,
            datos: usuario,
            token
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
        })
    }
}


const loginCliente = async(req = request, res = response) => {

    const { correo, password } = req.body

    try {
        const cliente = await Cliente.findOne({ correo });
        if (!cliente) return res.status(400).json({ ok: false, msg: "Correo / Password incorrectos" })

        if (!cliente.estado) return res.status(400).json({ ok: false, msg: "Correo / Password incorrectos" })

        const isValidPassword = bcryptjs.compareSync(password, cliente.password)
        if (!isValidPassword) return res.status(400).json({ ok: false, msg: "Correo / Password incorrectos" })


        const data = {
            uid: cliente._id,
            nombre: `${cliente.nombre} ${cliente.apellido}`,
            cedula: cliente.cedula
        }
        const token = await generarJWTCliente(data)


        res.json({
            ok: true,
            datos: cliente,
            token
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
        })
    }
}

module.exports = {
    login,
    loginCliente

};