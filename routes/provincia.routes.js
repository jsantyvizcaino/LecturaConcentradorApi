const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerProvincias, obtenerProvincia, actualizarProvincia, crearProvincia, eliminarProvincia } = require('../controllers/');
const { provinciaExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');

/**
 * @swagger
 * components:
 *   schemas:
 *     Provincia:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la provincia
 *       example:
 *         nombre: string
 */
/**
 * @swagger
 * tags:
 *   name: Provincia
 *   description: CRUD Provincia
 * /api/provincias:
 *   post:
 *     summary: Crear Region
 *     tags: [Provincia]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Provincia'
 *     responses:
 *       200:
 *         description: Provincia Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Provincia'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todas las Provincia
 *     tags: [Provincia]
 *     responses:
 *       200:
 *         description: Lista de Provincia
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Provincia'
 * 
 * /api/provincias/{id}:
 *   put:
 *    summary: Actualizar Provincia por id
 *    tags: [Provincia]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Provincia id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Provincia'
 *    responses:
 *      200:
 *        description: la Provincia fue actualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Provincia'
 *      400:
 *        description: La Provincia no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Provincia por id
 *     tags: [Provincia]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Provincia id
 *     responses:
 *       200:
 *         description: Devuelve la Provincia con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Provincia'
 *       400:
 *         description: The Provincia was not found
 *   delete:
 *     summary: Eliminación de la Provincia por id
 *     tags: [Provincia]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Provincia id
 *
 *     responses:
 *       200:
 *         description: La Provincia fue eliminado
 *       400:
 *         description: La Provincia no existe
 */


const router = Router();

router.get('/', obtenerProvincias);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(provinciaExiste),
    validarCampos
], obtenerProvincia);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(provinciaExiste),
    validarCampos
], actualizarProvincia);


router.post('/', [
    check('nombre', 'El nombre de la provincia es obligatorio').not().isEmpty(),
    validarCampos
], crearProvincia);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(provinciaExiste),
    validarCampos,
], eliminarProvincia);

module.exports = router;