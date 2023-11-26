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
        res.render('beds/beds-available', { beds: beds });
    } catch (error) {
        console.error('Error al obtener los usuarios REGISTRADOS:', error);
        res.status(500).send('Error interno del servidor');
    } 

});

module.exports = router;