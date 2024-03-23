const { response, request } = require('express');
const jwt = require('jsonwebtoken');

const { Usuario } = require('../models');


const validarJWT = async(req = request, res = response, next) => {

    const token = req.header("token");
    if (!token) return res.status(401).json({ ok: false, msg: 'Se necesita token' })
    try {

        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        const usuario = await Usuario.findById(uid)
        if (!usuario) return res.status(401).json({ ok: false, msg: 'token no valido' })

        //req.uid=uid; // agrego la propiedd uid a la request

        if (!usuario.estado) return res.status(401).json({ ok: false, msg: 'token no valido' })

        req.usuario = usuario;
        next();
    } catch (error) {
        console.log(error)
        res.status(401).json({ ok: false, msg: 'Token no valido' })
    }


}


module.exports = {
    validarJWT
}