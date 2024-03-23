const { Schema, model } = require('mongoose');


const ProvinciaSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la provincia es obligatorio']
    }

});

ProvinciaSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Provincia', ProvinciaSchema);