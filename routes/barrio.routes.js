const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerBarrios, obtenerBarrio, actualizarBarrio, crearBarrio, eliminarBarrio } = require('../controllers/');
const { barrioExiste, parroquiaExiste, cantonExiste, ciudadExiste, provinciaExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');

/**
 * @swagger
 * components:
 *   schemas:
 *     Barrio:
 *       type: object
 *       required:
 *         - nombre
 *         - parroquia
 *         - canton
 *         - ciudad
 *         - provincia
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la Barrio
 *         parroquia:
 *           type: string
 *           description: Nombre de la parroquia
 *         canton:
 *           type: string
 *           description: Nombre de la canton
 *         ciudad:
 *           type: string
 *           description: Nombre de la ciudad
 *         provincia:
 *           type: string
 *           description: Nombre de la parroquia
 *       example:
 *         nombre: string
 *         parroquia: string
 *         canton: string
 *         ciudad: string
 *         provincia: string
 */
/**
 * @swagger
 * tags:
 *   name: Barrio
 *   description: CRUD Barrio
 * /api/barrios:
 *   post:
 *     summary: Crear Barrio
 *     tags: [Barrio]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Barrio'
 *     responses:
 *       200:
 *         description: Barrio Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Barrio'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todas las Barrio
 *     tags: [Barrio]
 *     responses:
 *       200:
 *         description: Lista de Barrio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Barrio'
 * 
 * /api/barrios/{id}:
 *   put:
 *    summary: Actualizar Barrio por id
 *    tags: [Barrio]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Barrio id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Barrio'
 *    responses:
 *      200:
 *        description: la Barrio fue actualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Barrio'
 *      400:
 *        description: La Barrio no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Barrio por id
 *     tags: [Barrio]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Barrio id
 *     responses:
 *       200:
 *         description: Devuelve la Barrio con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Barrio'
 *       400:
 *         description: The Barrio was not found
 *   delete:
 *     summary: Eliminación de la Barrio por id
 *     tags: [Barrio]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Barrio id
 *
 *     responses:
 *       200:
 *         description: La Barrio fue eliminado
 *       400:
 *         description: La Barrio no existe
 */


const router = Router();

router.get('/', obtenerBarrios);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(barrioExiste),
    validarCampos
], obtenerBarrio);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(barrioExiste),
    validarCampos
], actualizarBarrio);


router.post('/', [
    check('nombre', 'El nombre de la provincia es obligatorio').not().isEmpty(),
    check('parroquia', 'No es un ID válido').isMongoId(),
    check('parroquia').custom(parroquiaExiste),
    check('canton', 'No es un ID válido').isMongoId(),
    check('canton').custom(cantonExiste),
    check('ciudad', 'No es un ID válido').isMongoId(),
    check('ciudad').custom(ciudadExiste),
    check('provincia', 'No es un ID válido').isMongoId(),
    check('provincia').custom(provinciaExiste),
    validarCampos
], crearBarrio);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(barrioExiste),
    validarCampos,
], eliminarBarrio);

module.exports = router;