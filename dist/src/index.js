"use strict";
const cron = require("cron");
const mongoose = require("mongoose");
const api = require("./api");
const routes = require("./routes");
const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const models = require("./models");
const process = require("process");
const session = require("express-session");
const flash = require("express-flash");
const compression = require("compression");
const expressValidator = require("express-validator");
const winston = require("winston");
const EmailSender = require("./utilities/email-sender");
const DequeueEmail = require("./utilities/email-dequeue");
const co = require("co");
var app = express();
winston.add(winston.transports.File, { filename: 'quizz-me.log' });
var c = compression();
app.use(c);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(session({
    secret: 'blue bottle brig@d3',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());
app.use(expressValidator([]));
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
var unAuthenticatedPaths = {
    '/login': true,
    '/callback': true,
    '/user/unknown': true,
    '/user/inactive': true,
    '/user/register': true
};
app.use(function (req, res, next) {
    var pathString = req.path;
    if (req.session['username']
        || unAuthenticatedPaths[req.path]
        || pathString.startsWith('/api')) {
        return next();
    }
    res.redirect('/login');
});
var adminPaths = {
    '/courses': true,
    '/course/add': true,
    '/user': true,
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
    return mongoose.connect(mongoDatabaseUrl, options).connection;
}
;
function listen() {
    api(app, models);
    routes(app, models);
    var CronJob = cron.CronJob;
    if (process.env.EMAIL && process.env.EMAIL_CREDENTIALS) {
        const emailSender = EmailSender(process.env.EMAIL, process.env.EMAIL_CREDENTIALS);
        const dequeueEmail = DequeueEmail(models, emailSender);
        new CronJob('00 * * * * *', function () {
            co(function* () {
                try {
                    yield dequeueEmail({});
                }
                catch (e) {
                    console.log(e.stack);
                }
            });
        }, null, true);
    }
    else {
        console.log('EMAIL JOB NOT STARTED - email details not provided!');
    }
    app.use(errorHandler);
    var port = process.env.PORT || 3000;
    app.listen(port, function () {
        console.log('quizz-me at :', port);
    });
}
;
connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);
