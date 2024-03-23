const { Schema, model } = require('mongoose');

const AperturaMedidorSchema = Schema({
    serial: {
        type: String,
        required: [true, 'El número de serie del medidor es obligatorio']
    },
    fechaLectura: {
        type: Date,
        default: () => new Date(Date.now() - 5 * 60 * 60 * 1000) // Resta 5 horas a la fecha actual
    },
    eventos: [{
        ElectricMeterID: String,
        DataVal: String,
        ConID: String,
        FrozenDate: String,
        AreaName: String,
        ParamName: String,
        DataFlagStr: String,
        CreationTime: String,
        EsNotificado: {
            type: Boolean,
            default: false
        }
    }]

})


AperturaMedidorSchema.methods.toJSON = function() {
    const { __v, password, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

AperturaMedidorSchema.statics.obtenerEventosNoNotificados = async function(serial) {
    return await this.aggregate([{
            $match: {
                serial: serial,
                "eventos.EsNotificado": false
            }
        },
        {
            $unwind: "$eventos"
        },
        {
            $match: {
                "eventos.EsNotificado": false
            }
        }
    ]);
};
AperturaMedidorSchema.statics.actualizarEventoNotificado = async function(serial, eventoId) {
    try {

        const eventoExistente = await this.findOne({
            serial: serial,
            "eventos._id": eventoId
        });

        if (!eventoExistente) {
            throw new Error(`Evento con ID ${eventoId} no encontrado para el medidor con serial ${serial}`);
        }

        const eventoActualizado = await this.findOneAndUpdate({
            serial: serial,
            "eventos._id": eventoId
        }, { $set: { "eventos.$.EsNotificado": true } }, { new: true });
        return eventoActualizado;
    } catch (error) {
        throw new Error(`Error al actualizar evento notificado: ${error.message}`);
    }
};

module.exports = model('AperturaMedidor', AperturaMedidorSchema)