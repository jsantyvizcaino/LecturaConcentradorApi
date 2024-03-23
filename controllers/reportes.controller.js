const { request, response } = require('express');
const pdfService = require('../services/pdf.services');





const generarPDF = async(req = request, res = response) => {
    const { DeviceAddr } = req.body;
    console.log(DeviceAddr)
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment;filename=reporte.pdf',
    })


    pdfService.buildPDF(DeviceAddr,
        (chunk) => stream.write(chunk),
        _ => stream.end()
    )


}



module.exports = {
    generarPDF,
}