const { request, response } = require('express');
const { Region } = require('../models');




const obtenerRegiones = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, region] = await Promise.all([
        Region.countDocuments(),
        Region.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: region,
        total,

    });
}


const obtenerRegion = async(req = request, res = response) => {
    const { id } = req.params
    const region = await Region.findById(id)
    res.json({
        ok: true,
        datos: region
    });
}

const actualizarRegion = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, region } = req.body;


    const newRegion = await Region.findByIdAndUpdate(id, region);
    newRegion.region = region

    res.json({
        ok: true,
        datos: newRegion

    });

}


const crearRegion = async(req = request, res = response) => {
    const { region } = req.body;
    const newRegion = new Region({ region });

    await newRegion.save();

    res.json({
        ok: true,
        msg: 'Region creado correctamente',
        datos: newRegion

    });
}

const eliminarRegion = async(req = request, res = response) => {
    const { id } = req.params;
    const region = await Region.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: region
    });
}

module.exports = {
    obtenerRegiones,
    obtenerRegion,
    actualizarRegion,
    crearRegion,
    eliminarRegion
}