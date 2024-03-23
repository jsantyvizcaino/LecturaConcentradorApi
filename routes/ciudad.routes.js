const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerCiudades, obtenerCiudad, actualizarCiudad, crearCiudad, eliminarCiudad } = require('../controllers/');
const { provinciaExiste, ciudadExiste, parroquiaExiste, cantonExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');

/**
 * @swagger
 * components:
 *   schemas:
 *     Ciudad:
 *       type: object
 *       required:
 *         - nombre
 *         - parroquia
 *         - canton
 *         - provincia
 *       properties:
 *         nombre:
 *           type: string
 *           description: Nombre de la Ciudad
 *         parroquia:
 *           type: string
 *           description: id de la parroquia
 *         canton:
 *           type: string
 *           description: id de la canton
 *         provincia:
 *           type: string
 *           description: id de la provincia
 *       example:
 *         nombre: string
 *         parroquia: string
 *         canton: string
 *         provincia: string
 */
/**
 * @swagger
 * tags:
 *   name: Ciudad
 *   description: CRUD Ciudad
 * /api/ciudades:
 *   post:
 *     summary: Crear Ciudad
 *     tags: [Ciudad]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ciudad'
 *     responses:
 *       200:
 *         description: Ciudad Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ciudad'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todas las Ciudad
 *     tags: [Ciudad]
 *     responses:
 *       200:
 *         description: Lista de Ciudad
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ciudad'
 * 
 * /api/ciudades/{id}:
 *   put:
 *    summary: Actualizar Ciudad por id
 *    tags: [Ciudad]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Ciudad id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Ciudad'
 *    responses:
 *      200:
 *        description: la Ciudad fue actualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Ciudad'
 *      400:
 *        description: La Ciudad no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener Ciudad por id
 *     tags: [Ciudad]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Ciudad id
 *     responses:
 *       200:
 *         description: Devuelve la Ciudad con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ciudad'
 *       400:
 *         description: The Ciudad was not found
 *   delete:
 *     summary: Eliminación de la Ciudad por id
 *     tags: [Ciudad]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Ciudad id
 *
 *     responses:
 *       200:
 *         description: La Ciudad fue eliminado
 *       400:
 *         description: La Ciudad no existe
 */


const router = Router();

router.get('/', obtenerCiudades);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(ciudadExiste),
    validarCampos
], obtenerCiudad);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(ciudadExiste),
    validarCampos
], actualizarCiudad);


router.post('/', [
    check('nombre', 'El nombre de la ciudad es obligatorio').not().isEmpty(),
    check('provincia', 'No es un ID válido').isMongoId(),
    check('provincia').custom(provinciaExiste),
    check('canton', 'No es un ID válido').isMongoId(),
    check('canton').custom(cantonExiste),
    check('parroquia', 'No es un ID válido').isMongoId(),
    check('parroquia').custom(parroquiaExiste),
    check('nombre', 'El nombre de la ciudad es obligatorio').not().isEmpty(),
    validarCampos
], crearCiudad);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(ciudadExiste),
    validarCampos,
], eliminarCiudad);

module.exports = router;