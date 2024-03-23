const { Schema, model } = require('mongoose');


const RoleSchema = Schema({
    role: {
        type: String,
        required: [true, 'El rol es obligatorio']
    }

});

RoleSchema.methods.toJSON = function() {
    const { __v, _id, ...roleDTO } = this.toObject();
    roleDTO.uid = _id;

    return roleDTO

}

module.exports = model('Role', RoleSchema);