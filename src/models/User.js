const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    nombreUsuario: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    rolUsuario: { type: String, required: true, enum: ['Administrador', 'Cargador'] },
    fechaYHoraCreacion: { type: Date, default: Date.now },
    profesional: {
        nombre: { type: String, required: true },
        apellido: { type: String, required: true },
        dni: { type: Number, required: true },
        fechaNacimiento: { type: Date, required: true, set: (v) => { v = new Date(v); v.setHours(0,0,0,0); return v;} },
        sexo: { type: String, required: true },
        domicilio: { type: String, required: true },
        numeroTelefonoFijo: { type: Number, required: false },
        numeroCelular: { type: Number, required: true },
        profesion: { type: String, required: true },
        matriculaProfesional: { type: String, required: true },
        //estado: { type: String, required: true, enum: ['Activo', 'Inactivo'], default: 'Activo' }
        // otros campos...
    }
});

//Método para cifrar contraseñas
UserSchema.methods.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); //Genera un hash y lo aplica 10 veces
    const hash = bcrypt.hash(password, salt); //Cifra la contraseña con el hash generado
    return hash; //Retorna la contraseña cifrada
}

//Método para comparar contraseñas
UserSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password); //Compara el password ingresado con el password de la base de datos y retorna si son iguales o no
}

module.exports = mongoose.model('User', UserSchema);