const { Router } = require('express');
const { check } = require('express-validator');
const { crearPagos, obtenerPagosByPropeties } = require('../controllers/');
const { rolExistente } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');

const router = Router();



router.post('/', [

], crearPagos);

router.get('/', [

], obtenerPagosByPropeties);

module.exports = router;