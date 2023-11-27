const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/hospitalDB', {

})
    .then (db => console.log('DB is connected'))
    .catch(err => console.error(err));