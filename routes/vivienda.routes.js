const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerViviendas, obtenerVivienda, actualizarVivienda, crearVivienda, eliminarVivienda } = require('../controllers/');
const { viviendaExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');



const router = Router();

router.get('/', obtenerViviendas);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(viviendaExiste),
    validarCampos
], obtenerVivienda);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(viviendaExiste),
    validarCampos
], actualizarVivienda);


router.post('/', [
    check('tipoHogar', 'El tipo de hogar es obligatorio').not().isEmpty(),
    check('metros', 'Los metros cuadrados son obligatorio').not().isEmpty(),
    check('personas', 'El numero de personas es obligatorio').not().isEmpty(),
    check('serial', 'El serial del medidor es obligatorio').not().isEmpty(),
    validarCampos
], crearVivienda);

router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(viviendaExiste),
    validarCampos,
], eliminarVivienda);

module.exports = router;