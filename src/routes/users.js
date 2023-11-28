const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../models/User');

const Valoration = require('../models/Valoration');
const Service = require('../models/Service');
const Bed = require('../models/Bed');
const { isAuthenticated } = require('../helpers/auth');

const passport = require('passport');

//Para loguin de usuario
router.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/valorations',
    failureRedirect: '/users/signin',
    failureFlash: true
}), (req, res) => {
    //console.log('Authentication successful:', req.user);
    return;
});

//Para registrar nuevo usuario 
router.get('/users/signup', (req, res) => {
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) => {
    const { nombreUsuario, email, password, confirmacionPassword, rolUsuario, nombre, apellido, dni, fechaNacimiento, sexo, domicilio, numeroTelefonoFijo, numeroCelular, profesion, matriculaProfesional } = req.body;
    const errors = [];
    if (!nombreUsuario) {
        errors.push({ text: 'Por favor inserte un Nombre de Usuario' });
    }
    if (!email) {
        errors.push({ text: 'Por favor inserte un Email' });
    }
    if (!password) {
        errors.push({ text: 'Por favor inserte un Password de al menos 6 caracteres' });
    }
    if (password.length < 6) {
        errors.push({ text: 'El Password debe tener al menos 6 caracteres' });
    }
    if (password != confirmacionPassword) {
        errors.push({ text: 'Los Password insertados no coinciden' });
    }
    if (!rolUsuario) {
        errors.push({ text: 'Por favor inserte un Rol de Usuario' });
    }
    if (!nombre) {
        errors.push({ text: 'Por favor inserte un Nombre' });
    }
    if (!apellido) {
        errors.push({ text: 'Por favor inserte un Apellido' });
    }
    if (!dni) {
        errors.push({ text: 'Por favor inserte un DNI' });
    }
    if (!fechaNacimiento) {
        errors.push({ text: 'Por favor inserte una Fecha de Nacimiento' });
    }
    if (!sexo) {
        errors.push({ text: 'Por favor seleccione un Sexo' });
    }
    if (!domicilio) {
        errors.push({ text: 'Por favor inserte un Domicilio' });
    }
    if (!numeroCelular) {
        errors.push({ text: 'Por favor inserte un Número de Celular' });
    }
    if (!profesion) {
        errors.push({ text: 'Por favor inserte una Profesion' });
    }
    if (!matriculaProfesional) {
        errors.push({ text: 'Por favor inserte una Matricula Profesional' });
    }
    if (errors.length > 0) {
        res.render('users/signup', { errors, nombreUsuario, email, password, confirmacionPassword, rolUsuario, nombre, apellido, dni, fechaNacimiento, sexo, domicilio, numeroTelefonoFijo, numeroCelular, profesion, matriculaProfesional });
    } else {
        const emailUser = await User.findOne({ email: email });
        if (emailUser) {
            req.flash('error_msg', 'El email ya está en uso, por favor ingrese otro Email para registrarse');
            return res.redirect('/users/signup');
        }

        /*Primero ajusto la fecha de nacimiento para que se guarde bien*/
        let { fechaNacimiento } = req.body;
        fechaNacimiento = new Date(fechaNacimiento);
        fechaNacimiento.setDate(fechaNacimiento.getDate() + 1); // Suma un día para guardar en la base de datos porque cuando guarda en la BD se resta 1 día
        
        const newUser = new User({
            nombreUsuario,
            email,
            password,
            rolUsuario,
            profesional: {
                nombre,
                apellido,
                dni,
                fechaNacimiento,
                sexo,
                domicilio,
                numeroTelefonoFijo,
                numeroCelular,
                profesion,
                matriculaProfesional
            }
        });
        newUser.password = await newUser.encryptPassword(password); //Cifra la constraseña del objeto newUser
        await newUser.save();
        req.flash('success_msg', 'Usuario Creado Correctamente');
        res.redirect('/users');
    }
});

//Para cerrar sesión
router.get('/users/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        req.session.destroy(); // Destruir la sesión
        res.redirect('/users/signin');
    });
});

