const mongoose = require('mongoose'),
    _ = require('lodash'),
    ObjectId = mongoose.Types.ObjectId,
    Promise = require('bluebird'),
    reportErrors = require('../utilities/http_utilities').reportErrors;

module.exports = function(models) {

    var Course = models.Course,
        User = models.User,
        Quiz = models.Questionairre;

    function render(req, res, viewName, params){
        params = params || {};
        params.coursePath = true;
        params.username = req.session.username;
        res.render(viewName, params);
    }



    // var allocate = function(req, res, next) {
    //     var course_id = req.params.course_id;
    //     User.findOne({
    //             githubUsername: 'avermeulen'
    //         })
    //         .then((user) => {
    //
    //         });
    // };

    var allCourses = function(req, res) {
        Course
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

        var course = Course({
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
        Course.findById(ObjectId(req.params.course_id))
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

        Course
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

        Course
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

        Course.findById(ObjectId(course_id))
            .then((course) => {
                console.log(course_id);
                course.questions.id(ObjectId(question_id)).remove();
                return course;
            })
            .then((course) => {
                return course.save();
            })
            .then(() => {
                res.redirect(`/course/${course_id}`);
            }).catch( (err) => next(err) );

    };

    var addQuestionOption = function(req, res, next) {
        var question_id = req.params.question_id,
            course_id = req.params.course_id;

        Course
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
        //allocate : allocate,
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
