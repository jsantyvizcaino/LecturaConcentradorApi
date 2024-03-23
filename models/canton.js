const { Schema, model } = require('mongoose');


const CantonSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del canton es obligatorio']
    },
    provincia: {
        type: Schema.Types.ObjectId,
        ref: 'Provincia',
        required: [true, 'La ciudad debe pertenecer a una provincia']
    },

});

CantonSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Canton', CantonSchema);