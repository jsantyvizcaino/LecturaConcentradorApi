const { Schema, model } = require('mongoose');

const TablaPagoSchema = Schema({
    region: {
        type: String,
        required: [true, 'la region del tipo de pago es obligatorio']
    },
    grupoConsumo: {
        type: String,
        required: [true, 'El grupo de consumo del tipo de pago es obligatorio']
    },
    periodo: {
        type: Number,
    },
    comercializacion: {
        type: Number,
        required: [true, 'El valor de comercializacion es obligatorio']
    },
    pago: {
        type: [{
            min: Number,
            max: Number,
            costo: Number
        }]
    }

});

TablaPagoSchema.methods.toJSON = function() {
    const { __v, _id, ...pagoDto } = this.toObject();
    pagoDto.uid = _id;

    return pagoDto

}

module.exports = model('TablaPago', TablaPagoSchema);