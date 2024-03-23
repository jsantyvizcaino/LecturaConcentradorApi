const authControllers = require("../controllers/auth.controller")
const usuariosControllers = require("../controllers/usuarios.controller")
const clientesControllers = require("../controllers/clientes.controller")
const rolesControllers = require("../controllers/roles.controller")
const concentradorControllers = require('../controllers/concentradores.controller');
const medidorControllers = require('../controllers/medidores.controller');
const buscarControllers = require("../controllers/buscar.controllers")
const archivoControllers = require("../controllers/archivos.controller")
const tipoPagoControllers = require("../controllers/tipo-pago.controller")
const regionControllers = require("../controllers/region.controller")
const tablaPagoControllers = require('../controllers/tabla-pago.controller');
const grupoConsumoControllers = require('../controllers/grupo-consumo.controller');
const empresaControllers = require('../controllers/empresas.controller');
const correoControllers = require('./correos.controller');
const provinciaControllers = require('./provincias.controllers');
const ciudadControllers = require('./ciudades.controller');
const parroquiaControllers = require('./parroquias.controller');
const cantonControllers = require('./cantones.controller');
const barrioControllers = require('./barrios.controllers');
const transformadorControllers = require('./transformadores.controller');
const parametrosMedidorControllers = require('./parametros-medidor.controller');
const energiaMedidorControllers = require('./energias-medidor.controller');
const frecuenciasControllers = require('./frecuencias.controller');
const resportesControllers = require('./reportes.controller');
const modeloMedidoresControllers = require('./modelo-medidores.controller');
const historicoMedidoresControllers = require('./historicos-medidor.controller');
const viviendaControllers = require('./vivienda.controller');
const MedidorTapaAperturaHistroico = require('./medidor-tapa-apertura-historico.controller');
const MobileConsumo = require('./mobile-consumos.controller');








module.exports = {
    ...authControllers,
    ...usuariosControllers,
    ...clientesControllers,
    ...rolesControllers,
    ...concentradorControllers,
    ...medidorControllers,
    ...buscarControllers,
    ...archivoControllers,
    ...tipoPagoControllers,
    ...regionControllers,
    ...tablaPagoControllers,
    ...grupoConsumoControllers,
    ...empresaControllers,
    ...correoControllers,
    ...provinciaControllers,
    ...ciudadControllers,
    ...parroquiaControllers,
    ...cantonControllers,
    ...barrioControllers,
    ...transformadorControllers,
    ...parametrosMedidorControllers,
    ...frecuenciasControllers,
    ...energiaMedidorControllers,
    ...resportesControllers,
    ...modeloMedidoresControllers,
    ...historicoMedidoresControllers,
    ...viviendaControllers,
    ...MedidorTapaAperturaHistroico,
    ...MobileConsumo

}