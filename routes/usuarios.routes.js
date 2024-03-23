const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerUsuarios, obtenerUsuario, crearUsuario, actualizarUsuario, eliminarUsuarios, usuariosPatch } = require('../controllers');
const { emailExistente, esPasswordCorrecto, rolNombreExistente, usuarioExiste, rolExistente, esEmpresaValida, empresaExiste, empresaOpcionalExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - username
 *         - nombre
 *         - apellido
 *         - correo
 *         - password
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           description: Nombre del usuario en la aplicación
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         apellido:
 *           type: string
 *           description: Apellido del usuario
 *         correo:
 *           type: string
 *           description: Correo del usuario
 *         password:
 *           type: string
 *           description: Password del usuario
 *         role:
 *           type: string
 *           description: id del Rol del usuario
 *         empresa:
 *           type: string
 *           description: id de la empresa
 *       example:
 *         username: string
 *         nombre: string
 *         apellido: string
 *         correo: string
 *         password: string
 *         role: string
 *         empresa: string
 */
/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: CRUD USUARIO
 * /api/usuarios:
 *   post:
 *     summary: Crear usuarios
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario Creado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       500:
 *         description: Some server error
 *
 *   get:
 *     summary: Devuelve todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 * 
 * /api/usuarios/{id}:
 *   put:
 *    summary: Actualizar usuario por id
 *    tags: [Usuarios]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: Usuario id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Usuario'
 *    responses:
 *      200:
 *        description: El usuario fue actualizado
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Usuario'
 *      400:
 *        description: El usuario no fue encontrado
 *      500:
 *        description: Ocurrió un error, pongase en contacto con el administrador
 *
 *   get:
 *     summary: Obtener usuario por id
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Usuario id
 *     responses:
 *       200:
 *         description: Devuelve el usuario con el id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: The book was not found
 *   delete:
 *     summary: Eliminación lógica del usuario por id
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *
 *     responses:
 *       200:
 *         description: El usuario fue eliminado
 *       400:
 *         description: El usuario no existe
 */

router.get('/', obtenerUsuarios);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(usuarioExiste),
    validarCampos
], obtenerUsuario);

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(usuarioExiste),
    check('role', 'No es un ID de role válido').isMongoId(),
    check('role').custom(rolExistente),
    validarCampos
], actualizarUsuario);

router.patch('/', usuariosPatch);

router.post('/', [
    check('username', 'El username es obligatorio').not().isEmpty(),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    check('correo', 'El correo debe tener un formato valido').isEmail(),
    check('correo').custom(emailExistente),
    check('password').custom(esPasswordCorrecto),
    check('role', 'No es un ID de role válido').isMongoId(),
    check('role').custom(rolExistente),
    check('empresa').custom(empresaOpcionalExiste),
    validarCampos
], crearUsuario);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(usuarioExiste),
    validarCampos,
], eliminarUsuarios);


module.exports = router;