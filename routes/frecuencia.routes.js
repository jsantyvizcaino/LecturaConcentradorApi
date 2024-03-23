const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerFrecuencias, obtenerFrecuencia, actualizarFrecuencia, crearFrecuencia, eliminarFrecuencia } = require('../controllers');
const { frecuenciaExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');

/**
 * @swagger
 * components:
 *   schemas:
 *     Frecuencia:
 *       type: object
 *       required:
 *         - minutos
 *         - nombre
 *       properties:
 *         minutos:
 *           type: number
 *           description: numero de Frecuencia
 *         nombre:
 *           type: string
 *           description: nombre de la Frecuencia
 *       example:
 *         minutos: number
 *         nombre: string
 */

/**
 * @swagger
 * tags:
 *   name: Frecuencia
 *   description: CRUD Frecuencia
 * /api/frecuencias:
 *   post:
 *     summary: Crear Frecuencia
 *     tags: [Frecuencia]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Frecuencia'
 *     responses:
 *       200:
 *         description: Frecuencia Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Frecuencia'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todas las Frecuencias
 *     tags: [Frecuencia]
 *     responses:
 *       200:
 *         description: Lista de Frecuencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Frecuencia'
 * 
 * /api/frecuencias/{id}:
 *   put:
 *    summary: Actualizar Frecuencia por id
 *    tags: [Frecuencia]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Frecuencia id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Frecuencia'
 *    responses:
 *      200:
 *        description: la Frecuencia fue actualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Frecuencia'
 *      400:
 *        description: La Frecuencia no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Frecuencia por id
 *     tags: [Frecuencia]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Frecuencia id
 *     responses:
 *       200:
 *         description: Devuelve la Frecuencia con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Frecuencia'
 *       400:
 *         description: The Frecuencia was not found
 *   delete:
 *     summary: Eliminación de la Frecuencia por id
 *     tags: [Frecuencia]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Frecuencia id
 *
 *     responses:
 *       200:
 *         description: La Frecuencia fue eliminado
 *       400:
 *         description: La Frecuencia no existe
 */



const router = Router();

router.get('/', obtenerFrecuencias);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(frecuenciaExiste),
    validarCampos
], obtenerFrecuencia);

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(frecuenciaExiste),
    validarCampos
], actualizarFrecuencia);

router.post('/', [
    check('nombre', 'El nombre de la frecuencia es obligatorio').not().isEmpty(),
    check('minutos', 'Se debe colocar los minutos').not().equals(0),
    validarCampos
], crearFrecuencia);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(frecuenciaExiste),
    validarCampos,
], eliminarFrecuencia);

module.exports = router;