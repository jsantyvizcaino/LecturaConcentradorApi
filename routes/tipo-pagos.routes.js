const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');
const { obtenerTipoPagos, obtenerTipoPago, actualizarTipoPago, crearTipoPago, eliminarTipoPago } = require('../controllers');
const { tipoPagoExiste } = require('../utils/validadores');

/**
 * @swagger
 * components:
 *   schemas:
 *     Tipo-Pagos:
 *       type: object
 *       required:
 *         - pago
 *       properties:
 *         pago:
 *           type: string
 *           description: Nombre del tipo de pago
 *       example:
 *         pago: string
 */

/**
 * @swagger
 * tags:
 *   name: Tipo-Pagos
 *   description: CRUD de tipo de pagos
 * /api/tipo-pagos:
 *   post:
 *     summary: Crear Tipo de pago
 *     tags: [Tipo-Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tipo-Pagos'
 *     responses:
 *       200:
 *         description: Tipo de pago Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tipo-Pagos'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todos los tipos de pago
 *     tags: [Tipo-Pagos]
 *     responses:
 *       200:
 *         description: Lista de tipo de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tipo-Pagos'
 * 
 * /api/tipo-pagos/{id}:
 *   put:
 *    summary: Actualizar Tipo de pago por id
 *    tags: [Tipo-Pagos]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Id del tipo de pago
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Tipo-Pagos'
 *    responses:
 *      200:
 *        description: El tipo de pago fue actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tipo-Pagos'
 *      400:
 *        description: El tipo de pago no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener tipo de pago por id
 *     tags: [Tipo-Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: id del tipo de pago
 *     responses:
 *       200:
 *         description: Devuelve el tipo de pago con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tipo-Pagos'
 *       400:
 *         description: The Role was not found
 *   delete:
 *     summary: Eliminación lógica del tipo de pago por id
 *     tags: [Tipo-Pagos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The tipo de pago id
 *
 *     responses:
 *       200:
 *         description: El tipo de pago fue eliminado
 *       400:
 *         description: El tipo de pago no existe
 */

const router = Router();

router.get('/', obtenerTipoPagos);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(tipoPagoExiste),
    validarCampos
], obtenerTipoPago);

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(tipoPagoExiste),
    validarCampos
], actualizarTipoPago);

router.post('/', [
    check('pago', 'El nombre del tipo de pago es obligatorio').not().isEmpty(),
    validarCampos
], crearTipoPago);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(tipoPagoExiste),
    validarCampos,
], eliminarTipoPago);

module.exports = router;