const { Schema, model } = require('mongoose');


const RegionSchema = Schema({
    region: {
        type: String,
        required: [true, 'El nombre de la region es obligatorio']
    }

});

RegionSchema.methods.toJSON = function() {
    const { __v, _id, ...dto } = this.toObject();
    dto.uid = _id;

    return dto

}

module.exports = model('Region', RegionSchema);