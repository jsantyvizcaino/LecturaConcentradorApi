const path = require('path');
const fs = require('fs');
const ftp = require('ftp');
const { Medidor } = require("../models")
const { response, request } = require('express')
const XLSX = require("xlsx");
const { crearMedidoresApi, obtenerMedidorBySerialPopulate, leerEnergiaMedidoresService } = require('../services/medidores.services');


const cargarArchivoExcel = async(req = request, res = response) => {

    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({
            ok: false,
            msg: "No se ha seleccionado un archivo"
        })
    };
    const { file } = req.files;
    const nombre = file.name.split('.');
    const extension = nombre[nombre.length - 1]
    const extensionValida = ['xlsx']
    if (!extensionValida.includes(extension)) {
        return res.status(400).json({
            ok: false,
            msg: `La extensión ${extension} no es permitida`
        })
    }
    const filePath = path.join(__dirname, '../uploads/' + file.name);
    file.mv(filePath, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: `Error al guardar el archivo ${err}`
            });
        }
    });
    const worbook = XLSX.readFile(filePath)
    const worbookSheets = worbook.SheetNames;
    const sheet = worbookSheets[0]
    const registros = XLSX.utils.sheet_to_json(worbook.Sheets[sheet])

    const entries = Object.entries(registros);
    let medidoresIngresados = 0
    try {
        for (const entry of entries) {
            const serial = entry[1].serial;
            const idConcentrador = entry[1].concentrador;
            const idModelo = entry[1].modelo;
            const existeMedidor = await Medidor.findOne({ serial });
            if (!existeMedidor) {
                const { estado, mensaje } = await crearMedidoresApi(entry[1].serial, idConcentrador, 1, idModelo);
                if (estado === 'success') {
                    medidoresIngresados++;
                    const medidor = new Medidor(entry[1]);
                    await medidor.save();
                }

            }
        }
        res.json({ ok: true, msg: 'Operación correcta', medidoresIngresados });
    } catch (error) {

        res.status(400).json({ ok: false, msg: error.message });
    }
}

const cargarArchivoSAP = async(req = request, res = response) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({
            ok: false,
            msg: "No se ha seleccionado un archivo"
        })
    };
    const { file } = req.files;
    const nombre = file.name.split('.');
    const extension = nombre[nombre.length - 1]
    const extensionValida = ['txt']
    if (!extensionValida.includes(extension)) {
        return res.status(400).json({
            ok: false,
            msg: `La extensión ${extension} no es permitida`
        })
    }

    const filePath = path.join(__dirname, '../uploads/' + file.name);
    file.mv(filePath, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: `Error al guardar el archivo ${err}`,
            });
        }

        // Leer el contenido del archivo
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al leer el archivo',
                    error
                });
            }

            const lines = data.split('\n');
            const serialesTxt = new Set();

            lines.forEach(line => {
                if (line.trim() !== '') {
                    const campos = line.split('|');
                    if (campos.length >= 25) {
                        const serial = campos[14];
                        const serialinterno = serial.length == 10 ? "00" + serial : serial;
                        serialesTxt.add(serialinterno);
                    } else {
                        return res.status(500).json({
                            ok: false,
                            msg: 'El archivo no cumple con el formato esperado',
                        });
                    }
                }

            });

            procesarLineas(lines)
                .then(async(listaMedidoresProcesados) => {
                    const diferencia = new Set([...serialesTxt].filter(x => !listaMedidoresProcesados.includes(x)));

                    res.status(200).json({
                        ok: true,
                        msg: diferencia.size === serialesTxt.size ? 'No se pudieron procesar los medidores asegurese que existan en el sistema' : 'Archivo cargado correctamente',
                        sinProcesar: [...diferencia]
                    });
                })
                .catch(error => {
                    res.status(500).json({
                        ok: false,
                        msg: `Error ${error.message}`,
                    });
                });


        });
    });
}


