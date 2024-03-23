const { EnergiasMedidor, Medidor, Region, Empresa, GrupoConsumo, Historico, TablaPagos, ModeloMedidores, Concentrador } = require("../models");
const { valoresFactura } = require("../utils/constantes_pagos");
const errorMessages = require("../utils/error_messages");
const collectorApi = require("./collectorApi");
const { ObjectId } = require('mongoose').Types;

const eActivaTotal = 'Energy(A+)'
const eReactivaTotal = 'Energy(R+)'
const mDemanda = 'Maximum demand and occurrence time'

const mesesPeriodo1 = [0, 1, 2, 3, 4, 11]
const mesesPeriodo2 = [5, 6, 7, 8, 9, 10, 11]

const leerParametrosMedidoresTiempoReal = async(serialMedidor = '') => {

    const cuerpo = {
        DeviceAddr: serialMedidor,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/RealTimeParamRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    // var estado = 'success'
    // var respuesta = [{
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "PFc",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.9"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.678",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "PFa",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.897"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "1.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "PFb",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.897"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Reactive Pc",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.893"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.669",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "PF total",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.893"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Active Pc",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.89"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.003",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Reactive P total",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.89"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.003",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Reactive Pa",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.89"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Reactive Pb",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.89"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.008",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Active Pa",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.887"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Active Pb",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.887"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase c current",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.883"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.008",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Active P total",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.883"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.0",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase b voltage",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.88"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.0",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase c voltage",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.88"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.102",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase a current",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.88"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.000",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase b current",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.88"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "124.3",
    //         "ConID": "000075500001",
    //         "FrozenDate": null,
    //         "AreaName": null,
    //         "ParamName": "Phase a voltage",
    //         "DataFlagStr": null,
    //         "CreationTime": "2023-08-15T23:43:19.877"
    //     }
    // ]


    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    const valores = Object.values(respuesta);
    const ReactiveQc = valores.filter(x => x.ParamName === 'Reactive Qc')[0];
    const PFtotal = valores.filter(x => x.ParamName === 'PF total')[0];
    const PFa = valores.filter(x => x.ParamName === 'PFa')[0];
    const PFb = valores.filter(x => x.ParamName === 'PFb')[0];
    const PFc = valores.filter(x => x.ParamName === 'PFc')[0];
    const ActivePa = valores.filter(x => x.ParamName === 'Active Pa')[0];
    const ActivePb = valores.filter(x => x.ParamName === 'Active Pb')[0];
    const ActivePc = valores.filter(x => x.ParamName === 'Active Pc')[0];
    const ReactiveQTotal = valores.filter(x => x.ParamName === 'Reactive Q total')[0];
    const ReactiveQa = valores.filter(x => x.ParamName === 'Reactive Qa')[0];
    const ReactiveQb = valores.filter(x => x.ParamName === 'Reactive Qb')[0];
    const PhaseAvoltage = valores.filter(x => x.ParamName === 'Phase a voltage')[0];
    const PhaseBvoltage = valores.filter(x => x.ParamName === 'Phase b voltage')[0];
    const PhaseCvoltage = valores.filter(x => x.ParamName === 'Phase c voltage')[0];
    const PhaseAcurrent = valores.filter(x => x.ParamName === 'Phase a current')[0];
    const PhaseBcurrent = valores.filter(x => x.ParamName === 'Phase b current')[0];
    const PhaseCcurrent = valores.filter(x => x.ParamName === 'Phase c current')[0];
    const ActivePtotal = valores.filter(x => x.ParamName === 'Active P total')[0];
    const ReactivePa = valores.filter(x => x.ParamName === 'Reactive Pa')[0];
    const ReactivePb = valores.filter(x => x.ParamName === 'Reactive Pb')[0];
    const ReactivePc = valores.filter(x => x.ParamName === 'Reactive Pc')[0];
    const ReactivePtotal = valores.filter(x => x.ParamName === 'Reactive P total')[0];

    const datos = [{
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
    }]
    return respuesta;
}

const leerEnergiaMedidores = async(serialMedidor = '') => {
    const cuerpo = {
        DeviceAddr: serialMedidor,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/EnergyRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    // var estado = 'success'
    // var respuesta = [{
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.0000 00-00-00 00:00",
    //         "ConID": "000075500001",
    //         "ParamName": "Maximum demand and occurrence time",
    //         "CreationTime": "2023-10-29T09:39:50.28"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "28.74",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(A)",
    //         "CreationTime": "2023-10-29T09:39:50.277"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "15.84",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(A+)",
    //         "CreationTime": "2023-10-29T09:39:50.277"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "150007.20",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(A-)",
    //         "CreationTime": "2023-10-29T09:39:50.277"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "231028.06",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(R)",
    //         "CreationTime": "2023-10-29T09:39:50.277"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.00",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(R+)",
    //         "CreationTime": "2023-10-29T09:39:50.277"
    //     },
    //     {
    //         "ElectricMeterID": "002206000007",
    //         "DataVal": "0.00",
    //         "ConID": "000075500001",
    //         "ParamName": "Energy(R-)",
    //         "CreationTime": "2023-10-29T09:39:50.277"
    //     }
    // ]

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    const valores = Object.values(respuesta);
    const energiaActivaTotal = valores.filter(x => x.ParamName === eActivaTotal)[0];
    const energiaActivaMas = valores.filter(x => x.ParamName === eActivaMas)[0];
    const energiaActivaMenos = valores.filter(x => x.ParamName === eActivaMenos)[0];
    const energiaReactivaTotal = valores.filter(x => x.ParamName === eReactivaTotal)[0];
    const energiaReactivaMas = valores.filter(x => x.ParamName === eReactivaMas)[0];
    const energiaReactivaMenos = valores.filter(x => x.ParamName === eReactivaMenos)[0];
    const maximaDemanda = valores.filter(x => x.ParamName === mDemanda)[0];
    return respuesta
}

const leerEnergiaMedidoresService = async(serialMedidor = '') => {
    const cuerpo = {
        DeviceAddr: serialMedidor,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/EnergyRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    return respuesta
}


const leerEnergiaMedidoresByMes = async(serialMedidor, mes) => {

    var totalEAMensual = 0;
    var totalERMensual = 0;

    const query = {
        $and: [{
                $expr: {
                    $eq: [{ $month: "$fecha" }, mes]
                }
            },
            { "serial": serialMedidor }
        ]
    }

    const [total, datos] = await Promise.all([
        EnergiasMedidor.countDocuments(query),
        EnergiasMedidor.find(query)
    ])

    if (total === 0) return []

    var totalMDMensual = []

    for (const [i, dato] of datos.entries()) {
        totalEAMensual += Number(dato['energiaActivaTotal']['DataVal']);
        totalERMensual += Number(dato['energiaReactivaTotal']['DataVal']);
        totalMDMensual.push({ "fecha": dato['maximaDemanda']['DataVal'].split(' ')[1], "valor": Number(dato['maximaDemanda']['DataVal'].split(' ')[0]) })
    }

    const max = totalMDMensual.reduce(function(prev, current) {
        return (prev && prev.y > current.y) ? prev : current
    })

    return [{
            "ParamName": "Total Energía Activa (+) mes actual",
            "DataVal": (totalEAMensual / total).toFixed(2),
            "TA": 0,
            "TB": 0,
            "TC": 0,
            "TD": 0,
            "medida": "kWh"
        },
        {
            "ParamName": "Total Energía Activa (-) mes actual",
            "DataVal": 0,
            "TA": 0,
            "TB": 0,
            "TC": 0,
            "TD": 0,
            "medida": "kWh"
        },
        {
            "ParamName": "Total Energía Reactiva (+) mes actual",
            "DataVal": (totalERMensual / total).toFixed(2),
            "TA": 0,
            "TB": 0,
            "TC": 0,
            "TD": 0,
            "medida": "kVARh"
        },
        {
            "ParamName": "Total Energía Reactiva (-) mes actual",
            "DataVal": 0,
            "TA": 0,
            "TB": 0,
            "TC": 0,
            "TD": 0,
            "medida": "kVARh"
        },
        {
            "ParamName": "Energía Activa Total mes actual",
            "DataVal": 0,
            "TA": 0,
            "TB": 0,
            "TC": 0,
            "TD": 0,
            "medida": "kWh"
        },
        {
            "ParamName": "Total Activa MD (+) mes actual",
            "DataVal": max.valor,
            "TA": 0,
            "TB": 0,
            "TC": 0,
            "TD": 0,
            "medida": "kW"
        },
        {
            "ParamName": "Tiempo Activa MD (+) mes actual",
            "DataVal": max.fecha,
            "TA": 0,
            "TB": 0,
            "TC": 0,
            "TD": 0,
            "medida": ""
        }
    ]
}

const obtenerNumerosDiasMesActual = (mes = new Date().getMonth()) => {

    const meses30 = [3, 6, 8, 10]
    let dia = 31;
    if (mes == 1) {
        dia = 28
    } else if (meses30.includes(mes)) {
        dia = 30
    }

    return dia;
}


const obtenerDesglocePago = async(DeviceAddr, mes = new Date().getMonth() + 1) => {

    try {

        const fechaActual = new Date();
        const mesActual = fechaActual.getMonth() + 1;
        const anioActual = fechaActual.getFullYear();
        let periodo = null;

        const medidor = await Medidor.findOne({ "serial": DeviceAddr })
            .populate('concentrador', 'region empresa');

        const idRegion = medidor['concentrador']['region'].toString()
        const { region: nombreRegion } = await Region.findById(idRegion)

        const idEmpresa = medidor['concentrador']['empresa'].toString()
        const { porcentaje } = await Empresa.findById(idEmpresa)

        const idgrupoConsumo = medidor['grupoConsumo']
        const { grupo: grupoConsumo } = await GrupoConsumo.findById(idgrupoConsumo)

        if (nombreRegion === 'COSTA') {

            if (mesesPeriodo1.includes(mes)) {
                periodo = 1;
            }
            periodo = 2;
        }

        const queryCurrentMonth = {
            "$and": [
                { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, 1] } },
                { "$expr": { "$eq": [{ "$month": "$fecha" }, mes] } },
                { "$expr": { "$eq": [{ "$year": "$fecha" }, anioActual] } },
                { "serial": DeviceAddr }
            ]
        };

        const registroInicioMes = await EnergiasMedidor
            .find(queryCurrentMonth)
            .sort({ "fechaLectura": -1 })
            .limit(1);

        let { DataVal: energiaPrimerDiaMes } = (registroInicioMes[0]) ? registroInicioMes[0].energiaActivaTotal: 0.0;

        const { pago: valoresAPagar, comercializacion } = await TablaPagos
            .findOne({ region: nombreRegion, grupoConsumo, periodo });

        let energiaMaximaMes = 0;
        if (mes == mesActual) {
            const cuerpo = {
                    DeviceAddr,
                    Token: 'zj4GnyUmU+A=',
                }
                // const { data } = await collectorApi.post('/EnergyRead', cuerpo)
                // var estado = data['state']
                // var mensaje = data['message']
                // var respuesta = data['data']

            var estado = 'success'
            var respuesta = [{
                    "ElectricMeterID": "002206000007",
                    "DataVal": "50.40",
                    "ConID": "000075500001",
                    "FrozenDate": null,
                    "AreaName": null,
                    "ParamName": "Energy(A+)",
                    "DataFlagStr": null,
                    "CreationTime": "2023-08-15T23:45:32.803"
                },
                {
                    "ElectricMeterID": "002206000007",
                    "DataVal": "15.73",
                    "ConID": "000075500001",
                    "FrozenDate": null,
                    "AreaName": null,
                    "ParamName": "Energy(R+)",
                    "DataFlagStr": null,
                    "CreationTime": "2023-08-15T23:45:32.803"
                },
                {
                    "ElectricMeterID": "002206000007",
                    "DataVal": "0.0120 23-08-15 10:45",
                    "ConID": "000075500001",
                    "FrozenDate": null,
                    "AreaName": null,
                    "ParamName": "Maximum demand and occurrence time",
                    "DataFlagStr": null,
                    "CreationTime": "2023-08-15T23:45:32.803"
                }
            ]

            if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });

            const valores = Object.values(respuesta);
            const energiaActivaTotal = valores.filter(x => x.ParamName === eActivaTotal)[0];



            energiaMaximaMes = energiaActivaTotal.DataVal;
        } else {
            const lastDayOfMonth = getLastDayOfMonth(anioActual, mes - 1);
            const queryEnergiaUltimoDiaMes = {
                "$and": [
                    { "$expr": { "$eq": [{ "$dayOfMonth": "$fecha" }, lastDayOfMonth.getDate()] } },
                    { "$expr": { "$eq": [{ "$month": "$fecha" }, mes] } },
                    { "$expr": { "$eq": [{ "$year": "$fecha" }, anioActual] } },
                    { "serial": DeviceAddr }
                ]
            };

            const registroFinMes = await EnergiasMedidor
                .find(queryEnergiaUltimoDiaMes)
                .sort({ "fechaLectura": -1 })
                .limit(1);

            let { DataVal: energiaUltimoDiaMes } = (registroFinMes[0]) ? registroFinMes[0].energiaActivaTotal: 0.0;
            energiaMaximaMes = energiaUltimoDiaMes;

        }

        let row = valoresAPagar.find(x => {
            return energiaMaximaMes >= x.min && energiaMaximaMes <= x.max
        })

        if (!row) {
            row = valoresAPagar[valoresAPagar.length - 1]
        }
        if (!energiaPrimerDiaMes) {
            energiaPrimerDiaMes = energiaMaximaMes;
        }

        const pago = parseFloat((energiaMaximaMes - energiaPrimerDiaMes) * row['costo']).toFixed(4);
        const total = (parseFloat(pago) + parseFloat(valoresFactura.contribucionBomberos) +
            parseFloat(valoresFactura.subsidioCruzadoSolidario) +
            parseFloat(valoresFactura.servicioAlumbradoPublico) +
            parseFloat(valoresFactura.tasaRecoleccionBasura)).toFixed(2);

        return {
            ok: true,
            datos: {
                comercializacion,
                porcentaje,
                pago,
                energiaPrimerDiaMes,
                contribucionBomberos: valoresFactura.contribucionBomberos,
                subsidioCruzadoSolidario: valoresFactura.subsidioCruzadoSolidario,
                servicioAlumbradoPublico: valoresFactura.servicioAlumbradoPublico,
                tasaRecoleccionBasura: valoresFactura.tasaRecoleccionBasura,
                total
            }
        };
    } catch (error) {
        throw `${errorMessages.DATABASE_QUERY_ERROR}: ${error.message}`;
    }
}

