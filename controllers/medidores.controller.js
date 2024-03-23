const { request, response } = require('express')
const { Medidor, Concentrador, Historico, Region, TablaPagos, GrupoConsumo, Empresa, Cliente, ModeloMedidores } = require("../models")
const collectorApi = require('../services/collectorApi');
const { obtenerDesglocePago, obtenerMedidorBySerial, actualizarMedidorService, obtenerMedidorBySerialPopulate, leerEnergiaMedidoresService } = require('../services/medidores.services');
const { convertirLatLongUTM } = require('../utils/coordenadasUTM');



const eActivaMas = 'Energy(A)'
const eActivaMenos = 'Energy(A-)'
const eActivaTotal = 'Energy(A+)'
const eReactivaTotal = 'Energy(R)'
const eReactivaMas = 'Energy(R+)'
const eReactivaMenos = 'Energy(R-)'
const mDemanda = 'Maximum demand and occurrence time'

const mesesPeriodo1 = [0, 1, 2, 3, 4, 11]
const mesesPeriodo2 = [5, 6, 7, 8, 9, 10, 11]


const obtenerMedidores = async(req = request, res = response) => {
    const { top = 0, skip = 10 } = req.query;
    const query = { estado: true }

    const [total, medidor] = await Promise.all([
        Medidor.countDocuments(query),
        Medidor.find(query)
        .populate('concentrador', 'estado serial parroquia canton barrio latitud longitud')
        .populate('grupoConsumo', 'grupo')
        .populate('tipoPago', 'pago')
        .populate('modelo', 'nombre idApiExterna')
        .skip(top)
        .limit(skip)
    ]);

    res.json({
        ok: true,
        datos: medidor,
        total,

    });
}

const obtenerMedidoresService = async() => {
    const query = { estado: true }
    const medidores = await Medidor.find(query);
    return medidores
}

const obtenerMedidor = async(req = request, res = response) => {
    const { id } = req.params
    const medidor = await Medidor.findById(id)
        .populate('concentrador', 'estado serial parroquia canton barrio latitud longitud')
        .populate('grupoConsumo', 'grupo')
        .populate('modelo', 'nombre idApiExterna')

    const coordenadasUTM = convertirLatLongUTM(medidor.latitud, medidor.longitud)


    res.json({
        ok: true,
        datos: [medidor, coordenadasUTM]
    });
}

