const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.use(new LocalStrategy({
    usernameField: "email", passwordField: "password"
}, async (email, password, done) => {
    const user = await User.findOne({ email: email });
    if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
    } else {
        const match = await user.matchPassword(password);
        if (match) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Password incorrecto' });
        }
    }
}));

//Método para serializar el usuario. Cuando el usuario se autentica correctamente, este método se ejecuta y mantiene la sesión activa
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            console.error('Error al deserializar el usuario:', err);
            done(err, null);
        });
});