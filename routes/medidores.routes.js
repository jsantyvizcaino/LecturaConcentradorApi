const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerMedidores, obtenerMedidor, crearMedidor, actualizarMedidor, eliminarMedidor, leerParametrosMedidoresTiempoReal, leerEnergiaMedidores, prenderMedidor, apagarMedidor, estadoMedidor, totalPagarMedidor, desglocePago, lecturaTapaMedidor, actualizarViviendaMedidor, leerParamsMedidoresTiempoReal, datosArchivoSap } = require('../controllers');
const { medidorExiste, concentradorExiste, grupoConsumoExiste, tipoPagoExiste, verificarCedula, cedulaExiste, cedulaCliente, viviendaExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');

/**
 * @swagger
 * components:
 *   schemas:
 *     Medidor:
 *       type: object
 *       required:
 *         - serial
 *         - concentrador
 *         - modelo
 *         - password
 *         - tipoPago
 *         - codigoPostal
 *         - latitud
 *         - longitud
 *         - apellidos
 *         - nombres
 *         - direccion
 *         - cuentaContrato
 *         - cuenta
 *         - cedula
 *         - grupoConsumo
 *       properties:
 *         serial:
 *           type: string
 *           description: Numero identificador del Medidor
 *         codigoPostal:
 *           type: string
 *           description: Nombre del codigo Postal
 *         password:
 *           type: string
 *           description: Password del medidor
 *         concentrador:
 *           type: Number
 *           description: id del concentrador al que pertenece el medidor
 *         modelo:
 *           type: Number
 *           description: modelo del medidor
 *         latitud:
 *           type: Number
 *           description: latitud del medidor
 *         longitud:
 *           type: Number
 *           description: longitud del medidor
 *         apellidos:
 *           type: string
 *           description: apellidos del medidor
 *         nombres:
 *           type: string
 *           description: nombres del medidor
 *         direccion:
 *           type: string
 *           description: direccion del medidor
 *         cuentaContrato:
 *           type: string
 *           description: cuentaContrato del medidor
 *         cuenta:
 *           type: string
 *           description: cuenta del medidor
 *         cedula:
 *           type: string
 *           description: cedula del cliente atado al medidor
 *         grupoConsumo:
 *           type: string
 *           description: id del grupo de consumo al que pertenece el medidor
 *       example:
 *         numero: string
 *         concentrador: Number
 *         modelo: string
 *         password: string
 *         tipoPago: string
 *         codigoPostal: string
 *         latitud: Number
 *         longitud: Number
 *         apellidos: string
 *         nombres: string
 *         direccion: string
 *         cuentaContrato: string
 *         cuenta: string
 *         cedula: string
 *         grupoConsumo: string
 *     MedidorApi:
 *       type: object
 *       required:
 *         - DeviceAddr
 *       properties:
 *         DeviceAddr:
 *           type: string
 *           description: Numero identificador del medidor
 *       example:
 *         DeviceAddr: "002206000007"
 */

/**
 * @swagger
 * tags:
 *   name: Medidores
 *   description: CRUD Medidor
 * /api/medidores/lectura-tapa:
 *   post:
 *     summary: Obtener el dato de lectura de la abertura de la tapa del medidor desde la api externa
 *     tags: [Medidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedidorApi'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedidorApi'
 *       500:
 *         description: Some server error
 * /api/medidores/desgloce:
 *   post:
 *     summary: Obtener el desgloce del pago por consumo desde la api externa
 *     tags: [Medidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedidorApi'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedidorApi'
 *       500:
 *         description: Some server error
 * /api/medidores/payment:
 *   post:
 *     summary: Obtener el pago por consumo desde la api externa
 *     tags: [Medidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedidorApi'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedidorApi'
 *       500:
 *         description: Some server error
 * /api/medidores/status:
 *   post:
 *     summary: Obtener el estado del medidor 
 *     tags: [Medidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedidorApi'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedidorApi'
 *       500:
 *         description: Some server error
 * /api/medidores/params:
 *   post:
 *     summary: Obtener los parametros del medidor en tiempo real desde la api externa
 *     tags: [Medidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedidorApi'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedidorApi'
 *       500:
 *         description: Some server error
 * /api/medidores/turn-on:
 *   post:
 *     summary: Obtener los parametros del medidor en tiempo real desde la api externa
 *     tags: [Medidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedidorApi'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedidorApi'
 *       500:
 *         description: Some server error
 * /api/medidores/turn-off:
 *   post:
 *     summary: Obtener los parametros del medidor en tiempo real desde la api externa
 *     tags: [Medidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedidorApi'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedidorApi'
 *       500:
 *         description: Some server error
 * /api/medidores/energy:
 *   post:
 *     summary: Obtener la energia del medidor desde la api externa
 *     tags: [Medidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedidorApi'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedidorApi'
 *       500:
 *         description: Some server error
 * /api/medidores:
 *   post:
 *     summary: Crear Medidor
 *     tags: [Medidores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medidor'
 *     responses:
 *       200:
 *         description: Medidor Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medidor'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todos los Medidor
 *     tags: [Medidores]
 *     responses:
 *       200:
 *         description: Lista de Medidor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medidor'
 * 
 * /api/medidores/{id}:
 *   put:
 *    summary: Actualizar Medidor por id
 *    tags: [Medidores]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Medidor id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Medidor'
 *    responses:
 *      200:
 *        description: El Medidor fue actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Medidor'
 *      400:
 *        description: El Medidor no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Medidor por id
 *     tags: [Medidores]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Medidor id
 *     responses:
 *       200:
 *         description: Devuelve el Medidor con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medidor'
 *       400:
 *         description: The book was not found
 *   delete:
 *     summary: Eliminación lógica del Medidor por id
 *     tags: [Medidores]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Medidor id
 *
 *     responses:
 *       200:
 *         description: El Medidor fue eliminado
 *       400:
 *         description: El Medidor no existe
 */



const router = Router();

router.get('/', obtenerMedidores);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(medidorExiste),
    validarCampos
], obtenerMedidor);

