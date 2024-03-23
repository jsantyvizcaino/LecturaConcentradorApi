const { Schema, model } = require('mongoose');

const ClienteSchema = Schema({
    username: {
        type: String,
        required: [true, 'El username es obligatorio']
    },
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatorio'],
    },
    cedula: {
        type: String,
        required: [true, 'El número de cedula como string es obligatorio'],
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
    },
    estado: {
        type: Boolean,
        default: true,
    },
    // medidor: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Medidor',
    //     required: [true, 'El ID del medidor que corresponde al cliente es obligatorio'],
    // },
})


ClienteSchema.methods.toJSON = function() {
    const { __v, password, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Cliente', ClienteSchema)