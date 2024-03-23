const { request, response } = require('express');


const mailConfig = require("../services/email");

const mail = new mailConfig();


const envioCorreo = async(req = request, res = response) => {
    const { email, subject, html } = req.body;
    const sendMail = await mail.sendMail(email, subject, html);
    if (!sendMail) {
        return res.status(500).json({
            ok: false,
            message: "Un error ocurrió al enviar el correo",
        });
    }

    return res.json({
        ok: true,
        message: "El correo se envio correctamente...",

    });

}



const envioCorreoService = async(email, subject, html) => {

    const sendMail = await mail.sendMail(email, subject, html);
    if (!sendMail) {
        return res.status(500).json({
            ok: false,
            message: "Un error ocurrió al enviar el correo",
        });
    }

    return res.json({
        ok: true,
        message: "El correo se envio correctamente...",

    });

}

module.exports = {
    envioCorreo,
    envioCorreoService
}