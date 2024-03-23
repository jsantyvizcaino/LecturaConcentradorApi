const { Schema, model } = require('mongoose');

const HistoricoSchema = Schema({
    electricMeterID: {
        type: Schema.Types.ObjectId,
        ref: 'Medidor',
        required: [true, 'El nombre del tipo de pago es obligatorio']
    },
    dataVal: {
        type: String,
        required: [true, 'El nombre del tipo de pago es obligatorio']
    },
    concentradorID: {
        type: Schema.Types.ObjectId,
        ref: 'Concentrador',
        required: [true, 'Los medidores tienen que estar atados a un concentrador']
    },
    paramName: {
        type: String,
        required: [true, 'El nombre del tipo de pago es obligatorio']
    },
    fechaLectura: {
        type: String,
    },


});

HistoricoSchema.methods.toJSON = function() {
    const { __v, _id, ...historicoDto } = this.toObject();
    historicoDto.uid = _id;

    return historicoDto

}

module.exports = model('Historico', HistoricoSchema);