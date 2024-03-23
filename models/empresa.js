const { Schema, model } = require('mongoose');

const EmpresaSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la region es obligatorio']
    },
    region: {
        type: Schema.Types.ObjectId,
        ref: 'Region',
        required: [true, 'Las empresas tienen que estar atados a una region']
    },
    porcentaje: {
        type: Number,
        required: [true, 'El porcentaje de aplicación de la empresa es obligatorio']
    },
    estado: {
        type: Boolean,
        default: true
    },


});

EmpresaSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Empresa', EmpresaSchema);