const { response, request } = require('express');
const { ObjectId } = require('mongoose').Types;
const { Usuario, Concentrador, Medidor, Empresa, Provincia, Ciudad, Canton, Parroquia, Barrio, Transformador, EnergiasMedidor, ParametrosMedidor } = require('../models');
const { obtenerMedidorBySerial, obtenerMedidorByCedula } = require('../services/medidores.services');

const coleccionesPermitidas = [
    'usuarios',
    'concentradores',
    'medidores',
    'roles',
    'ciudades',
    'cantones',
    'parroquias',
    'barrios',
    'concentrador-transformador',
    'transformadores-empresa',
    'medidor-cedula',
    'medidor-serial',
]
const coleccionesPermitidasFechas = [
    'energias-medidor',
    'parametros-medidor',

]


const buscarUsuarios = async(search = '', res = response) => {
    const isMongoId = ObjectId.isValid(search)

    if (isMongoId) {
        const usuario = await Usuario.findById(search);
        return res.json({ results: (usuario) ? [usuario] : [] });
    }

    const regex = new RegExp(search, 'i');
    const usuarios = await Usuario.find({
        $or: [{ nombre: regex }, { correo: regex }],
        $and: [{ estado: true }]
    })
    res.json({
        results: usuarios
    });
}


const buscarMedidoresByConcentrador = async(search = '', res = response) => {
    const isMongoId = ObjectId.isValid(search)


    if (isMongoId) {
        existeConcentrador = await Concentrador.findById(search)
        if (!existeConcentrador) {
            return res.status(400).json({
                ok: false,
                msg: "No existe el concentrador",
                datos: null,
            });
        }

        const medidores = await Medidor.find({
                concentrador: search
            }).populate('grupoConsumo', 'grupo')
            .populate('concentrador', 'estado serial parroquia canton barrio latitud longitud')
            .populate('tipoPago', 'pago')
            .populate('modelo', 'nombre idApiExterna');

        if (medidores && medidores.length > 0) {
            return res.json({
                ok: true,
                datos: medidores,
                total: medidores.length
            });
        }
        return res.status(200).json({
            ok: true,
            msg: "No existe medidores asociados a este concentrador",
            datos: [],
        });
    }

    return res.status(400).json({
        ok: false,
        msg: "No existe el concentrador",
        datos: null,
    });
}
const buscarMedidorBySerial = async(search = '', res = response) => {

    if (search !== '') {
        medidor = await obtenerMedidorBySerial(search);
        if (!medidor) {
            return res.status(400).json({
                ok: false,
                msg: `No existe el medidor asociado con el serial: ${search}`,
                datos: null,
            });
        }

        return res.json({
            ok: true,
            datos: medidor,

        });
    }

    return res.status(400).json({
        ok: false,
        msg: "Error al recibir el serial",
        datos: null,
    });
}
const buscarMedidoresByCedula = async(search = '', res = response) => {

    if (search !== '') {
        medidor = await obtenerMedidorByCedula(search);
        if (!medidor) {
            return res.status(400).json({
                ok: false,
                msg: `No existe el medidor asociado con la cédula: ${search}`,
                datos: null,
            });
        }

        return res.json({
            ok: true,
            datos: medidor,

        });
    }

    return res.status(400).json({
        ok: false,
        msg: "Error al recibir la cédula",
        datos: null,
    });
}


const buscarConcentradoresByEmpresa = async(search = '', res = response) => {
    const isMongoId = ObjectId.isValid(search)

    if (isMongoId) {
        existeEmpresa = await Empresa.findById(search)
        if (!existeEmpresa) {
            return res.status(400).json({
                ok: false,
                msg: "No existe la Empresa",
                datos: null,
            });
        }

        const concentradores = await Concentrador.find({
                empresa: search
            }).populate('empresa', 'nombre')
            .populate('region', 'region')
            .populate('provincia', 'nombre')
            .populate('canton', 'nombre')
            .populate('parroquia', 'nombre')
            .populate('ciudad', 'nombre')
            .populate('barrio', 'nombre')
            .populate('frecuencia', 'horas nombre')
            .populate('transformador', 'serial empresa');

        if (concentradores && concentradores.length > 0) {
            return res.json({
                ok: true,
                datos: concentradores,
                total: concentradores.length
            });
        }
        return res.status(200).json({
            ok: true,
            msg: "No existe concentradores asociados a este empresa",
            datos: [],
        });
    }

    return res.status(400).json({
        ok: false,
        msg: "No existe la Empresa",
        datos: null,
    });

}
const buscarTransformadoresByEmpresa = async(search = '', res = response) => {
    const isMongoId = ObjectId.isValid(search)

    if (isMongoId) {
        existeEmpresa = await Empresa.findById(search)
        if (!existeEmpresa) {
            return res.status(400).json({
                ok: false,
                msg: "No existe la Empresa",
                datos: null,
            });
        }

        const concentradores = await Transformador.find({
            empresa: search
        }).populate('empresa', 'nombre');

        if (concentradores && concentradores.length > 0) {
            return res.json({
                ok: true,
                datos: concentradores,
                total: concentradores.length
            });
        }
        return res.status(200).json({
            ok: true,
            msg: "No existe concentradores asociados a este empresa",
            datos: [],
        });
    }

    return res.status(400).json({
        ok: false,
        msg: "No existe la Empresa",
        datos: null,
    });

}


