const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerGruposConsumo, obtenerGrupoConsumo, actualizarGrupoConsumo, crearGrupoConsumo, eliminarGrupoConsumo } = require('../controllers/');
const { regionExiste, grupoConsumoExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');


/**
 * @swagger
 * components:
 *   schemas:
 *     GrupoConsumo:
 *       type: object
 *       required:
 *         - grupo
 *       properties:
 *         grupo:
 *           type: string
 *           description: Nombre del grupo de consumo
 *       example:
 *         grupo: string
 */

/**
 * @swagger
 * tags:
 *   name: GrupoConsumo
 *   description: CRUD Grupos Consumo
 * /api/grupos-consumo:
 *   post:
 *     summary: Crear Grupos Consumo
 *     tags: [GrupoConsumo]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GrupoConsumo'
 *     responses:
 *       200:
 *         description: Grupo consumo Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrupoConsumo'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todos los Grupo Consumo
 *     tags: [GrupoConsumo]
 *     responses:
 *       200:
 *         description: Lista de Grupos Consumo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GrupoConsumo'
 * 
 * /api/grupos-consumo/{id}:
 *   put:
 *    summary: Actualizar Grupo Consumo por id
 *    tags: [GrupoConsumo]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Grupo Consumo id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/GrupoConsumo'
 *    responses:
 *      200:
 *        description: el Grupo Consumo fue actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/GrupoConsumo'
 *      400:
 *        description: el Grupo Consumo no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Grupo Consumo por id
 *     tags: [GrupoConsumo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Grupo Consumo id
 *     responses:
 *       200:
 *         description: Devuelve el grupo consumo consultado
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GrupoConsumo'
 *       400:
 *         description: The grupo consumo was not found
 *   delete:
 *     summary: Eliminación del grupo consumo por id
 *     tags: [GrupoConsumo]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The grupo consumo id
 *
 *     responses:
 *       200:
 *         description: El grupo consumo fue eliminado
 *       400:
 *         description: El grupo consumo no existe
 */



const router = Router();

router.get('/', obtenerGruposConsumo);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(grupoConsumoExiste),
    validarCampos
], obtenerGrupoConsumo);

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(grupoConsumoExiste),
    validarCampos
], actualizarGrupoConsumo);

router.post('/', [
    check('grupo', 'El nombre del grupo es obligatorio').not().isEmpty(),
    validarCampos
], crearGrupoConsumo);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(grupoConsumoExiste),
    validarCampos,
], eliminarGrupoConsumo);

module.exports = router;