const { request, response } = require('express');
const { MedidorTapaAperturaHistroico, AperturaMedidor } = require('../models');
const { obtenerAperturaTapaBySerialService } = require('../services/medidores.services');

const obtenerAperturaTapas = async(req = request, res = response) => {
    const { top = 0, skip = 0 } = req.query;


    const [total, data] = await Promise.all([
        MedidorTapaAperturaHistroico.countDocuments(),
        MedidorTapaAperturaHistroico.find()
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: data,
        total,

    });
}


const obtenerAperturaTapa = async(req = request, res = response) => {
    const { id } = req.params
    const data = await MedidorTapaAperturaHistroico.findById(id)
    res.json({
        ok: true,
        datos: data
    });
}


const obtenerAperturaTapaBySerial = async(req = request, res = response) => {
    const { serial } = req.body;

    const data = await MedidorTapaAperturaHistroico.findOne({ serial: serial })
    res.json({
        ok: true,
        datos: data
    });
}

const actualizarAperturaTapa = async(req = request, res = response) => {
    const { id } = req.params
    const {...resto } = req.body;

    const actualizado = await MedidorTapaAperturaHistroico.findByIdAndUpdate(id, resto);
    res.json({
        ok: true,
        datos: actualizado

    });

}

const actualizarEstadoNotificacion = async(req = request, res = response) => {
    try {
        const { id } = req.params
        const { notificado } = req.body;

        const updateData = {
            notificado
        };

        const result = await MedidorTapaAperturaHistroico.updateOne({ _id: id }, { $set: updateData });
        console.log(result)
        res.json({
            ok: true,
            msg: 'Estado actualizado con exito'
        });

    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

const crearAperturaTapa = async(req = request, res = response) => {
    try {
        const { serial, fechaApertura, fechaCierrre, notificado } = req.body;
        const parsedFechaApertura = parseTimestamp(fechaApertura);
        const parsedFechaCierre = parseTimestamp(fechaCierrre);
        const nuevo = new MedidorTapaAperturaHistroico({ serial, fechaApertura: parsedFechaApertura, fechaCierrre: parsedFechaCierre, notificado });

        await nuevo.save();

        res.json({
            ok: true,
            msg: 'Registro creado correctamente',
            datos: nuevo

        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al crear el registro', error: error.message });
    }
};
const eliminarAperturaTapa = async(req = request, res = response) => {
    const { id } = req.params;
    const eliminado = await MedidorTapaAperturaHistroico.findByIdAndDelete(id);

    res.json({
        ok: true,
        datos: eliminado
    });
}


const getNewAperturaTapaBySerial = async(req = request, res = response) => {
    try {
        const { serial } = req.body;

        const resp = await obtenerAperturaTapaBySerialService(serial);

        if (resp.estado === 'error') return res.status(503).json({ ok: false, msg: resp.mensaje });

        const data = {
            serial,
            eventos: [...resp.respuesta]
        }

        const registroAnterior = await AperturaMedidor.findOne({ serial })
        if (!registroAnterior) {
            const creacion = new AperturaMedidor(data)
            await creacion.save();
            const noNotificados = await AperturaMedidor.obtenerEventosNoNotificados(serial);
            return res.json({
                ok: true,
                data: noNotificados
            });
        }

        const nuevosRegistros = compararArrays(registroAnterior.eventos, resp.respuesta);

        if (nuevosRegistros) {
            registroAnterior.eventos.push(...nuevosRegistros);
            await registroAnterior.save();
        }
        // const noNotificados = await AperturaMedidor
        //     .find({ serial: serial, "eventos.EsNotificado": false }, { serial: 1, fechaLectura: 1, eventos: { $elemMatch: { EsNotificado: false } } });
        const noNotificados = await AperturaMedidor.obtenerEventosNoNotificados(serial);

        res.json({
            ok: true,
            data: noNotificados
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al crear el registro', error: error.message });
    }
};
const updateEventoAperturaTapaBySerial = async(req = request, res = response) => {
    try {
        const { serial } = req.body;
        const { id } = req.params

        const eventoActualizado = await AperturaMedidor.actualizarEventoNotificado(serial, id);

        res.json({
            ok: true,
            data: eventoActualizado
        })

    } catch (error) {
        res.status(500).json({ ok: false, msg: error.message });
    }
};

module.exports = {
    obtenerAperturaTapas,
    obtenerAperturaTapa,
    actualizarAperturaTapa,
    crearAperturaTapa,
    eliminarAperturaTapa,
    obtenerAperturaTapaBySerial,
    actualizarEstadoNotificacion,
    getNewAperturaTapaBySerial,
    updateEventoAperturaTapaBySerial
}




// Function to parse timestamp strings into Date objects with time zone
const parseTimestamp = (timestamp) => {
    const parts = timestamp.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);

    if (!parts) {
        console.error('Invalid timestamp format:', timestamp);
        throw new Error('Invalid timestamp format');
    }

    const [, year, month, day, hour, minute, second] = parts;

    // Assuming two-digit year is in the 21st century
    const fullYear = Number(year) + 2000;

    return new Date(Date.UTC(fullYear, month - 1, day, hour, minute, second));
};



//comparar los rray y obtener los diferentes

const compararArrays = (array1, array2) => {
    const elementosNuevos = array2.filter(item2 => {
        // Verificar si el elemento del array2 no está en el array1
        return !array1.some(item1 =>
            item1.DataVal === item2.DataVal &&
            item1.ParamName === item2.ParamName
        );
    });

    return elementosNuevos;
};