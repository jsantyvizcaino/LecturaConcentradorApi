const swaggerJsdoc = require("swagger-jsdoc");


const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "Lectura Medidores",
            version: "0.1.0",
            description: "Documentacion de la API para el proyecto de lectura de medidores",
        },
    },
    apis: ["./routes/*.js"],
};


const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec