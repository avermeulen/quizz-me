const mongoose = require('mongoose'),
    _ = require('lodash'),
    ObjectId = mongoose.Types.ObjectId,
    reportErrors = require('../utilities/http_utilities').reportErrors;

module.exports = function(models) {

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
                        console.log(questionairres);
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

                                    models.Questionairre({
                                            _user: user._id,
                                            _course : course_id,
                                            details: course
                                        })
                                        .save()
                                        .then(function(q) {
                                            res.redirect('/courses');
                                        })
                                        .catch(err => next(err));
                                })
                                .catch((err) => next(err));
                        } else {
                            res.redirect('/courses');
                        }
                    });
            });
    };

    return {
        allocate : allocate
    };

};
