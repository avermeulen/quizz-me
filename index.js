var express = require('express'),
    exphbs  = require('express-handlebars'),
	bodyParser =  require('body-parser'),
    mongoose = require('mongoose'),
    models = require('./models'),
    _ = require('lodash');

mongoose.Promise = Promise;

var app = express();

app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//setup template handlebars as the template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get("/", (req, res) =>{
    res.redirect("/question/1");
});

app.get('/courses', function(req, res){
    models.Course
        .find({})
        .then(function(courses){
            res.render('courses', {courses : courses});
        });
});

app.get('/course/add', function(req, res){
    res.render('course_add');
})

app.post('/course/add', function(req, res){

    var course = models.Course({
        name : req.body.name,
        description : req.body.description
    });

    course
        .save()
        .then(() => res.redirect('/courses'));
});

var ObjectId = mongoose.Types.ObjectId;

app.get('/course/:course_id', function(req, res) {

    models.Course
        .findById(ObjectId(req.params.course_id))
        .then((course) => res.render('course', {course : course}));

});

app.get('/course/:course_id/question/add', function(req, res) {
    res.render('question_add', {id : req.params.course_id});
});

app.post('/course/:course_id/question/add', function(req, res, next) {
    var course_id = req.params.course_id;
    models.Course
        .findById(ObjectId(course_id))
        .then((course) => {

            course
                .questions
                .push({ question : req.body.question });

            course
                .save()
                .then(() => res.redirect('/course/' + course_id))
                .catch((err) => next(err));
        });
});

app.get('/course/:course_id/question/:question_id', function(req, res, next) {
    var question_id = req.params.question_id,
        course_id = req.params.course_id;

    models.Course
        .findById(ObjectId(course_id))
        .then((course) => {
            console.log(course_id);
            var question = course.questions.id(ObjectId(question_id));
            res.render('question', {
                course_id : course_id,
                question : question
            });
        })
});

app.get('/course/:course_id/question/:question_id/option/add', function(req, res, next) {
    res.render('option', req.params);
});

app.post('/course/:course_id/question/:question_id/option/add', function(req, res, next) {
    var question_id = req.params.question_id,
        course_id = req.params.course_id;

        models.Course
            .findById(ObjectId(course_id))
            .then((course) => {

                var question = course.questions.id(ObjectId(question_id));

                question.options.push({
                    answerOption : req.body.option,
                    isAnswer : req.body.isAnswer === 'true' ? true : false
                });

                course
                    .save()
                    .then(() =>
                        res.redirect(`/course/${course_id}/question/${question_id}`));

            });
});

app.get('/course/:course_id/select/:select_count', function(req, res, next) {
    var course_id = req.params.course_id;

        models.Course
            .findById(ObjectId(course_id))
            .then((course) => {

                var questions = _.sampleSize(course.questions, Number(req.params.select_count || 3));

                delete course.questions;
                course.questions = questions;

                res.send(course);

            });
});

function connect () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect('mongodb://localhost/quizz_me', options).connection;
}

function listen(){
    var port = process.env.portNumber || 3000;
    app.listen(port, function () {
        console.log('quizz-me at :', port);
    });
}

connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);