const crearMedidoresApi = async(serialMedidor = '', idConcentrador, evento, idModelo, redFlag = null) => {

    const { idApiExterna } = await ModeloMedidores.findById(idModelo);
    const { serial } = await Concentrador.findById(idConcentrador);
    if (idApiExterna == 6 || idApiExterna == 7) redFlag = "1CC631";
    const cuerpo = {
        Token: 'zj4GnyUmU+A=',
        DeviceAddr: serialMedidor,
        ConID: serial,
        OptType: evento,
        MeterModel: idApiExterna,
        ReadFlg: redFlag
    }
    const { data } = await collectorApi.post('/MeterConfig', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var datos = data['data']

    return { estado, mensaje };
}

const crearMedidor = async(req = request, res = response) => {
    const { serial, modelo, concentrador, ...body } = req.body;
    const existeMedidor = await Medidor.findOne({ serial })
    if (existeMedidor) {
        return res.status(400).json({ msg: `El medidor ${existeMedidor.serial}, ya existe` })
    }

    const { estado, mensaje } = await crearMedidoresApi(serial, concentrador, 1, modelo);

    const data = {
        serial,
        concentrador,
        modelo,
        ...body
    }

    if (estado === 'success') {
        const medidor = new Medidor(data)
        await medidor.save();
        res.json({
            ok: true,
            msg: `Medidor creado correctamente, ${mensaje}`,
            datos: data
        });
    } else {
        res.json({
            ok: false,
            msg: `Mensaje generado por api externa${mensaje} - serial no existe en api externa`,
            datos: null
        });
    }
}

const actualizarMedidor = async(req = request, res = response) => {
    const { id } = req.params
    const { _id, fechaCreacion, serial, concentrador, modelo, ...resto } = req.body;

    const datos = {
        ...resto,
        serial,
        concentrador,
        modelo
    }

    const { estado: state, mensaje } = await crearMedidoresApi(serial, concentrador, 2, modelo)

    if (state === 'success') {
        const medidor = await Medidor.findByIdAndUpdate(id, datos);
        res.json({
            ok: true,
            datos: resto
        });
    } else {
        res.json({
            ok: false,
            msg: mensaje,
            datos: null
        });
    }
}
const actualizarViviendaMedidor = async(req = request, res = response) => {
    try {
        const { id } = req.params
        const { vivienda } = req.body;

        const updateData = {
            vivienda
        };

        const result = await Medidor.updateOne({ _id: id }, { $set: updateData });
        console.log(result)
        res.json({
            ok: true,
            msg: 'Medidor actualizado con exito'
        });

    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}


const deleteMedidoresApi = async(serialMedidor = '') => {

    const cuerpo = {
        Token: 'zj4GnyUmU+A=',
        DeviceAddr: serialMedidor,
    }
    const { data } = await collectorApi.post('/DelMeterConfig', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var datos = data['data']

    return { estado, mensaje };
}

const eliminarMedidor = async(req = request, res = response) => {
    const { id } = req.params;
    const medidorBorrar = await Medidor.findById(id);

    if (!medidorBorrar) {
        res.json({
            ok: false,
            msg: `No se pudo eliminar el medidor: ${mensaje}`,
            datos: null
        });
    }


    const { estado: state, mensaje } = await deleteMedidoresApi(medidorBorrar.serial)

    if (medidorBorrar) {
        const medidor = await Medidor.findOneAndDelete({ _id: id });
        res.json({
            ok: true,
            datos: medidor

        });
    } else {
        res.json({
            ok: false,
            msg: `No se pudo eliminar el medidor o ya no existe: ${mensaje}`,
            datos: null
        });
    }



}

const leerParametrosMedidoresTiempoReal = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;
    const cuerpo = {
        DeviceAddr,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/RealTimeParamRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']



    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    const valores = Object.values(respuesta);
    const PFtotal = valores.filter(x => x.ParamName === 'PF total')[0];
    const PFa = valores.filter(x => x.ParamName === 'PFa')[0];
    const PFb = valores.filter(x => x.ParamName === 'PFb')[0];
    const PFc = valores.filter(x => x.ParamName === 'PFc')[0];
    const ReactiveQc = valores.filter(x => x.ParamName === 'Reactive Qc')[0];
    const ActivePc = valores.filter(x => x.ParamName === 'Active Pc')[0];
    const ReactiveQTotal = valores.filter(x => x.ParamName === 'Reactive Q total')[0];
    const ReactiveQa = valores.filter(x => x.ParamName === 'Reactive Qa')[0];
    const ReactiveQb = valores.filter(x => x.ParamName === 'Reactive Qb')[0];
    const ActivePtotal = valores.filter(x => x.ParamName === 'Active P total')[0];
    const ActivePa = valores.filter(x => x.ParamName === 'Active Pa')[0];
    const ActivePb = valores.filter(x => x.ParamName === 'Active Pb')[0];
    const PhaseBvoltage = valores.filter(x => x.ParamName === 'Phase b voltage')[0];
    const PhaseCvoltage = valores.filter(x => x.ParamName === 'Phase c voltage')[0];
    const PhaseAcurrent = valores.filter(x => x.ParamName === 'Phase a current')[0];
    const PhaseBcurrent = valores.filter(x => x.ParamName === 'Phase b current')[0];
    const PhaseCcurrent = valores.filter(x => x.ParamName === 'Phase c current')[0];
    const PhaseAvoltage = valores.filter(x => x.ParamName === 'Phase a voltage')[0];
    const ReactivePa = valores.filter(x => x.ParamName === 'Reactive Pa')[0];
    const ReactivePb = valores.filter(x => x.ParamName === 'Reactive Pb')[0];
    const ReactivePc = valores.filter(x => x.ParamName === 'Reactive Pc')[0];
    const ReactivePtotal = valores.filter(x => x.ParamName === 'Reactive P total')[0];
    res.json({
        ok: true,
        datos: {
            PFa,
            PFb,
            PFc,
            PFtotal,
            ActivePa,
            ActivePb,
            ActivePc,
            ActivePtotal,
            ReactivePa,
            ReactivePb,
            ReactivePc,
            ReactivePtotal,
            PhaseAvoltage,
            PhaseBvoltage,
            PhaseCvoltage,
            PhaseAcurrent,
            PhaseBcurrent,
            PhaseCcurrent,
            ReactiveQc,
            ReactiveQTotal,
            ReactiveQa,
            ReactiveQb
        }
    });
}


const leerParamsMedidoresTiempoReal = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;
    const cuerpo = {
        DeviceAddr,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/RealTimeParamRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    // var estado = 'success'
    // var respuesta = [{
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Reactive Qc",
    //         "CreationTime": "2024-02-06T23:22:57.487"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "1.000",
    //         "ConID": "000075500019",
    //         "ParamName": "PF total",
    //         "CreationTime": "2024-02-06T23:22:57.487"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.166",
    //         "ConID": "000075500019",
    //         "ParamName": "PFa",
    //         "CreationTime": "2024-02-06T23:22:57.487"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "1.000",
    //         "ConID": "000075500019",
    //         "ParamName": "PFb",
    //         "CreationTime": "2024-02-06T23:22:57.487"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "PFc",
    //         "CreationTime": "2024-02-06T23:22:57.487"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Active Pb",
    //         "CreationTime": "2024-02-06T23:22:57.483"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Active Pc",
    //         "CreationTime": "2024-02-06T23:22:57.483"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Reactive Q total",
    //         "CreationTime": "2024-02-06T23:22:57.483"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Reactive Qa",
    //         "CreationTime": "2024-02-06T23:22:57.483"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Reactive Qb",
    //         "CreationTime": "2024-02-06T23:22:57.483"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "125.4",
    //         "ConID": "000075500019",
    //         "ParamName": "Phase a voltage",
    //         "CreationTime": "2024-02-06T23:22:57.48"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.0",
    //         "ConID": "000075500019",
    //         "ParamName": "Phase b voltage",
    //         "CreationTime": "2024-02-06T23:22:57.48"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.0",
    //         "ConID": "000075500019",
    //         "ParamName": "Phase c voltage",
    //         "CreationTime": "2024-02-06T23:22:57.48"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Phase a current",
    //         "CreationTime": "2024-02-06T23:22:57.48"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Phase b current",
    //         "CreationTime": "2024-02-06T23:22:57.48"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.014",
    //         "ConID": "000075500019",
    //         "ParamName": "N Current",
    //         "CreationTime": "2024-02-06T23:22:57.48"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Active P total",
    //         "CreationTime": "2024-02-06T23:22:57.48"
    //     },
    //     {
    //         "ElectricMeterID": "002305000005",
    //         "DataVal": "0.000",
    //         "ConID": "000075500019",
    //         "ParamName": "Active Pa",
    //         "CreationTime": "2024-02-06T23:22:57.48"
    //     }


    // ]

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });

    res.json({
        ok: true,
        datos: respuesta

    });
}

const leerEnergiaMedidores = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;
    const cuerpo = {
        DeviceAddr,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/EnergyRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    const valores = Object.values(respuesta);
    const energiaActivaTotal = valores.filter(x => x.ParamName === eActivaTotal)[0];
    const energiaActivaMas = valores.filter(x => x.ParamName === eActivaMas)[0];
    const energiaActivaMenos = valores.filter(x => x.ParamName === eActivaMenos)[0];
    const energiaReactivaTotal = valores.filter(x => x.ParamName === eReactivaTotal)[0];
    const energiaReactivaMas = valores.filter(x => x.ParamName === eReactivaMas)[0];
    const energiaReactivaMenos = valores.filter(x => x.ParamName === eReactivaMenos)[0];
    const maximaDemanda = valores.filter(x => x.ParamName === mDemanda)[0];
    res.json({
        ok: true,
        datos: {
            energiaActivaTotal,
            energiaReactivaTotal,
            maximaDemanda,
            energiaActivaMas,
            energiaActivaMenos,
            energiaReactivaMas,
            energiaReactivaMenos
        }
    });
}

const prenderMedidor = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;
    const cuerpo = {
        DeviceAddr,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/RelayOnControl', cuerpo)
    var estado = data['state']
    var mensaje = data['message']

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });

    const medidorPrender = await obtenerMedidorBySerial(DeviceAddr);
    medidorPrender.online = true;
    const actualizacion = await actualizarMedidorService(medidorPrender._id, medidorPrender)

    res.json({
        ok: true,
        datos: mensaje
    });
}

