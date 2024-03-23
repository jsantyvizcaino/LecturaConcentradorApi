const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerClientes, obtenerCliente, crearCliente, actualizarCliente, eliminarCliente } = require('../controllers');
const { esPasswordCorrecto, clienteExiste, medidorExiste, cedulaExiste, verificarCedula, emailExistente } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');
const router = Router();


/**
 * @swagger
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       required:
 *         - username
 *         - nombre
 *         - apellido
 *         - correo
 *         - password
 *         - cedula
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           description: Nombre del cliente en la aplicación
 *         nombre:
 *           type: string
 *           description: Nombre del cliente
 *         apellido:
 *           type: string
 *           description: Apellido del cliente
 *         correo:
 *           type: string
 *           description: Correo del cliente
 *         password:
 *           type: string
 *           description: Password del cliente
 *         cedula:
 *           type: Number
 *           description: numero de cedula del cliente
 *         role:
 *           type: string
 *           description: id del role
 *       example:
 *         username: string
 *         nombre: string
 *         apellido: string
 *         correo: string
 *         password: string
 *         cedula: number
 *         role: string
 */

/**
 * @swagger
 * tags:
 *   name: Clientes
 *   description: CRUD CLIENTES
 * /api/clientes:
 *   post:
 *     summary: Crear usuarios
 *     tags: [Clientes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Usuario Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todos los usuarios
 *     tags: [Clientes]
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 * 
 * /api/clientes/{id}:
 *   put:
 *    summary: Actualizar cliente por id
 *    tags: [Clientes]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: cliente id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Cliente'
 *    responses:
 *      200:
 *        description: El cliente fue actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Cliente'
 *      400:
 *        description: El cliente no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener cliente por id
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: CLiente id
 *     responses:
 *       200:
 *         description: Devuelve el cliente con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: The cliente was not found
 *   delete:
 *     summary: Eliminación lógica del cliente por id
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The cliente id
 *
 *     responses:
 *       200:
 *         description: El cliente fue eliminado
 *       400:
 *         description: El cliente no existe
 */


router.get('/', obtenerClientes);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(clienteExiste),
    validarCampos
], obtenerCliente);

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(clienteExiste),
    validarCampos
], actualizarCliente);

router.post('/', [
    check('username', 'El username es obligatorio').not().isEmpty(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('correo').custom(emailExistente),
    check('correo', 'El correo debe tener un formato valido').isEmail(),
    check('password').custom(esPasswordCorrecto),
    check('cedula').custom(verificarCedula),
    check('cedula').custom(cedulaExiste),
    validarCampos
], crearCliente);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(clienteExiste),
    validarCampos,
], eliminarCliente);


module.exports = router;