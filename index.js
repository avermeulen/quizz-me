var express = require('express'),
    exphbs  = require('express-handlebars'),
	bodyParser =  require('body-parser'),
    mongoose = require('mongoose'),
    models = require('./models'),
    routes = require('./routes'),
    session = require('express-session'),
    flash = require('express-flash'),
    compression = require('compression');
    expressValidator = require('express-validator');

mongoose.Promise = Promise;

var app = express();

app.use(compression());
app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(session({
  secret: 'blue bottle brig@d3',
  resave: false,
  saveUninitialized: true
}))

app.use(flash());
app.use(expressValidator([]));

//setup template handlebars as the template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var unAuthenticatedPaths = {
    '/login' : true,
    '/callback' : true,
    '/user/unknown' : true
};

app.use(function(req, res, next){
    if (req.session.user || unAuthenticatedPaths[req.path] ){
        return next();
    }
    res.redirect('/login');
});


function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect('mongodb://localhost/quizz_me', options).connection;
};

function listen(){
    routes(app, models);
    var port = process.env.portNumber || 3000;
    app.listen(port, function () {
        console.log('quizz-me at :', port);
    });
};

connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);