const apagarMedidor = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;
    const cuerpo = {
        DeviceAddr,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/RelayOffControl', cuerpo)
    var estado = data['state']
    var mensaje = data['message']

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    const medidorApagar = await obtenerMedidorBySerial(DeviceAddr);
    medidorApagar.online = false;
    const actualizacion = await actualizarMedidorService(medidorApagar._id, medidorApagar)
    res.json({
        ok: true,
        datos: mensaje
    });
}

const estadoMedidorReal = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;
    const cuerpo = {
        DeviceAddr,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/RealTimeParamRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    const valores = Object.values(respuesta);
    const ActivePa = valores.filter(x => x.ParamName === 'Active Pa')[0];
    const ActivePb = valores.filter(x => x.ParamName === 'Active Pb')[0];
    const ActivePc = valores.filter(x => x.ParamName === 'Active Pc')[0];
    const PhaseAvoltage = valores.filter(x => x.ParamName === 'Phase a voltage')[0];
    const PhaseBvoltage = valores.filter(x => x.ParamName === 'Phase b voltage')[0];
    const PhaseCvoltage = valores.filter(x => x.ParamName === 'Phase c voltage')[0];
    const PhaseAcurrent = valores.filter(x => x.ParamName === 'Phase a current')[0];
    const PhaseBcurrent = valores.filter(x => x.ParamName === 'Phase b current')[0];
    const PhaseCcurrent = valores.filter(x => x.ParamName === 'Phase c current')[0];
    const ActivePtotal = valores.filter(x => x.ParamName === 'Active P total')[0];

    let state = '';

    const { DataVal: valorPA } = ActivePa;
    const { DataVal: valorPB } = ActivePb;
    const { DataVal: valorPC } = ActivePc;
    const { DataVal: valorVA } = PhaseAvoltage;
    const { DataVal: valorVB } = PhaseBvoltage;
    const { DataVal: valorVC } = PhaseCvoltage;
    const { DataVal: valorCA } = PhaseAcurrent;
    const { DataVal: valorCB } = PhaseBcurrent;
    const { DataVal: valorCC } = PhaseCcurrent;
    const { DataVal: valorPTotal } = ActivePtotal;

    if ((valorVA > 0 || valorVB > 0 || valorVC > 0) && (valorPTotal > 0)) {
        state = 'on';
    } else if ((valorVA > 0 || valorVB > 0 || valorVC > 0) && (valorPTotal == 0)) {
        state = 'off'
    } else if ((valorVA + valorVB + valorVC == 0) && (valorPTotal == 0)) {
        state = 'off - sin luz'
    }

    state = 'off'
    const medidorPrender = await obtenerMedidorBySerial(DeviceAddr);
    if (medidorPrender.online)
        state = 'on'
    res.json({
        ok: true,
        datos: { state }
    });
}

