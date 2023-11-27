const mongoose = require('mongoose');
const { Schema } = mongoose;

const BedSchema = new Schema({
    numeroCama: { type: Number, required: true },
    estado: { type: String, required: true, enum: ['Disponible', 'No disponible'] },
    servicio: { type: Schema.Types.ObjectId, ref: 'Service' } // Referencia al modelo Service
});

BedSchema.methods.cambiarEstado = async function(nuevoEstado) {
    // Asegura de que el nuevo estado es uno de los valores permitidos
    if (['Disponible', 'No disponible'].includes(nuevoEstado)) {
        this.estado = nuevoEstado;
        await this.save();
    } else {
        throw new Error('Estado no válido');
    }
};

module.exports = mongoose.model('Bed', BedSchema);