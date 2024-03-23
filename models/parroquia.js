const { Schema, model } = require('mongoose');


const ParroquiaSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la parroquia es obligatorio']
    },
    canton: {
        type: Schema.Types.ObjectId,
        ref: 'Canton',
        required: [true, 'La parroquia debe pertenecer a un canton']
    },
    provincia: {
        type: Schema.Types.ObjectId,
        ref: 'Provincia',
        required: [true, 'La parroquia debe pertenecer a una provincia']
    },

});

ParroquiaSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Parroquia', ParroquiaSchema);