const buscarCiudadByParroquia = async(search = '', res = response) => {
    const isMongoId = ObjectId.isValid(search)


    if (isMongoId) {
        existe = await Parroquia.findById(search)
        if (!existe) {
            return res.status(400).json({
                ok: false,
                msg: `No existe el elemento con el id ${search}`,
                datos: null,
            });
        }

        const respuesta = await Ciudad.find({
                parroquia: search
            }).populate('provincia', 'nombre')
            .populate('canton', 'nombre')
            .populate('parroquia', 'nombre');

        if (respuesta) {
            return res.json({
                ok: true,
                datos: respuesta,
                total: respuesta.length
            });
        }
    }

    return res.status(400).json({
        ok: false,
        msg: "No es un ID valido",
        datos: null,
    });

}
const buscarCantonByProvincia = async(search = '', res = response) => {
    const isMongoId = ObjectId.isValid(search)


    if (isMongoId) {
        existe = await Provincia.findById(search)
        if (!existe) {
            return res.status(400).json({
                ok: false,
                msg: `No existe el elemento con el id ${search}`,
                datos: null,
            });
        }

        const respuesta = await Canton.find({
            provincia: search
        }).populate('provincia', 'nombre');

        if (respuesta) {
            return res.json({
                ok: true,
                datos: respuesta,
                total: respuesta.length
            });
        }
    }

    return res.status(400).json({
        ok: false,
        msg: "No es un ID valido",
        datos: null,
    });

}
const buscarParroquiaByCanton = async(search = '', res = response) => {
    const isMongoId = ObjectId.isValid(search)


    if (isMongoId) {
        existe = await Canton.findById(search)
        if (!existe) {
            return res.status(400).json({
                ok: false,
                msg: `No existe el elemento con el id ${search}`,
                datos: null,
            });
        }

        const respuesta = await Parroquia.find({
                canton: search
            }).populate('provincia', 'nombre')
            .populate('canton', 'nombre');

        if (respuesta) {
            return res.json({
                ok: true,
                datos: respuesta,
                total: respuesta.length
            });
        }
    }

    return res.status(400).json({
        ok: false,
        msg: "No es un ID valido",
        datos: null,
    });

}
const buscarBarrioByCiudad = async(search = '', res = response) => {
    const isMongoId = ObjectId.isValid(search)


    if (isMongoId) {
        existe = await Ciudad.findById(search)
        if (!existe) {
            return res.status(400).json({
                ok: false,
                msg: `No existe el elemento con el id ${search}`,
                datos: null,
            });
        }

        const respuesta = await Barrio.find({
                ciudad: search
            }).populate('provincia', 'nombre')
            .populate('canton', 'nombre')
            .populate('parroquia', 'nombre')
            .populate('ciudad', 'nombre');

        if (respuesta) {
            return res.json({
                ok: true,
                datos: respuesta,
                total: respuesta.length
            });
        }
    }

    return res.status(400).json({
        ok: false,
        msg: "No es un ID valido",
        datos: null,
    });

}
const buscarConcentradorByTransformador = async(search = '', res = response) => {
    const isMongoId = ObjectId.isValid(search)


    if (isMongoId) {
        existe = await Transformador.findById(search)
        if (!existe) {
            return res.status(400).json({
                ok: false,
                msg: `No existe el elemento con el id ${search}`,
                datos: null,
            });
        }

        const respuesta = await Concentrador.find({
                transformador: search
            }).populate('empresa', 'nombre')
            .populate('region', 'region')
            .populate('provincia', 'nombre')
            .populate('canton', 'nombre')
            .populate('parroquia', 'nombre')
            .populate('ciudad', 'nombre')
            .populate('barrio', 'nombre')
            .populate('frecuencia', 'horas nombre');

        if (respuesta) {
            return res.json({
                ok: true,
                datos: respuesta,
                total: respuesta.length
            });
        }
    }

    return res.status(400).json({
        ok: false,
        msg: "No es un ID valido",
        datos: null,
    });

}
const buscarEnergiasMedidor = async(inicio = '', fin = '', idMedidor, res = response) => {

    if (inicio.length < 10) return res.status(404).json({ ok: false, msg: 'La fecha de inicio debe ser una fecha valida' })
    if (fin.length < 10) return res.status(404).json({ ok: false, msg: 'La fecha de fin debe ser una fecha valida' })

    const { serial } = await Medidor.findById(idMedidor)


    const query = {
        $and: [
            { "fecha": { "$gte": new Date(inicio) } },
            { "fecha": { "$lte": new Date(fin).setUTCHours(23, 59, 59, 999) } },
            { "serial": serial }
        ]
    }

    const [total, datos] = await Promise.all([
        EnergiasMedidor.countDocuments(query),
        EnergiasMedidor.find(query)
    ])

    res.json({
        ok: true,
        datos,
        total
    })
}
const buscarParametrosMedidor = async(inicio = '', fin = '', idMedidor, res = response) => {

    if (inicio.length < 10) return res.status(404).json({ ok: false, msg: 'La fecha de inicio debe ser una fecha valida' })
    if (fin.length < 10) return res.status(404).json({ ok: false, msg: 'La fecha de fin debe ser una fecha valida' })

    const { serial } = await Medidor.findById(idMedidor)

    const query = {
        $and: [
            { "fecha": { "$gte": new Date(inicio) } },
            { "fecha": { "$lte": new Date(fin).setUTCHours(23, 59, 59, 999) } },
            { "serial": serial }
        ]
    }

    const [total, datos] = await Promise.all([
        ParametrosMedidor.countDocuments(query),
        ParametrosMedidor.find(query)
    ])

    res.json({
        ok: true,
        datos,
        total
    })
}





