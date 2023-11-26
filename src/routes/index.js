const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Valoration = require('../models/Valoration');
const Service = require('../models/Service');
const Bed = require('../models/Bed');
const { isAuthenticated } = require('../helpers/auth');

const passport = require('passport');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/about', (req, res) => {
    res.render('about');
});

module.exports = router;