/* Requires */
var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportAuth = require('../config/auth');

/* Signup route */
router.get('/signup', function(req, res, next) {
    res.render('user/signup', { signupMessage: req.flash('signupMessageContent') });
});

router.post('/signup', function(req, res, next) {
    var user = new User();
    
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    user.photo = user.generatePhoto();
    
    User.findOne({ email: req.body.email }, function(err, existingUser) {
        if (err) return next(err);
        
        if (existingUser) {
            req.flash('signupMessageContent', 'Account with that email already exists.');
            return res.redirect('/signup');
        } else {
            user.save(function(err, user) {
                if (err) return next(err);
                
                req.logIn(user, function(err) {
                    if (err) return next(err);
                    res.redirect('/profile');
                });
            });
        }
    });
});

/* Login route */
router.get('/login', function(req, res) {
    res.render('user/login', { loginMessage: req.flash('loginMessageContent') });
});

router.post('/login', passport.authenticate('login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
}));

/* Dashboard route */
router.get('/dashboard', function(req, res, next) {
    // Non authenticated user
    if (!req.user) {
        req.logout();
        res.redirect('/login');
    }
    // Authenticated user
    else {
        User.findOne({ _id: req.user._id }, function(err, user) {
            if (err) return next(err);
            res.render('user/dashboard', { user: user });
        });
    }
});

/* Logout route */
router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/login');
});

/* User routes export */
module.exports = router;
