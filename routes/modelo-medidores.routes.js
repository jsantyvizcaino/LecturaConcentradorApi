const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerModelos, obtenerModelo, actualizarModelo, crearModelo, eliminarModelo } = require('../controllers/');
const { modeloExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');


/**
 * @swagger
 * components:
 *   schemas:
 *     ModeloMedidor:
 *       type: object
 *       required:
 *         - nombre
 *         - idApiExterna
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre del tipo de medidor
 *         idApiExterna:
 *           type: number
 *           description: id perteneciente al medidor en la api externa ver documentación de la misma
 *       example:
 *         nombre: hexcell
 *         idApiExterna: 1
 */

/**
 * @swagger
 * tags:
 *   name: ModeloMedidor
 *   description: CRUD ModeloMedidor
 * /api/modelos-medidor:
 *   post:
 *     summary: Crear ModeloMedidor
 *     tags: [ModeloMedidor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModeloMedidor'
 *     responses:
 *       200:
 *         description: ModeloMedidor Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModeloMedidor'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todas las ModeloMedidor
 *     tags: [ModeloMedidor]
 *     responses:
 *       200:
 *         description: Lista de ModeloMedidor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ModeloMedidor'
 * 
 * /api/modelos-medidor/{id}:
 *   put:
 *    summary: Actualizar ModeloMedidor por id
 *    tags: [ModeloMedidor]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: ModeloMedidor id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ModeloMedidor'
 *    responses:
 *      200:
 *        description: la ModeloMedidor fue actualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ModeloMedidor'
 *      400:
 *        description: La ModeloMedidor no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener ModeloMedidor por id
 *     tags: [ModeloMedidor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ModeloMedidor id
 *     responses:
 *       200:
 *         description: Devuelve la ModeloMedidor con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModeloMedidor'
 *       400:
 *         description: The ModeloMedidor was not found
 *   delete:
 *     summary: Eliminación de la ModeloMedidor por id
 *     tags: [ModeloMedidor]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ModeloMedidor id
 *
 *     responses:
 *       200:
 *         description: La ModeloMedidor fue eliminado
 *       400:
 *         description: La ModeloMedidor no existe
 */

const router = Router();

router.get('/', obtenerModelos);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(modeloExiste),
    validarCampos
], obtenerModelo);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(modeloExiste),
    validarCampos
], actualizarModelo);


router.post('/', [
    check('nombre', 'El nombre del tipo de modelo es obligatorio').not().isEmpty(),
    check('idApiExterna', 'El id correspondiente a la api externa es obligatorio').not().isEmpty(),
    validarCampos
], crearModelo);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(modeloExiste),
    validarCampos,
], eliminarModelo);

module.exports = router;