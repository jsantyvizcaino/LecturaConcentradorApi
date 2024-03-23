const express = require('express')
const cors = require('cors')
const { dbConnection } = require('../DB/config');
const swaggerSpec = require('../routes/swagger');
const swaggerUi = require("swagger-ui-express");
const fileUpload = require('express-fileupload');
const { lecturaFrecuencia, lecturaFacturacion, lecturaConcentrador, envioCorreoMaximaDemanda, envioCorreoEnergiaConsumidaSemanal, creacionHistoricosMensuales } = require('./cronograma');




class Server {
    constructor() {
        this.app = express();
        this.app.use(express.static("public"));
        this.port = process.env.PORT || 3000;

        this.paths = {
            usuario: '/api/usuarios',
            cliente: '/api/clientes',
            auth: '/api/auth',
            role: '/api/roles',
            consumo: '/api/consumos',
            transformador: '/api/transformadores',
            concentrador: '/api/concentradores',
            medidor: '/api/medidores',
            buscar: '/api/buscar',
            archivo: '/api/archivos',
            tipoPago: '/api/tipo-pagos',
            region: '/api/regiones',
            tablaPago: '/api/tabla-pagos',
            grupoConsumo: '/api/grupos-consumo',
            empresa: '/api/empresas',
            provincia: '/api/provincias',
            ciudad: '/api/ciudades',
            parroquia: '/api/parroquias',
            canton: '/api/cantones',
            barrio: '/api/barrios',
            correo: '/api/email',
            frecuencia: '/api/frecuencias',
            reportes: '/api/reportes',
            viviendas: '/api/viviendas',
            modeloMedidor: '/api/modelos-medidor',
            historicos: '/api/historicos-medidor',
            aperturaTapaHistorico: '/api/historicos-apertura-medidor',
            payment: '/api/checkout',
            documentacion: '/api/v1/docs',
            defecto: '*'
        }
        this.conectarDB();
        this.middlewares();
        this.documentacion();
        this.cronograma();
        this.routes();

    }


    documentacion() {
        this.app.use(this.paths.documentacion, swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json())
        this.app.use(express.static('public'));
        this.app.use(fileUpload({
            useTempFiles: true,
            tempFileDir: '/tmp/'
        }));

    }

    async conectarDB() {
        await dbConnection();
    }


    routes() {
        this.app.use(this.paths.usuario, require('../routes/usuarios.routes'))
        this.app.use(this.paths.cliente, require('../routes/clientes.routes'))
        this.app.use(this.paths.auth, require('../routes/auth.routes'))
        this.app.use(this.paths.role, require('../routes/roles.routes'))
        this.app.use(this.paths.transformador, require('../routes/transformadores.routes'))
        this.app.use(this.paths.concentrador, require('../routes/concentradores.routes'))
        this.app.use(this.paths.medidor, require('../routes/medidores.routes'))
        this.app.use(this.paths.buscar, require('../routes/buscar.routes'))
        this.app.use(this.paths.archivo, require('../routes/archivo.routes'))
        this.app.use(this.paths.tipoPago, require('../routes/tipo-pagos.routes'))
        this.app.use(this.paths.region, require('../routes/region.routes'))
        this.app.use(this.paths.tablaPago, require('../routes/tabla-pagos.routes'))
        this.app.use(this.paths.grupoConsumo, require('../routes/grupo-consumo.routes'))
        this.app.use(this.paths.empresa, require('../routes/empresa.routes'))
        this.app.use(this.paths.provincia, require('../routes/provincia.routes'))
        this.app.use(this.paths.ciudad, require('../routes/ciudad.routes'))
        this.app.use(this.paths.parroquia, require('../routes/parroquia.routes'))
        this.app.use(this.paths.canton, require('../routes/canton.routes'))
        this.app.use(this.paths.barrio, require('../routes/barrio.routes'))
        this.app.use(this.paths.correo, require('../routes/correo.routes'))
        this.app.use(this.paths.frecuencia, require('../routes/frecuencia.routes'))
        this.app.use(this.paths.viviendas, require('../routes/vivienda.routes'))
        this.app.use(this.paths.reportes, require('../routes/reporte.routes'))
        this.app.use(this.paths.modeloMedidor, require('../routes/modelo-medidores.routes'))
        this.app.use(this.paths.historicos, require('../routes/historicos-medidor.routes'))
        this.app.use(this.paths.payment, require('../routes/payment.routes'))
        this.app.use(this.paths.consumo, require('../routes/mobile-consumo.routes'))
        this.app.use(this.paths.aperturaTapaHistorico, require('../routes/medidor-tapa-apertura-historico.routes'))
        this.app.use(this.paths.defecto, (req, res) => {
            res.status(404).json({
                ok: false,
                msg: "No existe el end point solicitado"
            })
        })
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto', this.port);
        })

    }

    cronograma() {
        //lecturaFrecuencia();
        lecturaFacturacion();
        lecturaConcentrador();
        envioCorreoMaximaDemanda();
        envioCorreoEnergiaConsumidaSemanal();
        creacionHistoricosMensuales();
    }

}

module.exports = Server