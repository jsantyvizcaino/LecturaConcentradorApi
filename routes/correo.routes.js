const { Router } = require('express');
const { check } = require('express-validator');
const { envioCorreo } = require('../controllers');
const { validarCampos } = require('../middlewares');


/**
 * @swagger
 * components:
 *   schemas:
 *     Email:
 *       type: object
 *       required:
 *         - email
 *         - subject
 *         - html
 *       properties:
 *         email:
 *           type: string
 *           description: Correo electronico remitente
 *         subject:
 *           type: string
 *           description: asunto del correo
 *         html:
 *           type: string
 *           description: body del correo
 */
/**
 * @swagger
 * tags:
 *   name: Email
 *   description: envio de correo electronico
 * /api/email:
 *   post:
 *     summary: Crear email
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Email'
 *     responses:
 *       200:
 *         description: Email envoado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Email'
 *       500:
 *         description: Some server error
 */
const router = Router();


router.post('/', [
    check('email', 'El correo debe tener un formato valido').isEmail(),
    check('subject', 'El asunto del correo es obligatorio').not().isEmpty(),
    check('html', 'El asunto del correo es obligatorio').not().isEmpty(),
    validarCampos
], envioCorreo);

module.exports = router;