router.post('/', [
    check('codigoPostal', 'El codigo postal es obligatorio').not().isEmpty(),
    check('concentrador', 'El concentrador no es valido').isMongoId(),
    check('concentrador').custom(concentradorExiste),
    check('modelo', 'El modelo id no es correcto').isMongoId(),
    check('modelo', 'El modelo es obligatorio').not().isEmpty(),
    check('tipoPago', 'El tipo de pago es obligatorio').isMongoId(),
    check('tipoPago').custom(tipoPagoExiste),
    check('password', 'El password es obligatorio').not().isEmpty(),
    check('latitud', 'La latitud es obligatoria').not().isEmpty(),
    check('longitud', 'La longitud es obligatoria').not().isEmpty(),
    check('apellidos', 'Apellidos son obligatoria').not().isEmpty(),
    check('nombres', 'Nombres son obligatoria').not().isEmpty(),
    check('direccion', 'Dirección es obligatoria').not().isEmpty(),
    check('cuentaContrato', 'La cuenta contrato es obligatoria').not().isEmpty(),
    check('cuenta', 'La cuenta es obligatoria').not().isEmpty(),
    check('cedula', 'La cedula del cliente vinculado al medidor es obligatoria').not().isEmpty(),
    check('cedula').custom(verificarCedula),
    check('cedula').custom(cedulaCliente),
    check('grupoConsumo', 'El grupoConsumo id no es correcto').isMongoId(),
    check('grupoConsumo').custom(grupoConsumoExiste),
    validarCampos,
], crearMedidor);

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(medidorExiste),
    check('latitud', 'formato incorrecto').isString(),
    check('longitud', 'formato incorrecto').isString(),
    check('modelo', 'El modelo id no es correcto').isMongoId(),
    check('modelo', 'El modelo es obligatorio').not().isEmpty(),
    check('apellidos', 'Apellidos son obligatoria').not().isEmpty(),
    check('nombres', 'Nombres son obligatoria').not().isEmpty(),
    check('direccion', 'Dirección es obligatoria').not().isEmpty(),
    check('cuentaContrato', 'La cuenta contrato es obligatoria').not().isEmpty(),
    check('cuenta', 'La cuenta es obligatoria').not().isEmpty(),
    check('cedula', 'La cedula del cliente vinculado al medidor es obligatoria').not().isEmpty(),
    check('cedula').custom(verificarCedula),
    check('grupoConsumo', 'El grupoConsumo id no es correcto').isMongoId(),
    check('grupoConsumo').custom(grupoConsumoExiste),
    validarCampos
], actualizarMedidor);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(medidorExiste),
    validarCampos,
], eliminarMedidor);

router.put('/vivienda/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(medidorExiste),
    check('vivienda', 'No es un ID válido').isMongoId(),
    check('vivienda').custom(viviendaExiste),
    validarCampos,
], actualizarViviendaMedidor);

router.post('/params', leerParametrosMedidoresTiempoReal)
router.post('/energy', leerEnergiaMedidores)
router.post('/turn-on', prenderMedidor)
router.post('/turn-off', apagarMedidor)
router.post('/status', estadoMedidor)
router.post('/payment', totalPagarMedidor)
router.post('/desgloce', desglocePago)
router.post('/lectura-tapa', lecturaTapaMedidor)
router.post('/params-real-time', leerParamsMedidoresTiempoReal)
router.post('/lectura-formato-sap', datosArchivoSap)

module.exports = router;