const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Bed = require('../models/Bed');
const { isAuthenticated } = require('../helpers/auth');

const passport = require('passport');

router.get('/beds-available', async (req, res) => {
    try {
        let beds;
        beds = await Bed.find({ estado: 'Disponible' }).populate('servicio').lean();

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

        res.render('beds/beds-available', { beds: beds, dateCurrent, timeCurrent });
    } catch (error) {
        console.error('Error al obtener los usuarios REGISTRADOS:', error);
        res.status(500).send('Error interno del servidor');
    } 

});

module.exports = router;