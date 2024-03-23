const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerParroquias, obtenerParroquia, actualizarParroquia, crearParroquia, eliminarParroquia } = require('../controllers/');
const { parroquiaExiste, ciudadExiste, cantonExiste, provinciaExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');

/**
 * @swagger
 * components:
 *   schemas:
 *     Parroquia:
 *       type: object
 *       required:
 *         - nombre
 *         - canton
 *         - provincia
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la Parroquia
 *         canton:
 *           type: string
 *           description: id de la canton
 *         provincia:
 *           type: string
 *           description: id de la provincia
 *       example:
 *         nombre: string
 *         canton: string
 *         provincia: string
 */
/**
 * @swagger
 * tags:
 *   name: Parroquia
 *   description: CRUD Parroquia
 * /api/parroquias:
 *   post:
 *     summary: Crear Parroquia
 *     tags: [Parroquia]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Parroquia'
 *     responses:
 *       200:
 *         description: Parroquia Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Parroquia'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todas las Parroquia
 *     tags: [Parroquia]
 *     responses:
 *       200:
 *         description: Lista de Parroquia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Parroquia'
 * 
 * /api/parroquias/{id}:
 *   put:
 *    summary: Actualizar Parroquia por id
 *    tags: [Parroquia]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Parroquia id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Parroquia'
 *    responses:
 *      200:
 *        description: la Parroquia fue actualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Parroquia'
 *      400:
 *        description: La Parroquia no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Parroquia por id
 *     tags: [Parroquia]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Parroquia id
 *     responses:
 *       200:
 *         description: Devuelve la Parroquia con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Parroquia'
 *       400:
 *         description: The Parroquia was not found
 *   delete:
 *     summary: Eliminación de la Parroquia por id
 *     tags: [Parroquia]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Parroquia id
 *
 *     responses:
 *       200:
 *         description: La Parroquia fue eliminado
 *       400:
 *         description: La Parroquia no existe
 */


const router = Router();

router.get('/', obtenerParroquias);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(parroquiaExiste),
    validarCampos
], obtenerParroquia);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(parroquiaExiste),
    validarCampos
], actualizarParroquia);


router.post('/', [
    check('nombre', 'El nombre de la provincia es obligatorio').not().isEmpty(),
    check('canton', 'No es un ID válido').isMongoId(),
    check('canton').custom(cantonExiste),
    check('provincia', 'No es un ID válido').isMongoId(),
    check('provincia').custom(provinciaExiste),
    validarCampos
], crearParroquia);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(parroquiaExiste),
    validarCampos,
], eliminarParroquia);

module.exports = router;