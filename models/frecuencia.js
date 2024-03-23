const { Schema, model } = require('mongoose');


const FrecuenciaSchema = Schema({
    horas: {
        type: Number,
        required: [true, 'El tiempo con el que se disparara la acción']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre ascociado al tiempo']
    },

});

FrecuenciaSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Frecuencia', FrecuenciaSchema);