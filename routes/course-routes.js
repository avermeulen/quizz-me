const mongoose = require('mongoose'),
    _ = require('lodash'),
    co = require('co'),
    Promise = require('bluebird'),
    marked = require('marked'),
    render = require('../utilities/render'),
    ObjectId = mongoose.Types.ObjectId,
    reportErrors = require('../utilities/http_utilities').reportErrors;

module.exports = function(models) {

    const Course = models.Course,
        User = models.User,
        Quiz = models.Questionairre;

    var allCourses = function(req, res) {
        const gen = function*() {
            const courses = yield Course.find({});
            render(req, res, 'courses', {
                courses
            });
        }
        co(gen);
    };

    var addCourse = function(req, res) {

        req.checkBody('name', 'Name is required').notEmpty();
        req.checkBody('description', 'Description is required').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            reportErrors(req, errors);
            return res.redirect('/course/add');
        }

        const gen = function*() {
            var course = new Course({
                name: req.body.name,
                description: req.body.description
            });
            yield course.save();
            res.redirect('/courses');
        }

        co(gen);
    };

    const edit = function(req, res, next) {
        var gen = function*() {

            try {
                const course = yield Course.findById(ObjectId(req.params.course_id));
                render(req, res, 'course_edit', course);
            } catch (err) {
                next(err);
            }

        };
        co(gen);
    };

    const update = function(req, res, next) {
        var gen = function*() {

            try {
                const course = {
                    _id: req.params.course_id,
                    name: req.body.name,
                    description: req.body.description
                };

                yield Course.update(course);
                req.flash('success_message', 'Course updated');

                res.redirect(`/course/${course._id}`);
            } catch (err) {
                next(err);
            }

        };
        co(gen);
    };

    var showCourse = function(req, res) {

        const gen = function*() {
            const course = yield Course.findById(ObjectId(req.params.course_id));
            course.description = marked(course.description);
            course.questions.forEach((q) => {
                q.question = marked(q.question);
            });

            render(req, res,
                'course', {
                    course
                });
        };

        co(gen);
    };

    var showAddQuestion = function(req, res) {
        render(req, res, 'question_add', {
            id: req.params.course_id,
            options: [{
                counter: 0
            }, {
                counter: 1
            }, {
                counter: 2
            }, {
                counter: 3
            }]
        });
    };

    var addQuestion = function(req, res, next) {
        var course_id = req.params.course_id;
        req.checkBody('question', 'Question is required').notEmpty();
        req.checkBody('questionType', 'Question type is required').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            reportErrors(req, errors);
            return res.redirect(`/course/${course_id}/question/add`);
        }

        const options = req.body.options;
        const mcq = req.body.questionType === 'mcq';

        const setupQuestionOptions = (options, mcq) => {
            if (options.length > 0 && mcq) {
                return options.map((option, index) => {
                    return {
                        answerOption: option,
                        isAnswer: Number(req.body.answer) === index
                    };
                });

            }
            return [];
        }

        const gen = function*() {

            try {
                const course = yield Course.findById(ObjectId(course_id));
                course
                    .questions
                    .push({
                        question: req.body.question,
                        questionType: req.body.questionType,
                        options: setupQuestionOptions(options, mcq)
                    });

                yield course.save();
                req.flash('success_message', 'Question added');
                res.redirect(`/course/${course_id}`);
            } catch (err) {
                next(err);
            }
        };

        co(gen);

    };

    var showAddCourse = function(req, res) {
        render(req, res, 'course_add');
    };

    var showQuestion = function(req, res, next) {
        const question_id = req.params.question_id;
        const course_id = req.params.course_id;

        const gen = function*() {

            const course = yield Course.findById(ObjectId(course_id));

            var question = course.questions.id(ObjectId(question_id));
            question.question = marked(question.question);
            question.options.forEach((option) => {
                option.answerOption = marked(option.answerOption);
            });

            render(req, res, 'question', {
                course_id: course_id,
                question: question,
                canAddOption: question.options.length < 4,
                mcq: question.mcq
            });
        };

        co(gen);
    };

    var deleteQuestion = function(req, res, next) {
        var question_id = req.params.question_id,
            course_id = req.params.course_id;

        const gen = function*(){
            try{
                const course = yield Course.findById(ObjectId(course_id));
                course.questions
                    .id(ObjectId(question_id)).remove();
                yield course.save();
                res.redirect(`/course/${course_id}`);
            }
            catch(err){
                next(err);
            }
        };
        co(gen);
    };

    var addQuestionOption = function(req, res, next) {
        var gen = function*(){
            try{
                const question_id = req.params.question_id;
                const course_id = req.params.course_id;

                const course = yield Course.findById(ObjectId(course_id));
                const question = course.questions.id(ObjectId(question_id));

                question.options.push({
                    answerOption: req.body.option,
                    isAnswer: req.body.isAnswer === 'true' ? true : false
                });
                yield course.save();
                res.redirect(`/course/${course_id}/question/${question_id}`);
            }
            catch(err){
                next(err);
            }
        };

        co(gen);

    };

    var deleteCourseQuestionOption = function(req, res, next) {
        const course_id = req.params.course_id,
            question_id = req.params.question_id,
            option_id = req.params.option_id;

        const gen = function*(){

            try{
                const course = yield Course.findById(ObjectId(course_id));
                const question = course.questions.id(ObjectId(question_id));
                const option = question.options.id(ObjectId(option_id));
                option.remove();
                yield course.save();
                res.redirect(`/course/${course_id}/question/${question_id}`);
            }
            catch(err){
                next(err);
            }
        };
        
        co(gen);
    };

    return {
        //allocate : allocate,
        allCourses: allCourses,
        addCourse: addCourse,
        edit,
        update,
        showCourse: showCourse,
        showAddCourse: showAddCourse,
        showAddQuestion: showAddQuestion,
        addQuestion: addQuestion,
        showQuestion: showQuestion,
        deleteQuestion: deleteQuestion,
        addQuestionOption: addQuestionOption,
        deleteCourseQuestionOption: deleteCourseQuestionOption
    };

};
