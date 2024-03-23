const { Medidor } = require("../models");




const obtenerMedidoresNumActualByConcentradorService = async(idConcentrador) => {

    try {
        const mesActual = new Date().getMonth() + 1;
        const medidores = await Medidor.find({
            $and: [{
                    $expr: {
                        $eq: [{ $month: "$fechaActualizacionNumerador" }, mesActual]
                    }
                },
                { concentrador: idConcentrador }
            ]
        });

        return medidores;
    } catch (error) {
        console.error("Error al buscar medidores:", error);
        throw error;
    }
}


module.exports = {
    obtenerMedidoresNumActualByConcentradorService
}