const estadoMedidor = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;

    state = 'off'
    const medidorPrender = await obtenerMedidorBySerial(DeviceAddr);
    if (medidorPrender.online)
        state = 'on'
    res.json({
        ok: true,
        datos: { state }
    });
}

const totalPagarMedidor = async(req = request, res = response) => {


    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth()
    let periodo = null;
    const { DeviceAddr } = req.body;
    const cuerpo = {
        DeviceAddr,
        Token: 'zj4GnyUmU+A=',
    }


    const medidor = await Medidor.findOne({ "serial": DeviceAddr })
        .populate('concentrador', 'region empresa');

    const idRegion = medidor['concentrador']['region'].toString()
    const { region: nombreRegion } = await Region.findById(idRegion)

    const idEmpresa = medidor['concentrador']['empresa'].toString()
    const { porcentaje } = await Empresa.findById(idEmpresa)

    const idgrupoConsumo = medidor['grupoConsumo']
    const { grupo: grupoConsumo } = await GrupoConsumo.findById(idgrupoConsumo)

    if (nombreRegion === 'COSTA') {

        if (mesesPeriodo1.includes(mesActual)) {
            periodo = 1;
        }
        periodo = 2;
    }

    const registroAnterior = await Historico
        .find({ $and: [{ "fechaLectura": { "$lt": new Date() } }, { "electricMeterID": medidor['_id'] }] })
        .sort({ "fechaLectura": -1 })
        .limit(1);

    const { dataVal: energiaUltimaMedicion } = (registroAnterior[0]) ? registroAnterior[0]: 0;

    const { pago: valoresAPagar, comercializacion } = await TablaPagos
        .findOne({ region: nombreRegion, grupoConsumo, periodo });


    console.log({ 'pagos': { porcentaje, comercializacion } })


    const { data } = await collectorApi.post('/EnergyRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    // var estado = 'success'
    // var respuesta = [{
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "28.40",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Energy(A+)",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:45:32.803"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "15.73",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Energy(R+)",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:45:32.803"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.0120 23-08-15 10:45",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Maximum demand and occurrence time",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:45:32.803"
    //     }
    // ]

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });

    const valores = Object.values(respuesta);
    const energiaActivaTotal = valores.filter(x => x.ParamName === eActivaTotal)[0];

    let row = valoresAPagar.find(x => {
        return energiaActivaTotal.DataVal >= x.min && energiaActivaTotal.DataVal <= x.max
    })

    if (!row) {
        row = valoresAPagar[valoresAPagar.length - 1]
    }

    const pago = parseFloat((energiaActivaTotal.DataVal - energiaUltimaMedicion) * row['costo']).toFixed(4);

    const newHistorico = {
        electricMeterID: medidor['_id'],
        dataVal: energiaActivaTotal.DataVal,
        concentradorID: medidor['concentrador']['_id'],
        paramName: energiaActivaTotal.ParamName,
        fechaLectura: new Date()
    }

    const historico = new Historico(newHistorico)
    await historico.save();
    res.json({
        ok: true,
        datos: {
            "medicionAnterior": energiaUltimaMedicion,
            "medidcionActual": energiaActivaTotal.DataVal,
            pago,
        }
    });
}

