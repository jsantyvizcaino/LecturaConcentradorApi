const { response, request } = require('express');


const esAdminRole = (req = request, res = response, next) => {
    if (!req.usuario) return res.status(500).json({ msg: 'se quire verificar el rol sin validar el token' })
    const { role, nombre } = req.usuario;

    if (role !== 'ADMIN_ROLE') return res.status(401).json({ msg: `Usuario ${nombre} no autorizado` })

    next();
}

const esEmpresaRole = (req = request, res = response, next) => {
    if (!req.usuario) return res.status(500).json({ msg: 'se quire verificar el rol sin validar el token' })
    const { role, nombre } = req.usuario;

    if (role !== 'EMPRESA_ROLE') return res.status(401).json({ msg: `Usuario ${nombre} no autorizado` })

    next();
}

const esRolePermitido = (...roles) => {

    return (req = request, res = response, next) => {
        if (!roles.includes(req.usuario.role)) return res.status(401).json({ msg: `Servicio solo para los roles ${roles} ` })

        //console.log(roles)
        next();
    }
}

module.exports = {
    esAdminRole,
    esRolePermitido,
    esEmpresaRole
}