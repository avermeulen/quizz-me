var mongoose = require('mongoose'),
    UserRoutes = require('./routes/user-routes'),
    QuizRoutes = require('./routes/quiz-routes'),
    AuthRoutes = require('./routes/auth-routes'),
    CourseRoutes = require('./routes/course-routes'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    reportErrors = require('./utilities/http_utilities').reportErrors;

module.exports = function(app, models) {

    app.get('/courses', function(req, res) {
        models.Course
            .find({})
            .then(function(courses) {
                res.render('courses', {
                    courses: courses
                });
            });
    });

    app.get('/course/add', function(req, res) {
        res.render('course_add');
    })

    app.post('/course/add', function(req, res) {

        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('description', 'Description is required').notEmpty();

        var course = models.Course({
            name: req.body.name,
            description: req.body.description
        });

        var errors = req.validationErrors();
        if (errors){
            reportErrors(req, errors);
            return res.redirect('/course/add');
        }


        course
            .save()
            .then(() => res.redirect('/courses'));
    });

    app.get('/course/:course_id', function(req, res) {

        models.Course
            .findById(ObjectId(req.params.course_id))
            .then((course) => res.render('course', {
                course: course
            }));

    });

    app.get('/course/:course_id/question/add', function(req, res) {
        res.render('question_add', {
            id: req.params.course_id,
            errors : {
                'question' : 'Question field required!'
            }
        });
    });

    app.post('/course/:course_id/question/add', function(req, res, next) {
        var course_id = req.params.course_id;
        req.checkBody('question', 'Question is required').notEmpty();

        var errors = req.validationErrors();
        if (errors){
            reportErrors(req, errors);
            return res.redirect(`/course/${course_id}/question/add`);
        }

        models.Course
            .findById(ObjectId(course_id))
            .then((course) => {

                course
                    .questions
                    .push({
                        question: req.body.question
                    });

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
                    course_id: course_id,
                    question: question
                });
            });
        });

    app.get('/course/:course_id/question/:question_id/delete', function(req, res, next) {
        var question_id = req.params.question_id,
            course_id = req.params.course_id;

        models.Course
            .findById(ObjectId(course_id))
            .then((course) => {
                console.log(course_id);
                course.questions.id(ObjectId(question_id)).remove();
                return course;
            })
            .then((course) => {
                course.save();
                return course;
            })
            .then(() => {
                res.redirect(`/course/${course_id}`);
            }).catch( (err) => next(err) );

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
                    answerOption: req.body.option,
                    isAnswer: req.body.isAnswer === 'true' ? true : false
                });

                course
                    .save()
                    .then(() =>
                        res.redirect(`/course/${course_id}/question/${question_id}`));

            });
    });

    var courseRoutes = CourseRoutes(models)

    app.get('/course/:course_id/select/:select_count', courseRoutes.allocate);

    var userRoutes = UserRoutes(models);
    console.log(userRoutes.listUsers);

    app.get('/users', userRoutes.listUsers);
    app.get('/user/profile/:user_name', userRoutes.overview)
    app.get('/user/add', userRoutes.addScreen);
    app.post('/user/add', userRoutes.add);

    var quizRoutes = QuizRoutes(models);
    app.get('/quiz/:quiz_id', quizRoutes.showQuiz);
    app.get('/quiz/:quiz_id/answer/:question_nr', quizRoutes.showQuizQuestion);
    app.post('/quiz/:quiz_id/answer/:question_nr', quizRoutes.answerQuizQuestion);
    app.get('/quiz/:quiz_id/completed', quizRoutes.completed);
    app.get('/quiz/:quiz_id/results', quizRoutes.showQuizResults);

    var authRoutes = AuthRoutes();

    app.get('/login', authRoutes.redirectToGithub)
    app.get('/callback', authRoutes.callback)


    app.get('/', function(req, res) {
        res.render('index');
    });

};
