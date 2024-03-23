const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerRoles, obtenerRole, actualizarRole, crearRole, eliminarRole } = require('../controllers/');
const { rolExistente } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');


/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         role:
 *           type: string
 *           description: Nombre del role
 *       example:
 *         role: string
 */
/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: CRUD ROLES
 * /api/roles:
 *   post:
 *     summary: Crear Role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: Role Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todos los Roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Lista de Roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 * 
 * /api/roles/{id}:
 *   put:
 *    summary: Actualizar Role por id
 *    tags: [Roles]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Role id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Role'
 *    responses:
 *      200:
 *        description: El Role fue actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Role'
 *      400:
 *        description: El Role no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Role por id
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Role id
 *     responses:
 *       200:
 *         description: Devuelve el Role con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       400:
 *         description: The Role was not found
 *   delete:
 *     summary: Eliminación lógica del Role por id
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Role id
 *
 *     responses:
 *       200:
 *         description: El Role fue eliminado
 *       400:
 *         description: El Role no existe
 */

const router = Router();

router.get('/', obtenerRoles);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(rolExistente),
    validarCampos
], obtenerRole);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(rolExistente),
    validarCampos
], actualizarRole);


router.post('/', [
    check('role', 'El nombre del role es obligatorio').not().isEmpty(),
    validarCampos
], crearRole);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(rolExistente),
    validarCampos,
], eliminarRole);

module.exports = router;