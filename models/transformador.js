const { Schema, model } = require('mongoose');


const TransformadorSchema = Schema({
    serial: {
        type: String,
        required: [true, 'El número de serie es obligatorio']
    },
    empresa: {
        type: Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'Los transformadores tienen que estar atados a una empresa']
    },
    estado: {
        type: Boolean,
        default: true
    },
})


TransformadorSchema.methods.toJSON = function() {
    const { __v, password, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Transformador', TransformadorSchema)