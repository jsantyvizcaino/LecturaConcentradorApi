const { Schema, model } = require('mongoose');


const CiudadSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la ciudad es obligatorio']
    },
    parroquia: {
        type: Schema.Types.ObjectId,
        ref: 'Parroquia',
        required: [true, 'El barrio debe pertenecer a una parroquia']
    },
    canton: {
        type: Schema.Types.ObjectId,
        ref: 'Canton',
        required: [true, 'El barrio debe pertenecer a un canton']
    },
    provincia: {
        type: Schema.Types.ObjectId,
        ref: 'Provincia',
        required: [true, 'La ciudad debe pertenecer a una provincia']
    },

});

CiudadSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Ciudad', CiudadSchema);