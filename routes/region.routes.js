const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerRegiones, obtenerRegion, actualizarRegion, crearRegion, eliminarRegion } = require('../controllers/');
const { regionExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');


/**
 * @swagger
 * components:
 *   schemas:
 *     Region:
 *       type: object
 *       required:
 *         - region
 *       properties:
 *         region:
 *           type: string
 *           description: Nombre de la region
 *       example:
 *         region: string
 */

/**
 * @swagger
 * tags:
 *   name: Regiones
 *   description: CRUD Regiones
 * /api/regiones:
 *   post:
 *     summary: Crear Region
 *     tags: [Regiones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Region'
 *     responses:
 *       200:
 *         description: Region Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Region'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todas las Regiones
 *     tags: [Regiones]
 *     responses:
 *       200:
 *         description: Lista de Regiones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Region'
 * 
 * /api/regiones/{id}:
 *   put:
 *    summary: Actualizar Region por id
 *    tags: [Regiones]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Region id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Region'
 *    responses:
 *      200:
 *        description: la region fue actualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Region'
 *      400:
 *        description: La region no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Region por id
 *     tags: [Regiones]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Region id
 *     responses:
 *       200:
 *         description: Devuelve la region con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Region'
 *       400:
 *         description: The Region was not found
 *   delete:
 *     summary: Eliminación de la Region por id
 *     tags: [Regiones]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Region id
 *
 *     responses:
 *       200:
 *         description: La region fue eliminado
 *       400:
 *         description: La region no existe
 */

const router = Router();

router.get('/', obtenerRegiones);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(regionExiste),
    validarCampos
], obtenerRegion);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(regionExiste),
    validarCampos
], actualizarRegion);


router.post('/', [
    check('region', 'El nombre de la region es obligatorio').not().isEmpty(),
    validarCampos
], crearRegion);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(regionExiste),
    validarCampos,
], eliminarRegion);

module.exports = router;