const desglocePago = async(req = request, res = response) => {
    try {
        const { DeviceAddr, mes } = req.body;
        const result = await obtenerDesglocePago(DeviceAddr, mes)
        res.json(result)
    } catch (error) {
        res.status(500).json({ ok: false, msg: error });
    }
}

const lecturaTapaMedidor = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;
    const cuerpo = {
        DeviceAddr,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/OpeningCoverEventRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    res.json({
        ok: true,
        datos: respuesta
    });
}


const datosArchivoSap = async(req = request, res = response) => {
    const { seriales } = req.body;

    try {
        const salida = await procesarDatos(seriales);
        res.json({
            ok: true,
            datos: salida
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: error.message
        });
    }
};


module.exports = {
    obtenerMedidores,
    obtenerMedidor,
    crearMedidor,
    actualizarMedidor,
    eliminarMedidor,
    leerParametrosMedidoresTiempoReal,
    leerEnergiaMedidores,
    prenderMedidor,
    apagarMedidor,
    estadoMedidor,
    totalPagarMedidor,
    obtenerMedidoresService,
    desglocePago,
    lecturaTapaMedidor,
    actualizarViviendaMedidor,
    leerParamsMedidoresTiempoReal,
    datosArchivoSap,
}


const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

const obtenerHoraMinutos = (creationTime) => {
    const horaMinutos = creationTime.substring(11, 13) + creationTime.substring(14, 16);
    return horaMinutos;
}


const obtenerEnergiasConTimeout = (serial) => {
    return Promise.race([
        leerEnergiaMedidoresService(serial),
        new Promise((resolve, reject) => {
            setTimeout(() => resolve(), 15000);
        })
    ]);
};

const procesarDatos = async(seriales) => {
    let salida = [];
    for (const serial of seriales) {
        objeto = {}
        const medidor = await obtenerMedidorBySerialPopulate(serial);
        if (medidor != null) {
            objeto.material = medidor.modelo.material
            objeto.numeroMedidor = medidor.serial.slice(2)
            objeto.motivoLectura = '01'
            const energias = await obtenerEnergiasConTimeout(medidor.serial)
            if (energias != null) {
                const energiaAPlus = energias.find(objeto => objeto.ParamName === 'Energy(A+)');
                const energiaAMinus = energias.find(objeto => objeto.ParamName === 'Energy(A-)');
                objeto.energia = {
                    '001': {
                        numerador: 1,
                        idNumeroLectura: medidor.numero001,
                        lecturaTomada: 0,
                        notaLectura: null,
                        claseLectura: null,
                        codigoLector: 'E1A',
                        fechaLecturaPlanificada: formatDate(energiaAPlus.CreationTime),
                        horaMinutos: obtenerHoraMinutos(energiaAPlus.CreationTime),
                        codigoMagnitud: 'ZA',
                        puntoNotificacion: null,
                        notaLecturaExtra: null
                    },
                    '002': {
                        numerador: 2,
                        idNumeroLectura: medidor.numero002,
                        lecturaTomada: parseFloat(energiaAPlus.DataVal),
                        notaLectura: null,
                        claseLectura: null,
                        codigoLector: 'E1A',
                        fechaLecturaPlanificada: formatDate(energiaAPlus.CreationTime),
                        horaMinutos: obtenerHoraMinutos(energiaAPlus.CreationTime),
                        codigoMagnitud: 'ZA',
                        puntoNotificacion: null,
                        notaLecturaExtra: null
                    },
                    '003': {
                        numerador: 3,
                        idNumeroLectura: medidor.numero003,
                        lecturaTomada: parseFloat(energiaAMinus.DataVal),
                        notaLectura: null,
                        claseLectura: null,
                        codigoLector: 'E1A',
                        fechaLecturaPlanificada: formatDate(energiaAMinus.CreationTime),
                        horaMinutos: obtenerHoraMinutos(energiaAMinus.CreationTime),
                        codigoMagnitud: 'ZA',
                        puntoNotificacion: null,
                        notaLecturaExtra: null
                    }
                }
            } else {
                objeto.energia = {}
            }
        }
        salida.push(objeto);
    }
    return salida;
};