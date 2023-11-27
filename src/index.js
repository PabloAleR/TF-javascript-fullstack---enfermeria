const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');


// Initializations
require('./database');
require('./config/passport');

//Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main.hbs',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

// Define Handlebars helper
const hbs = exphbs.create({
    helpers: {
        ifCond: function (v1, operator, v2, options) {
            switch (operator) {
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        },
        formatDate: function (date) {
            if (!date) {
                return '-';
            }
            const formattedDate = new Date(date).toLocaleDateString();
            return formattedDate;
        },
        formatTime: function (date) {
            if (!date) {
                return '-';
            }
            const formattedTime = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return formattedTime;
        },
    },
    
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
});

hbs.handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

// Registra helper 'json'
Handlebars.registerHelper('json', function (context) {
    return JSON.stringify(context);
});

// Registra la función de ayuda personalizada 'toString'
hbs.handlebars.registerHelper('toString', function(number) {
    return number.toString();
});

// Registra los helpers 'formatDate' y 'formatTime'
hbs.handlebars.registerHelper('formatDate', function (date) {
    if (!date) {
        return '-';
    }
    const formattedDate = new Date(date).toLocaleDateString();
    return formattedDate;
});

hbs.handlebars.registerHelper('formatTime', function (date) {
    if (!date) {
        return '-';
    }
    const formattedTime = new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return formattedTime;
});

// Registra el helper 'eq'
hbs.handlebars.registerHelper('eq', function (a, b, options) {
    return a === b;
});

// Registra el helper 'ifCondStr' que convierte los valores a cadenas antes de compararlos
hbs.handlebars.registerHelper('ifCondStr', function (v1, operator, v2, options) {
    if (v1 === undefined || v2 === undefined) {
        return options.inverse(this);
    }
    switch (operator) {
        case '===':
            return (v1.toString() === v2.toString()) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

//Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'mysecretapp',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.userCurrent = req.isAuthenticated() ? req.user.toObject() : null; // convierte el objeto Mongoose a un objeto plano

    // Agrega la verificación del ID del usuario en la ruta de eliminación
    if (req.method === 'DELETE' && req.url.startsWith('/users/delete/')) {
        const currentUserID = req.user._id;
        const userIDToDelete = req.params.id;

        if (currentUserID.equals(userIDToDelete)) {
            req.flash('error_msg', 'No puedes eliminar tu propia sesión.');
            return res.redirect('/users');
        }
    }
    next();
});

//Routes
app.use(require('./routes/index'));
app.use(require('./routes/users'));
app.use(require('./routes/valorations'));
app.use(require('./routes/services'));
app.use(require('./routes/beds'));


//Static files
app.use(express.static(path.join(__dirname, 'public')));

//Server is listenning
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});