const { Schema, model } = require('mongoose');

const medidorHistoricoMensualSchema = Schema({
    fecha: {
        type: Date,
    },
    electricMeterID: {
        type: Schema.Types.ObjectId,
        ref: 'Medidor',
    },
    serial: {
        type: String,
    },
    maximaDemanda: {
        type: String,
    },
    consumoInicialMes: {
        type: Number,
    }
});

medidorHistoricoMensualSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('MedidorHistoricoMensual', medidorHistoricoMensualSchema);