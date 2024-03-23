const { Schema, model } = require('mongoose');

const TipoPagoSchema = Schema({
    pago: {
        type: String,
        required: [true, 'El nombre del tipo de pago es obligatorio']
    }

});

TipoPagoSchema.methods.toJSON = function() {
    const { __v, _id, ...tipoPagoDto } = this.toObject();
    tipoPagoDto.uid = _id;

    return tipoPagoDto

}

module.exports = model('TipoPago', TipoPagoSchema);