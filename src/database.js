const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/hospitalDB', {  //val-db-app
    //useCreateIndex: true, //Esta opción es obsoleta
    //useNewUrlParser: true, //Esta opción es obsoleta
    //useFindAndModify: false //Esta opción es obsoleta
})
    .then (db => console.log('DB is connected'))
    .catch(err => console.error(err));