const obtenerMedidorBySerial = async(serialMedidor) => {

    const medidor = await Medidor.findOne({ serial: serialMedidor });
    return medidor
}

const obtenerMedidorByCedula = async(cedula) => {

    const medidor = await Medidor.find({ cedula: cedula });
    return medidor
}
const actualizarMedidorService = async(idMedidor, datos) => {
    const isMongoId = ObjectId.isValid(idMedidor)
    if (isMongoId) {
        const medidor = await Medidor.findByIdAndUpdate(idMedidor, datos);
    }
}


const crearMedidoresApi = async(serialMedidor = '', idConcentrador, evento, idModelo, redFlag = null) => {

        const { idApiExterna } = await ModeloMedidores.findById(idModelo);
        const { serial } = await Concentrador.findById(idConcentrador);
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
    /* ====================NUEVOS DESARROLLOS=============================== */



const obtenerEnergiaMedidoresService = async(serialMedidor = '') => {
    const cuerpo = {
        DeviceAddr: serialMedidor,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/EnergyRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    const valores = Object.values(respuesta);
    const energiaAMas = valores.filter(x => x.ParamName === "Energy(A+)")[0];
    const energiaAMenos = valores.filter(x => x.ParamName === "Energy(A-)")[0];
    const energiaR = valores.filter(x => x.ParamName === "Energy(R)")[0];
    const energiaRMas = valores.filter(x => x.ParamName === "Energy(R+)")[0];
    const energiaRMenos = valores.filter(x => x.ParamName === "Energy(R-)")[0];
    const maximaDemanda = valores.filter(x => x.ParamName === mDemanda)[0];
    const energiaA = valores.filter(x => x.ParamName === "Energy(A)")[0];

    const datos = {
        energiaAMas,
        energiaAMenos,
        energiaR,
        energiaRMas,
        energiaRMenos,
        maximaDemanda,
        energiaA,
    }


    return datos;
}

const ObtenerParametrosMedidoresTiempoRealService = async(serialMedidor = '') => {

    const cuerpo = {
        DeviceAddr: serialMedidor,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/RealTimeParamRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']


    if (estado === 'error') return res.status(503).json({ ok: false, msg: mensaje });
    const valores = Object.values(respuesta);
    const ReactiveQc = valores.filter(x => x.ParamName === 'Reactive Qc')[0];
    const PFtotal = valores.filter(x => x.ParamName === 'PF total')[0];
    const PFa = valores.filter(x => x.ParamName === 'PFa')[0];
    const PFb = valores.filter(x => x.ParamName === 'PFb')[0];
    const PFc = valores.filter(x => x.ParamName === 'PFc')[0];
    const ActivePa = valores.filter(x => x.ParamName === 'Active Pa')[0];
    const ActivePb = valores.filter(x => x.ParamName === 'Active Pb')[0];
    const ActivePc = valores.filter(x => x.ParamName === 'Active Pc')[0];
    const ReactiveQTotal = valores.filter(x => x.ParamName === 'Reactive Q total')[0];
    const ReactiveQa = valores.filter(x => x.ParamName === 'Reactive Qa')[0];
    const ReactiveQb = valores.filter(x => x.ParamName === 'Reactive Qb')[0];
    const PhaseAvoltage = valores.filter(x => x.ParamName === 'Phase a voltage')[0];
    const PhaseBvoltage = valores.filter(x => x.ParamName === 'Phase b voltage')[0];
    const PhaseCvoltage = valores.filter(x => x.ParamName === 'Phase c voltage')[0];
    const PhaseAcurrent = valores.filter(x => x.ParamName === 'Phase a current')[0];
    const PhaseBcurrent = valores.filter(x => x.ParamName === 'Phase b current')[0];
    const PhaseCcurrent = valores.filter(x => x.ParamName === 'Phase c current')[0];
    const ActivePtotal = valores.filter(x => x.ParamName === 'Active P total')[0];
    const ReactivePa = valores.filter(x => x.ParamName === 'Reactive Pa')[0];
    const ReactivePb = valores.filter(x => x.ParamName === 'Reactive Pb')[0];
    const ReactivePc = valores.filter(x => x.ParamName === 'Reactive Pc')[0];
    const ReactivePtotal = valores.filter(x => x.ParamName === 'Reactive P total')[0];

    const datos = {
        ReactiveQc,
        PFtotal,
        PFa,
        PFb,
        PFc,
        ActivePa,
        ActivePb,
        ActivePc,
        ReactiveQTotal,
        ReactiveQa,
        ReactiveQb,
        PhaseAvoltage,
        PhaseBvoltage,
        PhaseCvoltage,
        PhaseAcurrent,
        PhaseBcurrent,
        PhaseCcurrent,
        ActivePtotal,
        ReactivePa,
        ReactivePb,
        ReactivePc,
        ReactivePtotal,
    }
    return datos;
}

const ObtnerConsumoActualPrimerDiaMes = async(serialMedidor = '') => {
    const mes = new Date().getMonth() + 1;
    const dia = 1;
    const query = {
        $and: [{
                $expr: {
                    $eq: [{ $month: "$fecha" }, mes],
                },
            },
            {
                $expr: {
                    $eq: [{ $dayOfMonth: "$fecha" }, dia],
                },
            },
            { "serial": serialMedidor },
        ],
    };

    const lecturaPrimerDiaMes = await LecturasMedidoresHistoricos.find(query)
        .sort({ fecha: -1 })
        .limit(1);

    return lecturaPrimerDiaMes;
}

const obtenerMedidorBySerialPopulate = async(serialMedidor) => {

    const medidor = await Medidor
        .findOne({ serial: serialMedidor })
        .populate('concentrador', 'fechaLecturaPlanificada')
        .populate('modelo', 'material');
    return medidor
}
const obtenerAperturaTapaBySerialService = async(serialMedidor) => {

    const cuerpo = {
        DeviceAddr: serialMedidor,
        Token: 'zj4GnyUmU+A=',
    }
    const { data } = await collectorApi.post('/OpeningCoverEventRead', cuerpo)
    var estado = data['state']
    var mensaje = data['message']
    var respuesta = data['data']

    return {
        estado,
        mensaje,
        respuesta
    }
}


module.exports = {
    leerParametrosMedidoresTiempoReal,
    leerEnergiaMedidores,
    obtenerNumerosDiasMesActual,
    leerEnergiaMedidoresByMes,
    obtenerDesglocePago,
    obtenerMedidorBySerial,
    actualizarMedidorService,
    obtenerMedidorByCedula,
    crearMedidoresApi,
    obtenerMedidorBySerialPopulate,
    leerEnergiaMedidoresService,
    obtenerAperturaTapaBySerialService
}


const getLastDayOfMonth = (year, month) => {
    return new Date(year, month + 1, 0);
}