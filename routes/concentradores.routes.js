const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerConcentradores, crearConcentrador, eliminarConcentrador, obtenerConcentrador, actualizarCocentrador, obtenerEstatusConcentrador, obtenerMedidoresNumActByConcentrador } = require('../controllers');
const { concentradorExiste, usuarioExiste, regionExiste, empresaExiste, parroquiaExiste, cantonExiste, ciudadExiste, provinciaExiste, barrioExiste, transformadorOpcionalExiste, frecuenciaExiste, transformadorExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido, esEmpresaRole } = require('../middlewares');

/**
 * @swagger
 * components:
 *   schemas:
 *     Concentrador:
 *       type: object
 *       required:
 *         - serial
 *         - codigoPostal
 *         - password
 *         - frecuencia
 *         - latitud
 *         - longitud
 *         - empresa
 *         - provincia
 *         - ciudad
 *         - parroquia
 *         - canton
 *         - barrio
 *         - region
 *       properties:
 *         serial:
 *           type: string
 *           description: Numero identificador del concentrador
 *         codigoPostal:
 *           type: string
 *           description: Codigo postal al que pertenece el concentrador
 *         password:
 *           type: string
 *           description: Password del concentrador
 *         frecuencia:
 *           type: string
 *           description: La frecuencia con la que se medira
 *         latitud:
 *           type: Number
 *           description: Coordenada geográfica
 *         longitud:
 *           type: Number
 *           description: Coordenada geográfica
 *         empresa:
 *           type: ObjectId
 *           description: Empresa dueña del concentrador
 *         provincia:
 *           type: string
 *           description: La provincia a la que pertenece el concentrador
 *         ciudad:
 *           type: string
 *           description: La provincia a la que pertenece el concentrador
 *         parroquia:
 *           type: string
 *           description: La provincia a la que pertenece el concentrador
 *         canton:
 *           type: string
 *           description: La provincia a la que pertenece el concentrador
 *         barrio:
 *           type: string
 *           description: La provincia a la que pertenece el concentrador
 *         region:
 *           type: ObjectId
 *           description: region a la que pertenece la empresa dueña del concentrador 
 *       example:
 *         serial: string
 *         codigoPostal: string
 *         password: string
 *         frecuencia: string
 *         latitud: Number
 *         longitud: Number
 *         empresa: ObjectId
 *         provincia: string
 *         ciudad: string
 *         parroquia: string
 *         canton: string
 *         barrio: string
 *         region: string
 *     Collector:
 *       type: object
 *       required:
 *         - DeviceAddr
 *       properties:
 *         DeviceAddr:
 *           type: string
 *           description: Numero identificador del concentrador
 *       example:
 *         DeviceAddr: "000075500001"
 */
/**
 * @swagger
 * tags:
 *   name: Concentradores
 *   description: CRUD Concentrador
 * /api/concentradores/status:
 *   post:
 *     summary: Obtener el status de un concentrador desde la api externa
 *     tags: [Concentradores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Collector'
 *     responses:
 *       200:
 *         description: Concentrador Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Collector'
 *       500:
 *         description: Some server error
 * /api/concentradores:
 *   post:
 *     summary: Crear Concentrador
 *     tags: [Concentradores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Concentrador'
 *     responses:
 *       200:
 *         description: Concentrador Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Concentrador'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todos los Concentrador
 *     tags: [Concentradores]
 *     responses:
 *       200:
 *         description: Lista de Concentrador
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Concentrador'
 * 
 * /api/concentradores/{id}:
 *   put:
 *    summary: Actualizar Concentrador por id
 *    tags: [Concentradores]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Concentrador id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Concentrador'
 *    responses:
 *      200:
 *        description: El Concentrador fue actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Concentrador'
 *      400:
 *        description: El Concentrador no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Concentrador por id
 *     tags: [Concentradores]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Concentrador id
 *     responses:
 *       200:
 *         description: Devuelve el Concentrador con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Concentrador'
 *       400:
 *         description: The book was not found
 *   delete:
 *     summary: Eliminación lógica del Concentrador por id
 *     tags: [Concentradores]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Concentrador id
 *
 *     responses:
 *       200:
 *         description: El Concentrador fue eliminado
 *       400:
 *         description: El Concentrador no existe
 */


const router = Router();

router.get('/', obtenerConcentradores);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(concentradorExiste),
    validarCampos
], obtenerConcentrador);

router.post('/', [
    //validarJWT,
    //esEmpresaRole,
    check('serial', 'El número de serie es obligatorio').not().isEmpty(),
    check('codigoPostal', 'El codigo postal es obligatorio').not().isEmpty(),
    check('empresa', 'No es un ID de empresa válido').isMongoId(),
    check('empresa').custom(empresaExiste),
    check('region', 'No es un ID de region válido').isMongoId(),
    check('region').custom(regionExiste),
    check('password', 'El password es obligatorio').not().isEmpty(),
    check('latitud', 'La latitud es obligatoria').not().isEmpty(),
    check('longitud', 'La longitud es obligatoria').not().isEmpty(),
    check('frecuencia', 'No es un ID válido').isMongoId(),
    check('frecuencia').custom(frecuenciaExiste),
    check('parroquia', 'No es un ID válido').isMongoId(),
    check('parroquia').custom(parroquiaExiste),
    check('canton', 'No es un ID válido').isMongoId(),
    check('canton').custom(cantonExiste),
    check('ciudad', 'No es un ID válido').isMongoId(),
    check('ciudad').custom(ciudadExiste),
    check('provincia', 'No es un ID válido').isMongoId(),
    check('provincia').custom(provinciaExiste),
    check('barrio', 'No es un ID válido').isMongoId(),
    check('barrio').custom(barrioExiste),
    check('transformador').custom(transformadorExiste),
    validarCampos
], crearConcentrador)

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(concentradorExiste),
    validarCampos
], actualizarCocentrador);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(concentradorExiste),
    validarCampos,
], eliminarConcentrador);

router.post('/status', obtenerEstatusConcentrador)
router.get('/medidores-numerador-actual/:idConcentrador', [
    check('idConcentrador', 'No es un ID de medidor válido').isMongoId(),
    check('idConcentrador').custom(concentradorExiste),
], obtenerMedidoresNumActByConcentrador)

module.exports = router;