const { Schema, model } = require('mongoose');

const EnergiasMedidorSchema = Schema({
    fecha: {
        type: Date,
        required: [true, 'la fecha es obligatorio']
    },
    serial: {
        type: String,
        required: [true, 'El serial del medidor es obligatorio']
    },
    energiaActivaTotal: {
        type: {
            ElectricMeterID: String,
            DataVal: String,
            ConID: String,
            FrozenDate: String,
            AreaName: String,
            ParamName: String,
            DataFlagStr: String,
            CreationTime: Date,
        }
    },
    energiaReactivaTotal: {
        type: {
            ElectricMeterID: String,
            DataVal: String,
            ConID: String,
            FrozenDate: String,
            AreaName: String,
            ParamName: String,
            DataFlagStr: String,
            CreationTime: Date,
        }
    },
    maximaDemanda: {
        type: {
            ElectricMeterID: String,
            DataVal: String,
            ConID: String,
            FrozenDate: String,
            AreaName: String,
            ParamName: String,
            DataFlagStr: String,
            CreationTime: Date,
        }
    }

});

EnergiasMedidorSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('EnergiasMedidor', EnergiasMedidorSchema);