const { Schema, model } = require('mongoose');


const ModeloMedidoresSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del barrio es obligatorio']
    },
    material: {
        type: String,
        required: [true, 'El nombre del barrio es obligatorio']
    },
    idApiExterna: {
        type: Number,
        required: [true, 'Se debe colocar el id de la api externa']
    },

});

ModeloMedidoresSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('ModeloMedidores', ModeloMedidoresSchema);