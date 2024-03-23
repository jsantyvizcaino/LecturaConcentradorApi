const { Router } = require('express');
const { check } = require('express-validator');
const { empresaExiste, regionExiste } = require('../utils/validadores');
const { obtenerEmpresas, obtenerEmpresa, actualizarEmpresa, crearEmpresa, eliminarEmpresa } = require('../controllers/');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');



/**
 * @swagger
 * components:
 *   schemas:
 *     Empresa:
 *       type: object
 *       required:
 *         - nombre
 *         - region
 *         - porcentaje
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la empresa
 *         region:
 *           type: string
 *           description: id de la region a la que pertenece la empresa
 *         porcentaje:
 *           type: number
 *           description: El porcentaje de aplicación de la empresa
 *       example:
 *         nombre: string
 *         region: string
 *         porcentaje: number
 */

/**
 * @swagger
 * tags:
 *   name: Empresa
 *   description: CRUD Empresa
 * /api/empresas:
 *   post:
 *     summary: Crear Region
 *     tags: [Empresa]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Empresa'
 *     responses:
 *       200:
 *         description: Empresa creada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todas las Empresas
 *     tags: [Empresa]
 *     responses:
 *       200:
 *         description: Lista de Empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empresa'
 * 
 * /api/empresas/{id}:
 *   put:
 *    summary: Actualizar Empresa por id
 *    tags: [Empresa]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Empresa id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Empresa'
 *    responses:
 *      200:
 *        description: la Empresa fue actualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Empresa'
 *      400:
 *        description: La Empresa no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Empresa por id
 *     tags: [Empresa]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Empresa id
 *     responses:
 *       200:
 *         description: Devuelve la Empresa con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Empresa'
 *       400:
 *         description: The Empresa was not found
 *   delete:
 *     summary: Eliminación de la Empresa por id
 *     tags: [Empresa]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Empresa id
 *
 *     responses:
 *       200:
 *         description: La Empresa fue eliminada
 *       400:
 *         description: La Empresa no existe
 */

const router = Router();


router.get('/', obtenerEmpresas);


router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(empresaExiste),
    validarCampos
], obtenerEmpresa);


router.post('/', [
    //validarJWT,
    //esEmpresaRole,
    check('nombre', 'El nombre de la empresa es obligatorio').not().isEmpty(),
    check('porcentaje', 'El porcentaje de aplicación de la empresa es obligatorio').not().isEmpty(),
    check('region', 'El area es obligatorio').not().isEmpty(),
    check('region', 'No es un ID de region válido').isMongoId(),
    check('region').custom(regionExiste),
    validarCampos
], crearEmpresa)

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(empresaExiste),
    validarCampos
], actualizarEmpresa);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(empresaExiste),
    validarCampos,
], eliminarEmpresa);


module.exports = router;