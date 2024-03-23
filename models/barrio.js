const { Schema, model } = require('mongoose');


const BarrioSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del barrio es obligatorio']
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
    ciudad: {
        type: Schema.Types.ObjectId,
        ref: 'Ciudad',
        required: [true, 'El barrio debe pertenecer a una ciudad']
    },
    provincia: {
        type: Schema.Types.ObjectId,
        ref: 'Provincia',
        required: [true, 'El barrio debe pertenecer a una provincia']
    },


});

BarrioSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Barrio', BarrioSchema);