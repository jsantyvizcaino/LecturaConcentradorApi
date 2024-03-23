const { Router } = require('express');
const { check } = require('express-validator');
const { buscar, buscarRangoFecha } = require('../controllers');
const { medidorExiste, } = require('../utils/validadores');


const { validarCampos } = require('../middlewares');


const router = Router();


router.get('/:coleccion/:search', buscar)

router.get('/:coleccion/:idMedidor/:inicio/:fin', [
    check('inicio', 'La fecha de inicio no puede ser vacia').not().isEmpty(),
    check('fin', 'La fecha de fin no puede ser vacia').not().isEmpty(),
    check('idMedidor', 'No es un ID de medidor válido').isMongoId(),
    check('idMedidor').custom(medidorExiste),
    validarCampos
], buscarRangoFecha)


module.exports = router;