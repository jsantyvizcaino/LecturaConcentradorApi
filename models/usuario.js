const { Schema, model } = require('mongoose');


const UsuarioSchema = Schema({
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
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, 'El rol es obligatorio'],
    },
    estado: {
        type: Boolean,
        default: true,
    },
    empresa: {
        type: Schema.Types.ObjectId,
        ref: 'Empresa',
    },
})


UsuarioSchema.methods.toJSON = function() {
    const { __v, password, _id, ...usuarioDTO } = this.toObject();
    usuarioDTO.uid = _id;

    return usuarioDTO

}

module.exports = model('Usuario', UsuarioSchema)