const mongoose = require('mongoose'),
    _ = require('lodash'),
    ObjectId = mongoose.Types.ObjectId,
    reportErrors = require('../utilities/http_utilities').reportErrors;

module.exports = function(models) {

    function render(req, res, viewName, params){
        params = params || {};
        params.coursePath = true;
        params.username = req.session.username;
        res.render(viewName, params);
    }

    var allocate = function(req, res, next) {
        var course_id = req.params.course_id;
        models.User
            .findOne({
                githubUsername: 'avermeulen'
            })
            .then((user) => {
                models.Questionairre
                    .find({
                        _course: ObjectId(course_id),
                        _user: ObjectId(user._id),
                        status : 'active'
                    })
                    .then((questionairres) => {
                        if (questionairres.length === 0) {
                            models.Course
                                .findById(ObjectId(course_id),
                                    '-_id -questions._id -questions.options._id -__v')
                                .then((course) => {

                                    var questions = _.sampleSize(course.questions, Number(req.params.select_count || 3));
                                    var shuffleQuestions = (question) => question.options = _.shuffle(question.options);
                                    questions.forEach(shuffleQuestions);
                                    delete course.questions;
                                    course.questions = questions;

                                    return models.Questionairre({
                                            _user: user._id,
                                            _course : course_id,
                                            details: course
                                        })
                                        .save()
                                        /*
                                        .then(function(q) {

                                        })
                                        .catch(err => next(err));
                                        */
                                })
                                .then(() => {
                                    res.redirect('/courses');
                                })
                                .catch((err) => next(err));
                        } else {
                            res.redirect('/courses');
                        }
                    });
            });
    };

    var allCourses = function(req, res) {
        models.Course
            .find({})
            .then(function(courses) {
                render(req, res, 'courses', {
                    courses: courses
                });
            });
    };

    var addCourse = function(req, res) {

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
    };

    var showCourse = function(req, res) {
        models.Course
            .findById(ObjectId(req.params.course_id))
            .then((course) => render(req, res,
                'course', {
                    course: course
                }));
    };

    var showAddQuestion = function(req, res) {
        render(req, res, 'question_add', {
            id: req.params.course_id
        });
    };

    var addQuestion = function(req, res, next) {
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
    };

    var showAddCourse = function(req, res) {
        render(req, res, 'course_add');
    };

    var showQuestion = function(req, res, next) {
        var question_id = req.params.question_id,
            course_id = req.params.course_id;

        models.Course
            .findById(ObjectId(course_id))
            .then((course) => {
                var question = course.questions.id(ObjectId(question_id));
                render(req, res, 'question', {
                    course_id: course_id,
                    question: question
                });
            });
        };

    var deleteQuestion = function(req, res, next) {
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

    };

    var addQuestionOption = function(req, res, next) {
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
    };

    return {
        allocate : allocate,
        allCourses : allCourses,
        addCourse : addCourse,
        showCourse : showCourse,
        showAddCourse : showAddCourse,
        showAddQuestion : showAddQuestion,
        addQuestion : addQuestion,
        showQuestion : showQuestion,
        deleteQuestion : deleteQuestion,
        addQuestionOption : addQuestionOption
    };

};
