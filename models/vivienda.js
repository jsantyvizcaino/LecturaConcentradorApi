const { Schema, model } = require('mongoose');


const ViviendaSchema = Schema({
    tipoHogar: {
        type: String,
        required: [true, 'El nombre de la provincia es obligatorio']
    },
    metros: {
        type: Number,
        required: [true, 'Los metros cuadrados es obligatorio']
    },
    personas: {
        type: Number,
        required: [true, 'El numero de personas es obligatorio']
    },
    serial: {
        type: String,
        required: [true, 'El serial del medidor es obligatorio']
    },

});

ViviendaSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Vivienda', ViviendaSchema);