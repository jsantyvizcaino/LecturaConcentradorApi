const { Schema, model } = require('mongoose');


const ConcentradorSchema = Schema({
    serial: {
        type: String,
        required: [true, 'El número de serie es obligatorio']
    },
    codigoPostal: {
        type: String,
        required: [true, 'La codigo postal es obligatoria']
    },
    password: {
        type: String,
        required: [true, 'El password es obligatorio']
    },
    frecuencia: {
        type: Schema.Types.ObjectId,
        ref: 'Frecuencia',
        required: [true, 'La frecuencia es obligatoria']
    },
    latitud: {
        type: Number,
        required: [true, 'La latitud es obligatoria']
    },
    longitud: {
        type: Number,
        required: [true, 'La longitud es obligatoria']
    },
    fechaCreacion: {
        type: Date,
        default: new Date()
    },
    estado: {
        type: Boolean,
        default: true
    },
    online: {
        type: Boolean,
        default: false
    },
    empresa: {
        type: Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'Los concentrador tienen que estar atados a una empresa']
    },
    provincia: {
        type: Schema.Types.ObjectId,
        ref: 'Provincia',
        required: [true, 'La provincia es obligatoria']
    },
    ciudad: {
        type: Schema.Types.ObjectId,
        ref: 'Ciudad',
        required: [true, 'La ciudad es obligatoria']
    },
    canton: {
        type: Schema.Types.ObjectId,
        ref: 'Canton',
        required: [true, 'El canton es obligatorio']
    },
    parroquia: {
        type: Schema.Types.ObjectId,
        ref: 'Parroquia',
        required: [true, 'La parroquia es obligatoria']
    },
    barrio: {
        type: Schema.Types.ObjectId,
        ref: 'Barrio',
        required: [true, 'El barrio es obligatorio']
    },
    region: {
        type: Schema.Types.ObjectId,
        ref: 'Region',
        required: [true, 'Los concentradores tienen que estar atados a una region']
    },
    transformador: {
        type: Schema.Types.ObjectId,
        ref: 'Transformador',
    },
    fechaLecturaPlanificada: {
        type: Date,
    }
})


ConcentradorSchema.methods.toJSON = function() {
    const { __v, password, _id, ...concentradorDTO } = this.toObject();
    concentradorDTO.uid = _id;

    return concentradorDTO

}


module.exports = model('Concentrador', ConcentradorSchema)