const { Router } = require('express');
const { check } = require('express-validator');
const { login, loginCliente } = require('../controllers');
const { validarCampos } = require('../middlewares/validar_campos');

const router = Router();

router.post('/login', [
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'Contrasena es obligatorio').not().isEmpty(),
    validarCampos
], login);

router.post('/login-cliente', [
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'Contrasena es obligatorio').not().isEmpty(),
    validarCampos
], loginCliente);

module.exports = router;