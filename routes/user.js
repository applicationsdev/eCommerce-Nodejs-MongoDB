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
                    req.flash('dashboardMessageContent', 'Your new account has been made successfully');
                    res.redirect('/dashboard');
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
    successRedirect: '/dashboard',
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
            res.render('user/dashboard', {
                user: user,
                dashboardMessage: req.flash('dashboardMessageContent'),
                dashboardEditMessage: req.flash('dashboardEditMessageContent')
            });
        });
    }
});

/* Dashboard Edit route */
router.get('/dashboard-edit', function(req, res, next) {
    // Non authenticated user
    if (!req.user) {
        req.logout();
        res.redirect('/login');
    }
    // Authenticated user
    else {
        User.findOne({ _id: req.user._id }, function(err, user) {
            if (err) return next(err);
            res.render('user/dashboard-edit', { user: user, dashboardEditMessage: req.flash('dashboardEditMessageContent') });
        });
    }
});

router.post('/dashboard-edit', function(req, res, next) {
    User.findOne({ _id: req.user._id }, function(err, user) {
        
        if (err) return next(err);
        
        // Edit user login credentials
        if (req.body.email) user.email = req.body.email;
        
        if (req.body.password_1) {
            if (!req.body.password_2) {
                req.flash('dashboardEditMessageContent', 'Password confirmation field was submited empty');
                return res.redirect('/dashboard-edit');
            } else {
                
                if ( req.body.password_1 !== req.body.password_2 ) {
                    req.flash('dashboardEditMessageContent', 'Password confirmation is not matching');
                    return res.redirect('/dashboard-edit');
                } else {
                    user.password = req.body.password_1;
                }
            }
        }
        
        // Edit user account information
        if (req.body.generate_new_photo) user.photo = user.generatePhoto();
        if (req.body.name) user.name = req.body.name;
        if (req.body.address_line_1) user.address_line1 = req.body.address_line_1;
        if (req.body.address_line_2) user.address_line2 = req.body.address_line_2;
        if (req.body.country_code) user.country_code = req.body.country_code;
        if (req.body.postal_code) user.postal_code = req.body.postal_code;
        if (req.body.tel) user.tel = req.body.tel;
        
        user.save(function(err) {
            if (err) return next(err);
            
            req.flash('dashboardEditMessageContent', 'Your changes have been saved successfully');
            return res.redirect('/dashboard');
        });
    });
});

/* Logout route */
router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/login');
});

/* User routes export */
module.exports = router;
