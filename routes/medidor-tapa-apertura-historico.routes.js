const { Router } = require('express');
const { check } = require('express-validator');
const { obtenerAperturaTapas, obtenerAperturaTapa, actualizarAperturaTapa, crearAperturaTapa, eliminarAperturaTapa, obtenerAperturaTapaBySerial, actualizarEstadoNotificacion, getNewAperturaTapaBySerial, updateEventoAperturaTapaBySerial } = require('../controllers');
const { serialMedidorExiste, aperturaTapasExiste } = require('../utils/validadores');
const { validarCampos, validarJWT, esAdminRole, esRolePermitido } = require('../middlewares');



const router = Router();

router.get('/', obtenerAperturaTapas);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(aperturaTapasExiste),
    validarCampos
], obtenerAperturaTapa);

router.post('/', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    check('serial').custom(serialMedidorExiste),
    check('fechaApertura', 'La fecha de apertura no es valida').not().isDate(),
    check('fechaCierrre', 'La fecha de cierre no es valida').not().isDate(),
    validarCampos,
], crearAperturaTapa);


router.post('/apertura', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    check('serial').custom(serialMedidorExiste),
    validarCampos,
], obtenerAperturaTapaBySerial);


router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(aperturaTapasExiste),
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    check('serial').custom(serialMedidorExiste),
    check('fechaApertura', 'La fecha de apertura no es valida').not().isDate(),
    check('fechaCierrre', 'La fecha de cierre no es valida').not().isDate(),
    validarCampos
], actualizarAperturaTapa);


router.put('/estado/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(aperturaTapasExiste),
    check('notificado', 'formato incorrecto').not().isEmpty(),
    validarCampos
], actualizarEstadoNotificacion);


router.delete('/:id', [
    validarJWT,
    //esAdminRole,
    //esRolePermitido('ADMIN_ROLE','VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(aperturaTapasExiste),
    validarCampos,
], eliminarAperturaTapa);



router.post('/new-aperturas', [
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    check('serial').custom(serialMedidorExiste),
    validarCampos,
], getNewAperturaTapaBySerial);

router.put('/actualizar-aperturas/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('serial', 'El serial es obligatorio').not().isEmpty(),
    check('serial').custom(serialMedidorExiste),
    validarCampos,
], updateEventoAperturaTapaBySerial);

module.exports = router;