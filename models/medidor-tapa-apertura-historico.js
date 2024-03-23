const { Schema, model } = require('mongoose');

const MedidorTapaAperturaHistoricoSchema = Schema({
    serial: {
        type: String,
        required: [true, 'El número de serie es obligatorio']
    },
    fechaApertura: {
        type: Date,
        required: [true, 'la fecha en que se abrió el medidor']
    },
    fechaCierrre: {
        type: Date,
        required: [true, 'la fecha en que se cerró el medidor']
    },
    notificado: {
        type: Boolean,
        default: false
    },

})


MedidorTapaAperturaHistoricoSchema.methods.toJSON = function() {
    const { __v, password, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('MedidorTapaAperturaHistorico', MedidorTapaAperturaHistoricoSchema)