const { Schema, model } = require('mongoose');

const LecturasMedidoresHistoricosSchema = Schema({
    fecha: {
        type: Date,
        required: [true, 'la fecha es obligatorio']
    },
    serial: {
        type: String,
        required: [true, 'El serial del medidor es obligatorio']
    },
    consumo: {
        type: Number,
        required: [true, 'El serial del medidor es obligatorio']
    }

})


LecturasMedidoresHistoricosSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('LecturasMedidoresHistoricos', LecturasMedidoresHistoricosSchema);