router.get('/users', isAuthenticated, async (req, res) => {
    try {

        let users;

        // Verifica si se proporciona un término de búsqueda
        const search = req.query.search || ''; // Obtiene el valor de search o establece una cadena vacía si es nulo

        // Verifica si se proporciona un término de búsqueda
        if (search) {

            // Realiza la búsqueda por nombre o apellido o nombre de usuario
            users = await User.find({
                $and: [
                    {
                        $or: [
                            { 'profesional.apellido': { $regex: new RegExp(req.query.search, 'i') } },
                            { 'profesional.nombre': { $regex: new RegExp(req.query.search, 'i') } },
                            { 'nombreUsuario': { $regex: new RegExp(req.query.search, 'i') } },
                        ]
                    }
                ]
            }).populate().lean().sort({ fechaYHoraCreacion: 'desc' });
        } else {
            
            users = await User.find().populate().lean().sort({ fechaYHoraCreacion: 'desc' });
        }

        // Verifica si hay coincidencias
        const noResults = search && users.length === 0;

        // Procesa cada usuario
       users = users.map(user => {
            // Crea un nuevo objeto Date con la fecha y hora de la valoración
            let fechaHora = new Date(user.fechaYHoraCreacion);

            // Obtiene la fecha en formato dd/mm/yyyy
            let fecha = ('0' + fechaHora.getDate()).slice(-2) + '/' + ('0' + (fechaHora.getMonth() + 1)).slice(-2) + '/' + fechaHora.getFullYear();

            // Obtiene la hora en formato hh:mm
            let hora = ('0' + fechaHora.getHours()).slice(-2) + ':' + ('0' + fechaHora.getMinutes()).slice(-2);

            // Reemplaza la fecha y hora de la valoración con la fecha y hora procesadas
            user.date = fecha;
            user.time = hora;
            //console.log(user);
            return user;
        });

        res.render('users/all-users', { users: users, search: search, noResults: noResults });
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/users/show/:id', isAuthenticated, async (req, res) => {
    try {
        // Obtiene la valoración de tu base de datos
        let user = await User.findById(req.params.id).lean();
        
        // Crea un nuevo objeto Date con la fecha y hora de la valoración
        let fechaHora = new Date(user.fechaYHoraCreacion);

        // Obtiene la fecha de valoración en formato dd/mm/yyyy
        let fecha = ('0' + fechaHora.getDate()).slice(-2) + '/' + ('0' + (fechaHora.getMonth() + 1)).slice(-2) + '/' + fechaHora.getFullYear();

        // Obtiene la hora de valoración en formato hh:mm
        let hora = ('0' + fechaHora.getHours()).slice(-2) + ':' + ('0' + fechaHora.getMinutes()).slice(-2);

        // Reemplaza la fecha y hora de la valoración con la fecha y hora procesadas
        user.date = fecha;
        user.time = hora;

        
        if (user.profesional.fechaNacimiento !== null) {

            // Crea un nuevo objeto Date con la fecha de nacimiento
            let fechaNacimiento = new Date(user.profesional.fechaNacimiento);

            // Calcula la edad
            let edad = new Date().getFullYear() - fechaNacimiento.getFullYear();
            let m = new Date().getMonth() - fechaNacimiento.getMonth();
            if (m < 0 || (m === 0 && new Date().getDate() < fechaNacimiento.getDate())) {
                edad--;
            }

            // Obtiene la fecha de nacimiento en formato dd/mm/yyyy
            let fechaNac = ('0' + fechaNacimiento.getDate()).slice(-2) + '/' + ('0' + (fechaNacimiento.getMonth() + 1)).slice(-2) + '/' + fechaNacimiento.getFullYear();

            // Reemplaza la fecha de nacimiento con la fecha procesada
            user.profesional.fechaNacimiento = fechaNac;
        }

        res.render('users/show-user', { user, date: user.date, time: user.time });
    } catch (error) {
        console.error('Error al obtener la valoración:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.delete('/users/delete/:id', isAuthenticated, async (req, res) => {
    const userIDToDelete = req.params.id;
    const currentUserID = req.user._id;

    // Verifica si el usuario que intenta eliminar es el mismo que el usuario autenticado
    if (currentUserID.equals(userIDToDelete)) {
        req.flash('error_msg', 'No puedes eliminar tu propia sesión.');
        return res.redirect('/users');
    }

    // Continúa con la lógica de eliminación si no está intentando eliminarse a sí mismo
    try {
        await User.findByIdAndDelete(userIDToDelete).lean();
        req.flash('success_msg', 'Usuario Eliminado Exitosamente');
        res.redirect('/users');
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/registered-users', async (req, res) => {
    try {
        let users;
        users = await User.find().lean();

        // Crea un nuevo objeto Date
        const date = new Date();

        // Formatea la fecha en formato DD-MM-YYYY
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript van de 0 a 11
        const year = date.getFullYear();
        const dateCurrent = `${day}-${month}-${year}`;

        // Formatea la hora en formato HH-MM
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const timeCurrent = `${hours}:${minutes}`; 

        res.render('users/registered-users', { users: users, dateCurrent, timeCurrent });
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).send('Error interno del servidor');
    }        
});

module.exports = router;