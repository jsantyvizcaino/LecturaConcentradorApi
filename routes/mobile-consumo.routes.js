const { Router } = require('express');
const { check } = require('express-validator');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');
const { validarMes, serialMedidorExiste } = require('../utils/validadores');
const { obtenerDatosConsumo } = require('../controllers');


const router = Router();

router.post('/consumo-mensual', [
    check('serial', 'El serial a buscar es obligatorio').not().isEmpty(),
    check('serial').custom(serialMedidorExiste),
    validarCampos
], obtenerDatosConsumo);


module.exports = router;