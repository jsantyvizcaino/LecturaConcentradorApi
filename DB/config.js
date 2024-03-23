const mongoose = require('mongoose');

const dbConnection = async() => {
    try {

        await mongoose.connect(process.env.MONGODB_CNN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Base de datos en linea...");

    } catch (error) {
        console.log(error.message)
        throw new Error('Error con la conexión a la base de datos')
    }
};



module.exports = {
    dbConnection
}