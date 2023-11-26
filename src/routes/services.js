const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Service = require('../models/Service');

router.get('/getServicios', async (req, res) => {
    const servicios = await Service.find({});
    res.json(servicios);
});

module.exports = router;