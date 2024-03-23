const { request, response } = require('express')
const Concentrador = require("../models/concentrador");
const collectorApi = require('../services/collectorApi');
const { Frecuencia } = require('../models');
const { obtenerMedidoresNumActualByConcentradorService } = require('../services/concentrador.services');

const obtenerConcentradores = async(req = request, res = response) => {
    const { top = 0, skip = 10 } = req.query;
    const query = { estado: true }

    const [total, concentradores] = await Promise.all([
        Concentrador.countDocuments(query),
        Concentrador.find(query)
        .populate('empresa', 'nombre')
        .populate('region', 'region')
        .populate('provincia', 'nombre')
        .populate('canton', 'nombre')
        .populate('parroquia', 'nombre')
        .populate('ciudad', 'nombre')
        .populate('barrio', 'nombre')
        .populate('frecuencia', 'horas nombre')
        .populate('transformador', 'serial empresa')
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: concentradores,
        total,
    });
}



const obtenerFrecuenciaCron = async(horas) => {

    const resFrec = await Frecuencia.find({ horas })
    const query = { estado: true, frecuencia: resFrec[0]['_id'] }
    const concentradores = await Concentrador.find(query);
    return concentradores
}


const obtenerConcentrador = async(req = request, res = response) => {
    const { id } = req.params
    const concentrador = await Concentrador.findById(id)
        .populate('empresa', 'nombre')
        .populate('region', 'region')
        .populate('provincia', 'nombre')
        .populate('canton', 'nombre')
        .populate('parroquia', 'nombre')
        .populate('ciudad', 'nombre')
        .populate('barrio', 'nombre')
        .populate('frecuencia', 'horas nombre')
        .populate('transformador', 'serial empresa')
    res.json({
        ok: true,
        datos: concentrador
    });
}

const obtenerEstatusConcentrador = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;
    const cuerpo = {
        DeviceAddr,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/GetDeviceStatus', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var datos = data['data']

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    res.json({
        ok: (datos) ? true : false,
        msg: `Mensaje generado por api externa${mensaje}`,
        datos
    });
}
const obtenerMedidoresNumActByConcentrador = async(req = request, res = response) => {
    const { idConcentrador } = req.params;
    const concentrador = await Concentrador.findById(idConcentrador)
    if (!concentrador) {
        res.status(404).json({
            ok: (datos) ? true : false,
            msg: `concentrador con id ${idConcentrador} no existe`,
        });
    }

    const datos = await obtenerMedidoresNumActualByConcentradorService(idConcentrador)


    res.json({
        ok: (datos) ? true : false,
        datos
    });
}

const crearColectorApi = async(serial = '', frecuencia, evento) => {
    const cuerpo = {
        Token: 'zj4GnyUmU+A=',
        DeviceAddr: serial,
        ConFreq: frecuencia,
        OptType: evento
    }
    const { data } = await collectorApi.post('/ConcentratorConfig', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var datos = data['data']

    return { estado, mensaje };
}

const crearConcentrador = async(req = request, res = response) => {
    const { serial, ...body } = req.body;

    const existeConcentrador = await Concentrador.findOne({ serial })

    if (existeConcentrador) {
        return res.status(400).json({ msg: `El concentrador con el ${existeConcentrador.serial}, ya existe` })
    }
    const data = {
        serial,
        ...body
    }

    const { estado, mensaje } = await crearColectorApi(serial, 3, 1)
    if (estado === 'success') {
        const concentrador = new Concentrador(data);
        await concentrador.save();
        res.json({
            ok: true,
            msg: `Concentrador creado correctamente, ${mensaje}`,
            datos: concentrador
        });
    } else {
        res.json({
            ok: false,
            msg: mensaje,
            datos: null
        });
    }


}

const eliminarConcentrador = async(req = request, res = response) => {
    const { id } = req.params;
    //obtener el usuario autenticado
    //const usuarioAutenticado = req.usuario;
    const concentrador = await Concentrador.findByIdAndUpdate(id, { estado: false });
    concentrador.estado = false
    res.json({
        ok: true,
        datos: concentrador

    });
}


const actualizarCocentrador = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, fechaCreacion, online, serial, ...resto } = req.body;


    const { estado: state, mensaje } = await crearColectorApi(serial, 3, 2)

    if (state === 'success') {
        const concentrador = await Concentrador.findByIdAndUpdate(id, resto);
        console.log(concentrador)
        res.json({
            ok: true,
            datos: concentrador
        });
    } else {
        res.json({
            ok: false,
            msg: `Mensaje generado por api externa${mensaje} - serial no existe en api externa`,
            datos: null
        });
    }



}

module.exports = {
    obtenerConcentradores,
    crearConcentrador,
    eliminarConcentrador,
    obtenerConcentrador,
    actualizarCocentrador,
    obtenerEstatusConcentrador,
    obtenerFrecuenciaCron,
    obtenerMedidoresNumActByConcentrador
}