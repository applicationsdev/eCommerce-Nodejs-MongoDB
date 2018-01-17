/* Requires */
var express = require('express');
var morgan = require('morgan');
var configApp = require('./config/app');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var mongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('express-flash');
var ejs = require('ejs');
var ejsMate = require('ejs-mate');
var User = require('./models/user');

/* Express instance */
var app = express();

/* Connect server with database */
mongoose.connect(configApp.db, {
        useMongoClient: true
    },
    function(err) {
        if (err) console.log(err);
        else console.log("Server connected to database");
    }
);

/* Middleware */
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: configApp.sessionHashKey,
    store: new mongoStore({url: configApp.db, autoReconnect: true})
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

app.engine('ejs', ejsMate);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

/* Routes */
var pagesRoutes = require('./routes/pages');
var userRoutes = require('./routes/user');

app.use(pagesRoutes);
app.use(userRoutes);

/* Web server "service start" */
app.listen(configApp.port, configApp.host, function(err) {
    if (err) throw err;
    console.log("Server is running on http://" + configApp.host + ":" + configApp.port);
});
