const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const uniqueValidator = require('mongoose-unique-validator');
const Schema =  mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripción es necesaria']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'

    }
})

categoriaSchema.plugin( uniqueValidator , {
    message: '{PATH} debe ser unico'
});

categoriaSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Categoria', categoriaSchema);