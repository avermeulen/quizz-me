var mongoose = require('mongoose'),
    UserRoutes = require('./routes/user-routes'),
    ObjectId = mongoose.Types.ObjectId;

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

        var course = models.Course({
            name: req.body.name,
            description: req.body.description
        });

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
            id: req.params.course_id
        });
    });

    app.post('/course/:course_id/question/add', function(req, res, next) {
        var course_id = req.params.course_id;
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
                    answerOption: req.body.option,
                    isAnswer: req.body.isAnswer === 'true' ? true : false
                });

                course
                    .save()
                    .then(() =>
                        res.redirect(`/course/${course_id}/question/${question_id}`));

            });
    });

    app.get('/course/:course_id/select/:select_count', function(req, res, next) {
        var course_id = req.params.course_id;
        models.User
            .findOne({
                githubUsername: 'avermeulen'
            })
            .then(user => {
                models.Course
                    .findById(ObjectId(course_id),
                        '-_id -questions._id -questions.options._id -__v')
                    .then((course) => {
                        var questions = _.sampleSize(course.questions, Number(req.params.select_count || 3));
                        questions.forEach((question) => question.options = _.shuffle(question.options));

                        delete course.questions;
                        course.questions = questions;

                        models.Questionairre({
                                _user: user._id,
                                details: course
                            })
                            .save()
                            .then(function(q) {
                                res.send(q);
                            })
                            .catch(err => next(err));
                    })
                    .catch((err) => next(err));
            });
    });

    var userRoutes = UserRoutes(models);
    console.log(userRoutes.listUsers);

    app.get('/users', userRoutes.listUsers);
    app.get('/user/:user_name', userRoutes.overview)
    app.get('/user/add', userRoutes.addScreen);
    app.post('/user/add', userRoutes.add);

};