const buscar = (req = request, res = response) => {

    const { coleccion, search } = req.params;
    if (!coleccionesPermitidas.includes(coleccion)) {
        return res.status(400).json({ msg: `Las tablas permitidas son ${coleccionesPermitidas}` })
    }

    switch (coleccion) {
        case 'usuarios':
            buscarUsuarios(search, res)
            break;
        case 'concentradores':
            buscarConcentradoresByEmpresa(search, res)
            break;
        case 'transformadores-empresa':
            buscarTransformadoresByEmpresa(search, res)
            break;
        case 'medidores':
            buscarMedidoresByConcentrador(search, res)
            break;
        case 'medidor-cedula':
            buscarMedidoresByCedula(search, res)
            break;
        case 'medidor-serial':
            buscarMedidorBySerial(search, res)
            break;
        case 'ciudades':
            buscarCiudadByParroquia(search, res)
            break;
        case 'cantones':
            buscarCantonByProvincia(search, res)
            break;
        case 'parroquias':
            buscarParroquiaByCanton(search, res)
            break;
        case 'barrios':
            buscarBarrioByCiudad(search, res)
            break;
        case 'concentrador-transformador':
            buscarConcentradorByTransformador(search, res)
            break;
        default:
            res.status(500).json({
                msg: 'No existe el end point para esta busqueda'
            });
    }
}
const buscarRangoFecha = (req = request, res = response) => {

    const { coleccion, idMedidor, inicio, fin } = req.params;
    if (!coleccionesPermitidasFechas.includes(coleccion)) {
        return res.status(400).json({ msg: `Las tablas permitidas son ${coleccionesPermitidasFechas}` })
    }

    switch (coleccion) {
        case 'energias-medidor':
            buscarEnergiasMedidor(inicio, fin, idMedidor, res)
            break;
        case 'parametros-medidor':
            buscarParametrosMedidor(inicio, fin, idMedidor, res)
            break;

        default:
            res.status(500).json({
                msg: 'No existe el end point para esta busqueda'
            });
    }
}

module.exports = {
    buscar,
    buscarRangoFecha
}