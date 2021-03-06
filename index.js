'use strict';

const express = require('express'),
    exphbs = require('express-handlebars'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    models = require('./models'),
    api = require('./api'),
    apiV2 = require('./api-v2'),
    routes = require('./routes'),
    session = require('express-session'),
    flash = require('express-flash'),
    compression = require('compression'),
    expressValidator = require('express-validator'),
    cron = require('cron'),
    winston = require('winston');

mongoose.Promise = Promise;

var app = express();

// catch the location of unhandled exceptions
process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.stack);
});


winston.add(winston.transports.File, { filename: 'quizz-me.log' });

app.use(compression());
app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());

app.use(session({
    secret: 'blue bottle brig@d3',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());
app.use(expressValidator([]));

//setup template handlebars as the template engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

var unAuthenticatedPaths = {
    '/login': true,
    '/callback': true,
    '/user/unknown': true,
    '/user/inactive': true,
    '/user/new/register': true,
    '/user/register': true
};

app.use(function(req, res, next) {
    if (req.session.username
            || unAuthenticatedPaths[req.path]
            || req.path.startsWith('/api')) {

        try{
          return next();
        }
        catch(err){
            console.log(err.stack);
        }
    }
    res.redirect('/login');
});

var adminPaths = {
    '/courses': true,
    '/course/add': true,
    '/user': true, //
    '/users': true,
    '/groups': true,
    '/user/add': true,
    '/user/edit': true,
};

function isAdminPath(path) {
    var adminPathKeys = Object.keys(adminPaths);
    var pathMatches = adminPathKeys.filter((key) => path.startsWith(key));
    return pathMatches.length > 0;
}

function authenticateUser(req, res, next) {

    if (unAuthenticatedPaths[req.path]) {
        return next();
    }

    if (isAdminPath(req.path)) {
        if (!req.session.isAdmin) {
            return res.render('access_denied');
        }
    }
    return next();
}

app.use(authenticateUser);

function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
}

function connect() {
    var options = {
        server: {
            socketOptions: {
                keepAlive: 1
            }
        }
    };
    var mongoDatabaseUrl = process.env.MONGODB_URL || 'mongodb://localhost/quizz_me';
    mongoose.connect(mongoDatabaseUrl, options).connection;
    return mongoose.connection;
};

function listen() {
    api(app, models);
    apiV2(app, models);
    routes(app, models);

    var CronJob = cron.CronJob;

    const EmailSender = require('./utilities/email-sender');
    const DequeueEmail = require('./utilities/email-dequeue');
    const co = require('co');

    if (process.env.EMAIL && process.env.EMAIL_CREDENTIALS) {

        const emailSender = EmailSender(process.env.EMAIL,
            process.env.EMAIL_CREDENTIALS);
        const dequeueEmail = DequeueEmail(models, emailSender);

        new CronJob('00 * * * * *', function() {
            co(function*() {
                try {
                    yield dequeueEmail();
                } catch (e) {
                    console.log(e.stack);
                }
            });
        }, null, true);

    }
    else{
        console.log('EMAIL JOB NOT STARTED - email details not provided!');
    }

    app.use(errorHandler);

    var port = process.env.PORT || 3007;
    app.listen(port, function() {
        console.log('quizz-me at :', port);
    });
};

connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);

winston.level = "debug";
