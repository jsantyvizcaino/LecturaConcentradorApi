const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerCantones, obtenerCanton, actualizarCanton, crearCanton, eliminarCanton } = require('../controllers/');
const { cantonExiste, parroquiaExiste, ciudadExiste, provinciaExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');

/**
 * @swagger
 * components:
 *   schemas:
 *     Canton:
 *       type: object
 *       required:
 *         - nombre
 *         - provincia
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la Canton
 *         provincia:
 *           type: string
 *           description: id de la provincia
 *       example:
 *         nombre: string
 *         provincia: string
 */
/**
 * @swagger
 * tags:
 *   name: Canton
 *   description: CRUD Canton
 * /api/cantones:
 *   post:
 *     summary: Crear Canton
 *     tags: [Canton]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Canton'
 *     responses:
 *       200:
 *         description: Canton Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Canton'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todas las Canton
 *     tags: [Canton]
 *     responses:
 *       200:
 *         description: Lista de Canton
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Canton'
 * 
 * /api/cantones/{id}:
 *   put:
 *    summary: Actualizar Canton por id
 *    tags: [Canton]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Canton id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Canton'
 *    responses:
 *      200:
 *        description: la Canton fue actualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Canton'
 *      400:
 *        description: La Canton no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Canton por id
 *     tags: [Canton]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Canton id
 *     responses:
 *       200:
 *         description: Devuelve la Canton con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Canton'
 *       400:
 *         description: The Canton was not found
 *   delete:
 *     summary: Eliminación de la Canton por id
 *     tags: [Canton]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Canton id
 *
 *     responses:
 *       200:
 *         description: La Canton fue eliminado
 *       400:
 *         description: La Canton no existe
 */


const router = Router();

router.get('/', obtenerCantones);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(cantonExiste),
    validarCampos
], obtenerCanton);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(cantonExiste),
    validarCampos
], actualizarCanton);


router.post('/', [
    check('nombre', 'El nombre del canton es obligatorio').not().isEmpty(),
    check('provincia', 'No es un ID válido').isMongoId(),
    check('provincia').custom(provinciaExiste),
    validarCampos
], crearCanton);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(cantonExiste),
    validarCampos,
], eliminarCanton);

module.exports = router;