const mongoose = require('mongoose');
const { Schema } = mongoose;

const ServiceSchema = new Schema({
    nombre: { type: String, required: true },
    // otros campos...
});

module.exports = mongoose.model('Service', ServiceSchema);