const cargarLeerArchivoSAP = async(req = request, res = response) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.file) {
        return res.status(400).json({
            ok: false,
            msg: "No se ha seleccionado un archivo"
        })
    };
    const { file } = req.files;
    const nombre = file.name.split('.');
    const extension = nombre[nombre.length - 1]
    const extensionValida = ['txt']
    if (!extensionValida.includes(extension)) {
        return res.status(400).json({
            ok: false,
            msg: `La extensión ${extension} no es permitida`
        })
    }

    const filePath = path.join(__dirname, '../uploads/' + file.name);
    file.mv(filePath, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: `Error al guardar el archivo ${err}`,
            });
        }

        // Leer el contenido del archivo
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (error) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Error al leer el archivo',
                    error
                });
            }

            const serialesTxt = new Set();
            const lines = data.split('\n');
            lines.forEach(line => {
                if (line.trim() !== '') {
                    const campos = line.split('|');
                    if (campos.length >= 25) {
                        const serial = campos[14];
                        const serialinterno = serial.length == 10 ? "00" + serial : serial;
                        serialesTxt.add(serialinterno);
                    } else {
                        return res.status(500).json({
                            ok: false,
                            msg: 'El archivo no cumple con el formato esperado',
                        });
                    }
                }

            });
            procesarArchivos(lines)
                .then(async(listaMedidoresProcesados) => {
                    const diferencia = new Set([...serialesTxt].filter(x => !listaMedidoresProcesados.includes(x)));
                    const salida = await procesarDatos(listaMedidoresProcesados);
                    res.status(200).json({
                        ok: true,
                        datos: salida,
                        sinProcesar: [...diferencia]
                    });
                })
                .catch(error => {
                    res.status(500).json({
                        ok: false,
                        msg: `Error ${error.message}`,
                    });
                });



        });
    });
}


const descargarArchivoFTP = async(req = request, res = response) => {

    const localFilePathDescarga = `downloads/Preuba1.txt`;
    const localFilePathUpdload = `uploads/Preuba1.txt`;
    const directorioFTPDescarga = '/PRD/Lectura/05/05E1A/E1A/Descarga/'
    const directorioFTPSubida = '/PRD/Lectura/05/05E1A/E1A/Carga/'
        //const directorioFTPSubida = '/PRD/Logos/'
    let archivoDescarga = 'Download_LECT_0502G003_E1A_20240229-155248-095.txt';
    let archivoSubida = 'Upload_Lec_05_E1A_0502G003_20240202_061436_1.txt'
    try {
        const client = await verificarConexionFTP();
        if (!client) {
            console.log('Error al conectar el cliente FTP.');
            return res.status(500).json({ error: 'Error al conectar el cliente FTP.' });
        }

        const remoteFileDescarga = directorioFTPDescarga + archivoDescarga;

        client.get(remoteFileDescarga, (err, stream) => {
            if (err) {
                client.end();
                return res.status(500).json({ error: 'Error al descargar el archivo:', err });
            }

            const fileStream = fs.createWriteStream(localFilePathDescarga);

            stream.pipe(fileStream);

            stream.on('end', () => {
                console.log('¡Archivo descargado con éxito!');
                fs.readFile(localFilePathDescarga, 'utf8', (err, data) => {
                    if (err) {
                        client.end();
                        return res.status(500).json({ error: 'Error al leer el archivo:', err });
                    }

                    console.log('Proceso de archivo')
                    const serialesTxt = new Set();
                    const lines = data.split('\n');
                    lines.forEach(line => {
                        if (line.trim() !== '') {
                            const campos = line.split('|');
                            if (campos.length >= 25) {
                                const serial = campos[14];
                                const serialinterno = serial.length == 10 ? "00" + serial : serial;
                                serialesTxt.add(serialinterno);
                            } else {
                                return res.status(500).json({
                                    ok: false,
                                    msg: 'El archivo no cumple con el formato esperado',
                                });
                            }
                        }
                    });
                    procesarArchivos(lines)
                        .then(async(listaMedidoresProcesados) => {
                            const diferencia = new Set([...serialesTxt].filter(x => !listaMedidoresProcesados.includes(x)));
                            const salida = await procesarDatos(listaMedidoresProcesados);
                            const fileContent = createFileContent(salida);


                            fs.writeFile(localFilePathUpdload, fileContent, (err) => {
                                if (err) {
                                    client.end();
                                    return res.status(500).json({ error: 'Error al crear el archivo:', err });
                                }
                            });
                            client.end();
                            await subirArchivoFTP(localFilePathUpdload, archivoSubida, directorioFTPSubida, res);
                        })
                        .catch(error => {
                            res.status(500).json({
                                ok: false,
                                msg: `Error ${error.message}`,
                            });
                        });


                });
            });

            stream.on('error', (err) => {
                console.error('Error al leer el archivo:', err);
                client.end();
            });


        });
    } catch (error) {
        client.end();
        return res.status(500).json({ error: 'Error en el proceso FTP:', err });
    }


}

