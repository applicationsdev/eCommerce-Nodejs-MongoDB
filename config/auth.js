/* Requires */
var passport = require('passport');
var authMethod = require('passport-local').Strategy;
var User = require('../models/user');

/* Serialize & deserialize user object to create, store & retrieve data from sessions */
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

/* Login data validation */
passport.use('login', new authMethod(
    {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, email, password, done) {
        User.findOne({ email: email }, function(err, user) {
            if (err) return done(err);
            
            if (!user || !user.validatePassword(password)) {
                return done(null, false, req.flash('loginMessageContent', 'To access your account you must login using valid username and password. Please try to login again or signup to create new account.'));
            }
            
            return done(null, user);
        });
    }
));

/* User authentication export */
exports.isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    
    res.redirect('/login');
};
