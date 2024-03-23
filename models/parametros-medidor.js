const { Schema, model } = require('mongoose');

const ParametrosMedidorSchema = Schema({
    fecha: {
        type: Date,
        required: [true, 'la fecha es obligatorio']
    },
    serial: {
        type: String,
        required: [true, 'El serial del medidor es obligatorio']
    },
    PFa: {
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
    PFb: {
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
    PFc: {
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
    PFtotal: {
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
    ActivePa: {
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
    ActivePb: {
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
    ActivePc: {
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
    ActivePtotal: {
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
    ReactivePa: {
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
    ReactivePb: {
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
    ReactivePc: {
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
    ReactivePtotal: {
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
    PhaseAvoltage: {
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
    PhaseBvoltage: {
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
    PhaseCvoltage: {
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
    PhaseAcurrent: {
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
    PhaseBcurrent: {
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
    PhaseCcurrent: {
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

ParametrosMedidorSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('ParametrosMedidor', ParametrosMedidorSchema);