const subirArchivoFTP = async(localFilePathUpdload, archivoSubida, directorioFTPSubida, res) => {
    const client = await verificarConexionFTP();
    if (!client) {
        console.log('Error al conectar el cliente FTP.');
        return res.status(500).json({ error: 'Error al conectar el cliente FTP.' });
    }

    const remoteFilePath = directorioFTPSubida + archivoSubida;

    client.put(localFilePathUpdload, remoteFilePath, (err) => {
        if (err) {
            console.error('Error al subir el archivo:', err);
            client.end();
            return res.status(500).json({ error: 'Error al subir el archivo:', err });
        }

        console.log('¡Archivo subido con éxito al servidor FTP!');
        client.end();
        return res.json({ ok: true });
    });
}


const subirArchivoRequestFTP = async(req = request, res = response) => {
    const directorioFTPSubida = '/PRD/Logos/'
    let archivoSubida = 'Upload_Lec_05_E1A_0502G003_20240202_061436_1.txt'
    const localFilePathUpdload = `uploads/Preuba1.txt`;
    const client = await verificarConexionFTP();
    if (!client) {
        console.log('Error al conectar el cliente FTP.');
        return res.status(500).json({ error: 'Error al conectar el cliente FTP.' });
    }

    const remoteFilePath = directorioFTPSubida + archivoSubida;

    client.put(localFilePathUpdload, remoteFilePath, (err) => {
        if (err) {
            console.error('Error al subir el archivo:', err);
            client.end();
            return res.status(500).json({ error: 'Error al subir el archivo:', err });
        }

        console.log('¡Archivo subido con éxito al servidor FTP!');
        client.end();
        return res.json({ ok: true });
    });
}


const conexionEstablecida = async(req = request, res = response) => {
    try {
        const client = await verificarConexionFTP();
        if (!client) {
            console.log('Error al conectar el cliente FTP.');
            return res.status(500).json({ error: 'Error al conectar el cliente FTP.' });
        }
        client.end();
        return res.status(200).json({ msg: 'Exito en el proceso de conexión FTP:' });
    } catch (error) {
        client.end();
        return res.status(500).json({ error: 'Error en el proceso de conexión FTP:', err });
    }
}
module.exports = {
    cargarArchivoExcel,
    cargarArchivoSAP,
    cargarLeerArchivoSAP,
    descargarArchivoFTP,
    conexionEstablecida,
    subirArchivoRequestFTP
}


const procesarLineas = async(lines) => {
    const serialProcesados = new Set();
    const listaMedidoresProcesados = new Set();
    let medidor;
    for (const line of lines) {

        if (line.trim() !== '') {

            const campos = line.split('|');

            if (campos.length >= 25) {

                const serial = campos[14];
                const serialinterno = serial.length == 10 ? "00" + serial : serial;
                const numerador = campos[19];
                const numeroIdSap = campos[24];
                if (!serialProcesados.has(serial)) {
                    serialProcesados.add(serial);
                    medidor = await Medidor.findOne({ serial: serialinterno });
                }
                if (medidor != null) {
                    if (medidor.serial == serialinterno) {
                        listaMedidoresProcesados.add(medidor.serial);
                        const result = await Medidor.updateOne({ serial: serialinterno }, { $set: { fechaActualizacionNumerador: new Date() } });
                        if (numerador == '001') {
                            const result = await Medidor.updateOne({ serial: serialinterno }, { $set: { numero001: numeroIdSap } });
                        }
                        if (numerador == '002') {
                            const result = await Medidor.updateOne({ serial: serialinterno }, { $set: { numero002: numeroIdSap } });
                        }
                        if (numerador == '003') {
                            const result = await Medidor.updateOne({ serial: serialinterno }, { $set: { numero003: numeroIdSap } });
                        }
                    }
                }

            } else {
                console.log('El archivo no cumple con el formato esperado', line);
            }
        }
    }

    return Array.from(listaMedidoresProcesados);
};

