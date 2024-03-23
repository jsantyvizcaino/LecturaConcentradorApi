const { Schema, model } = require('mongoose');

const energiHistoricoMensualSchema = Schema({
    electricMeterID: {
        type: Schema.Types.ObjectId,
        ref: 'Medidor',
        required: [true, 'El id del medidor es obligatorio']
    },
    maximaDemanda: {
        type: String,
        required: [true, 'la maxima es obligatorio']
    },
    fecha: {
        type: Date,
        required: [true, 'la fecha es obligatorio']
    },
    serial: {
        type: String,
        required: [true, 'El serial es obligatorio']
    },



});

energiHistoricoMensualSchema.methods.toJSON = function() {
    const { __v, _id, ...historicoDto } = this.toObject();
    historicoDto.uid = _id;

    return historicoDto

}

module.exports = model('energiaHistorico', energiHistoricoMensualSchema);