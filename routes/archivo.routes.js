const { Router } = require('express');
const { cargarArchivoExcel, cargarArchivoSAP, cargarLeerArchivoSAP, descargarArchivoFTP, conexionEstablecida, subirArchivoRequestFTP } = require('../controllers');

const router = Router();


router.post('/read', cargarArchivoExcel);
router.post('/download-ftp', descargarArchivoFTP);
router.post('/upload-ftp', subirArchivoRequestFTP);
router.post('/test-ftp', conexionEstablecida);
router.post('/upload-sap', cargarArchivoSAP);
router.post('/up-down-sap', cargarLeerArchivoSAP);

module.exports = router;