const procesarArchivos = async(lines) => {
    const serialProcesados = new Set();
    const listaMedidoresProcesados = new Set();
    let medidor;
    for (const line of lines) {

        if (line.trim() !== '') {

            const campos = line.split('|');

            if (campos.length >= 25) {

                const serial = campos[14];
                const serialinterno = serial.length == 10 ? "00" + serial : serial;
                const numerador = campos[19];
                const numeroIdSap = campos[24];
                if (!serialProcesados.has(serial)) {
                    serialProcesados.add(serial);
                    medidor = await Medidor.findOne({ serial: serialinterno });
                }
                if (medidor != null) {
                    if (medidor.serial == serialinterno) {
                        listaMedidoresProcesados.add(serialinterno);
                        const result = await Medidor.updateOne({ serial: serialinterno }, { $set: { fechaActualizacionNumerador: new Date() } });
                        if (numerador == '001') {
                            const result = await Medidor.updateOne({ serial: serialinterno }, { $set: { numero001: numeroIdSap } });
                        }
                        if (numerador == '002') {
                            const result = await Medidor.updateOne({ serial: serialinterno }, { $set: { numero002: numeroIdSap } });
                        }
                        if (numerador == '003') {
                            const result = await Medidor.updateOne({ serial: serialinterno }, { $set: { numero003: numeroIdSap } });
                        }
                    }
                }


            } else {
                console.log('El archivo no cumple con el formato esperado', line);
            }
        }
    }

    return Array.from(listaMedidoresProcesados);
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
                let energiaAMinus = energias.find(objeto => objeto.ParamName === 'Energy(A-)');

                if (!energiaAMinus) {
                    energiaAMinus = {
                        ElectricMeterID: energiaAPlus.ElectricMeterID,
                        DataVal: '0',
                        ConID: energiaAPlus.ConID,
                        ParamName: 'Energy(A-)',
                        CreationTime: energiaAPlus.CreationTime
                    }
                }

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


const obtenerEnergiasConTimeout = (serial) => {
    return Promise.race([
        leerEnergiaMedidoresService(serial),
        new Promise((resolve, reject) => {
            setTimeout(() => resolve(), 15000);
        })
    ]);
};

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


const verificarConexionFTP = async() => {
    let clienteFTP = null;
    const ftpConfig = {
        host: process.env.SERVIDOR_FTP,
        user: process.env.USUARIO_FTP,
        password: process.env.PASSWORD_FTP,

    };

    return new Promise((resolve) => {
        if (clienteFTP && clienteFTP.writable) {
            resolve(clienteFTP);
        } else {
            const cliente = new ftp();
            cliente.on('ready', () => {
                console.log('¡Sin permisos de escrituta!');
                clienteFTP = cliente; // Almacenar el cliente FTP conectado
                resolve(clienteFTP);
            });
            cliente.on('error', (error) => {
                console.error('Error de conexión FTP:', error);
                resolve(null); // Indicar que no se pudo establecer la conexión
            });
            cliente.connect(ftpConfig);
        }
    });
};


const getValue = (obj, key) => (obj && obj[key] !== null) ? obj[key] : '';
const createLine = (obj) => {
    let lines = '';
    Object.keys(obj.energia).forEach(key => {
        lines += `${getValue(obj, 'material')}|${getValue(obj, 'numeroMedidor')}|${key}|${getValue(obj, 'motivoLectura')}|${getValue(obj['energia'][key], 'idNumeroLectura')}|${getValue(obj['energia'][key], 'lecturaTomada')}|${getValue(obj['energia'][key], 'notaLectura') || ''}|${getValue(obj, 'motivoLectura')}|${getValue(obj['energia'][key], 'codigoLector')}|${getValue(obj['energia'][key], 'fechaLecturaPlanificada')}|${getValue(obj['energia'][key], 'horaMinutos')}|${getValue(obj['energia'][key], 'codigoMagnitud')}|${getValue(obj['energia'][key], 'puntoNotificacion')}|${getValue(obj['energia'][key], 'notaLecturaExtra')}|\n`;
    });
    return lines;
};

const createFileContent = (datos) => {
    let content = '';
    datos.forEach(obj => {
        const line = createLine(obj);
        if (line.trim().length > 0 && line.trim() !== '\n') {
            content += line;
        }
    });
    return content;
};