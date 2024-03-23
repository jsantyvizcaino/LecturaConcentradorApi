const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerParametrosMedidor, obtenerMaximaDemanda, obtenerEnergiaMedidor, obtenerHistoricoMensualMedidor, obtenerHistoricoMensualMedidorByDia, obtenerValoresMensualMedidorByDia, obtenerHistoricoAnualMedidorByMes, obtenerValoresAnualMedidorByMes } = require('../controllers');
const { validarCampos } = require('../middlewares');

const router = Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     MaximaDemanada:
 *       type: object
 *       required:
 *         - electricMeterID
 *         - maximaDemanda
 *         - fecha
 *         - serial
 *       properties:
 *         electricMeterID:
 *           type: string
 *           description: Numero identificador del Medidor
 *         maximaDemanda:
 *           type: string
 *           description: valor de la maxima demanada
 *         fecha:
 *           type: string
 *           description: fecha en la que ocurrio la maxima demanda
 *         serial:
 *           type: string
 *           description: serial del medidor
 *       example:
 *         electricMeterID: string
 *         maximaDemanda: Number
 *         fecha: string
 *         serial: string
 *     ArgumentosPost:
 *       type: object
 *       required:
 *         - skip
 *         - top
 *         - mes
 *         - anio
 *         - dia
 *         - serial
 *       properties:
 *         skip:
 *           type: string
 *           description: Numero identificador del Medidor
 *         top:
 *           type: string
 *           description: valor de la maxima demanada
 *         mes:
 *           type: string
 *           description: fecha en la que ocurrio la maxima demanda
 *         anio:
 *           type: string
 *           description: serial del medidor
 *         dia:
 *           type: string
 *           description: serial del medidor
 *         serial:
 *           type: string
 *           description: serial del medidor
 *       example:
 *         serial: '002206000007'
 *         top: 0
 *         skip: 10
 *         mes: 10
 *         anio: 2023
 *         dia: 1
 *     ParametrosHistorico:
 *       type: object
 *       required:
 *         - fecha
 *         - serial
 *         - PFa
 *         - PFb
 *         - PFc
 *         - PFtotal
 *         - ActivePa
 *         - ActivePb
 *         - ActivePc
 *         - ActivePtotal
 *         - ReactivePa
 *         - ReactivePb
 *         - ReactivePc
 *         - ReactivePtotal
 *         - PhaseAvoltage
 *         - PhaseBvoltage
 *         - PhaseCvoltage
 *         - PhaseAcurrent
 *         - PhaseBcurrent
 *         - PhaseCcurrent
 *       properties:
 *         fecha:
 *           type: string
 *           description: Fecha en la que se guardo el registro
 *         serial:
 *           type: string
 *           description: Numero de serie del medidor
 *         PFa:
 *           type: Object
 *         PFb:
 *           type: Object
 *         PFc:
 *           type: Object
 *         PFtotal:
 *           type: Object
 *         ActivePa:
 *           type: Object
 *         ActivePb:
 *           type: Object
 *         ActivePc:
 *           type: Object
 *         ActivePtotal:
 *           type: Object
 *         ReactivePa:
 *           type: Object
 *         ReactivePb:
 *           type: Object
 *         ReactivePc:
 *           type: Object
 *         ReactivePtotal:
 *           type: Object
 *         PhaseAvoltage:
 *           type: Object
 *         PhaseBvoltage:
 *           type: Object
 *         PhaseCvoltage:
 *           type: Object
 *         PhaseAcurrent:
 *           type: Object
 *         PhaseBcurrent:
 *           type: Object
 *         PhaseCcurrent:
 *           type: Object
 *     EnergiaHistorico:
 *       type: object
 *       required:
 *         - fecha
 *         - serial
 *         - energiaActivaTotal
 *         - energiaReactivaTotal
 *         - maximaDemanda
 *       properties:
 *         fecha:
 *           type: string
 *           description: Fecha en la que se guardo el registro
 *         serial:
 *           type: string
 *           description: Numero de serie del medidor
 *         energiaActivaTotal:
 *           type: Object
 *         energiaReactivaTotal:
 *           type: Object
 */
/**
 * @swagger
 * tags:
 *   name: HistoricosMedidores
 *   description: Historial de registros de Medidor
 * /api/historicos-medidor/maxima-demanda:
 *   post:
 *     summary: Obtener la maxima demanda de un medidor
 *     tags: [HistoricosMedidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArgumentosPost'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MaximaDemanada'
 *       500:
 *         description: Some server error
 * /api/historicos-medidor/parametros:
 *   post:
 *     summary: Obtener los parametros historicos de un medidor
 *     tags: [HistoricosMedidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArgumentosPost'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParametrosHistorico'
 *       500:
 *         description: Some server error
 * /api/historicos-medidor/energia:
 *   post:
 *     summary: Obtener la energia historicos de un medidor
 *     tags: [HistoricosMedidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArgumentosPost'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnergiaHistorico'
 *       500:
 *         description: Some server error
 * /api/historicos-medidor/mensual-grafica:
 *   post:
 *     summary: Obtener el historico mensual
 *     tags: [HistoricosMedidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArgumentosPost'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EnergiaHistorico'
 *       500:
 *         description: Some server error
 */

router.post('/maxima-demanda', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    validarCampos,
], obtenerMaximaDemanda);
router.post('/energia', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    validarCampos,
], obtenerEnergiaMedidor);
router.post('/parametros', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    validarCampos,
], obtenerParametrosMedidor);

router.post('/mensual-grafica', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    validarCampos,
], obtenerHistoricoMensualMedidor);

router.post('/mensual-kwh-dia', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    validarCampos,
], obtenerHistoricoMensualMedidorByDia);

router.post('/mensual-valores-kwh-dia', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    validarCampos,
], obtenerValoresMensualMedidorByDia);

router.post('/mensual-kwh', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    validarCampos,
], obtenerHistoricoAnualMedidorByMes);

router.post('/mensual-valores-kwh', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    validarCampos,
], obtenerValoresAnualMedidorByMes);

module.exports = router;