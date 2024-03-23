const { Schema, model } = require('mongoose');

const MedidorSchema = Schema({
    serial: {
        type: String,
        required: [true, 'El número de serie es obligatorio']
    },

    concentrador: {
        type: Schema.Types.ObjectId,
        ref: 'Concentrador',
        required: [true, 'Los medidores tienen que estar atados a un concentrador']
    },
    modelo: {
        type: Schema.Types.ObjectId,
        ref: 'ModeloMedidores',
        required: [true, 'El modelo es obligatoria']
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio']
    },
    tipoPago: {
        type: Schema.Types.ObjectId,
        ref: 'TipoPago',
        required: [true, 'tipo de pago es obligatoria']
    },
    codigoPostal: {
        type: String,
        required: [true, 'El codigo postal es obligatoria']
    },
    fechaCreacion: {
        type: Date,
        default: new Date()
    },
    estado: {
        type: Boolean,
        default: true
    },
    latitud: {
        type: Number,
        required: [true, 'La latitud es obligatoria']
    },
    longitud: {
        type: Number,
        required: [true, 'La longitud es obligatoria']
    },
    apellidos: {
        type: String,
        required: [true, 'apellidos es obligatorio']
    },
    nombres: {
        type: String,
        required: [true, 'nombres es obligatorio']
    },
    direccion: {
        type: String,
        required: [true, 'direccion es obligatorio']
    },
    cuentaContrato: {
        type: String,
        required: [true, 'cuenta Contrato  es obligatorio']
    },
    cuenta: {
        type: String,
        required: [true, 'cuenta Contrato  es obligatorio']
    },
    online: {
        type: Boolean,
        default: true
    },
    cedula: {
        type: String
    },
    grupoConsumo: {
        type: Schema.Types.ObjectId,
        ref: 'GrupoConsumo',
        required: [true, 'Los medidores tienen que estar atados a un grupo de consumo']
    },
    vivienda: {
        type: Schema.Types.ObjectId,
        ref: 'Vivienda',
    },
    fechaActualizacionNumerador: {
        type: Date,
    },
    numero001: {
        type: Number,
    },
    numero002: {
        type: Number,
    },
    numero003: {
        type: Number,
    },
})


MedidorSchema.methods.toJSON = function() {
    const { __v, password, _id, ...medidorDTO } = this.toObject();
    medidorDTO.uid = _id;

    return medidorDTO

}

module.exports = model('Medidor', MedidorSchema)