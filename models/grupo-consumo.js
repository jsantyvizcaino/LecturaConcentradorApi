const { Schema, model } = require('mongoose');


const GrupoConsumoSchema = Schema({
    grupo: {
        type: String,
        required: [true, 'El nombre del grupo es obligatorio']
    }

});

GrupoConsumoSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}


module.exports = model('GrupoConsumo', GrupoConsumoSchema);