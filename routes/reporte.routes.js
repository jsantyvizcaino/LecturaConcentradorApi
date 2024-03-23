const { Router } = require('express');
const { generarPDF } = require('../controllers');

const router = Router();


/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: CRUD Medidor
 * /api/reportes:
 *   post:
 *     summary: Obtener el reporte de tipo Medidores_RF_Conexión_simétrica.
 *     tags: [Reportes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedidorApi'
 *     responses:
 *       200:
 *         description: datos traidos correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedidorApi'
 *       500:
 *         description: Some server error
 */

router.post('/', generarPDF);

module.exports = router;