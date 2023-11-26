const helpers = {};

helpers.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated() && !req.loggingOut){
        return next();
    }
    req.flash('error_msg', 'No estas autorizado');
    res.redirect('/users/signin');
}

module.exports = helpers;