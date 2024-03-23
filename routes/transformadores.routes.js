const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerTransformadores, crearTransformador, eliminarTransformador, obtenerTransformador, actualizarTransformador } = require('../controllers');
const { usuarioExiste, transformadorExiste, empresaExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido, esEmpresaRole } = require('../middlewares');


/**
 * @swagger
 * components:
 *   schemas:
 *     Transformador:
 *       type: object
 *       required:
 *         - serial
 *         - empresa
 *       properties:
 *         serial:
 *           type: string
 *           description: Numero identificador del trandofrmador
 *         empresa:
 *           type: string
 *           description: Identificador de la empresa
 *       example:
 *         serial: string
 *         empresa: string
 */
/**
 * @swagger
 * tags:
 *   name: Transformador
 *   description: CRUD Transformador
 * /api/transformadores:
 *   post:
 *     summary: Crear Transformador
 *     tags: [Transformador]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transformador'
 *     responses:
 *       200:
 *         description: Transformador Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transformador'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todos los Transformador
 *     tags: [Transformador]
 *     responses:
 *       200:
 *         description: Lista de Transformador
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transformador'
 * 
 * /api/transformadores/{id}:
 *   put:
 *    summary: Actualizar Transformador por id
 *    tags: [Transformador]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Transformador id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Transformador'
 *    responses:
 *      200:
 *        description: El Transformador fue actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Transformador'
 *      400:
 *        description: El Transformador no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Transformador por id
 *     tags: [Transformador]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Transformador id
 *     responses:
 *       200:
 *         description: Devuelve el Transformador con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transformador'
 *       400:
 *         description: The Transformador was not found
 *   delete:
 *     summary: Eliminación lógica del Transformador por id
 *     tags: [Transformador]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Transformador id
 *
 *     responses:
 *       200:
 *         description: El Transformador fue eliminado
 *       400:
 *         description: El Transformador no existe
 */


const router = Router();

router.get('/', obtenerTransformadores);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(transformadorExiste),
    validarCampos
], obtenerTransformador);

router.post('/', [
    //validarJWT,
    //esEmpresaRole,
    check('serial', 'El número de serie es obligatorio').not().isEmpty(),
    check('empresa', 'No es un ID de empresa válido').isMongoId(),
    check('empresa').custom(empresaExiste),
    validarCampos
], crearTransformador)


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(transformadorExiste),
    validarCampos
], actualizarTransformador);


router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(transformadorExiste),
    validarCampos,
], eliminarTransformador);

module.exports = router;