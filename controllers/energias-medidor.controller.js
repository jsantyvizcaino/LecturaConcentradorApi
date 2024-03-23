const { request, response } = require('express');
const { EnergiasMedidor } = require('../models');


const crearEnergiaMedidor = async(data) => {
    const nuevo = new EnergiasMedidor(data);
    await nuevo.save();
}

const obtenerEnergiaMedidor = async(req = request, res = response) => {
    const mesActual = new Date().getMonth() + 1;
    const anioActual = new Date().getFullYear();
    const diaActual = new Date().getDate()

    const { top = 0, skip = 10, mes = mesActual, anio = anioActual, dia, serial } = req.body;


    let query = {}
    if (dia === undefined) {
        query = {
            fecha: {
                $gte: new Date(anio, mes - 1, 1),
                $lt: new Date(anio, mes, 1)
            },
            serial: serial
        }
    } else {
        fechaInicio = new Date(anio, mes - 1, dia, 0, 0, 0, 0)
        fechafin = new Date(anio, mes - 1, dia + 1, 0, 0, 0, 0)
        query = {
            fecha: {
                $gte: fechaInicio,
                $lt: fechafin
            },
            serial: serial
        }
    }
    const [total, datos] = await Promise.all([
        EnergiasMedidor.countDocuments(query),
        EnergiasMedidor.find(query)
        .sort("fecha")
        //.skip(top)
        //.limit(skip)
    ]);

    res.json({
        ok: true,
        datos,
        total,

    });
}

module.exports = {
    crearEnergiaMedidor,
    obtenerEnergiaMedidor
}