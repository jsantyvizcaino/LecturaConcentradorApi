const jwt = require('jsonwebtoken');

const generarJWT = (uid = '') => {
    return new Promise((resolve, reject) => {
        const payload = { uid };
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '365d',
        }, (err, token) => {
            if (err) {
                console.log(err)
                reject('No se pudo generar el token')
            } else {
                resolve(token)
            }

        });

    })

}

const generarJWTCliente = (data) => {
    return new Promise((resolve, reject) => {
        const payload = {...data };
        jwt.sign(payload, process.env.SECRETORPRIVATEKEY, {
            expiresIn: '365d',
        }, (err, token) => {
            if (err) {
                console.log(err)
                reject('No se pudo generar el token')
            } else {
                resolve(token)
            }

        });

    })

}


module.exports = {
    generarJWT,
    generarJWTCliente
}