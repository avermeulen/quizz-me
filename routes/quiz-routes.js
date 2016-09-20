const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    render = require('../utilities/render'),
    _ = require('lodash'),
    quizResultsBuilder = require('../utilities/quiz-results-builder');

module.exports = function(models) {

    var Course = models.Course,
        Quiz = models.Questionairre,
        User = models.User;

    function findQuizById(quiz_id) {
        return models.Questionairre
            .findOne({
                _id: ObjectId(quiz_id)
            });
    };

    var showQuiz = function(req, res, next) {
        var quiz_id = req.params.quiz_id;
        models.Questionairre
            .findOne({
                _id: ObjectId(quiz_id)
            })
            .then((quiz) => {
                var question = quiz.details.questions[0],
                    options = question.options;
                render(req, res, 'quiz', {
                    question: question,
                    options: options
                });
            }).catch((err) => next(err));
    };

    var quizQuestion = function(quiz_id, question_nr) {

    };

    var showQuizQuestion = function(req, res, next) {
        var quiz_id = req.params.quiz_id,
            question_nr = req.params.question_nr;

        findQuizById(quiz_id)
            .then((quiz) => {
                var question = quiz.details.questions[question_nr],
                    options = question.options;

                render(req, res, 'quiz', {
                    quiz_id: quiz_id,
                    question: question,
                    options: options,
                    question_nr: question_nr
                });
            }).catch((err) => next(err));
    };

    var deleteQuizQuestionOption = function(req, res, next) {
        const quiz_id = req.params.quiz_id,
            question_id = req.params.question_id,
            option_id = req.params.option_id;

        findQuizById(quiz_id)
            .then((quiz) => {
                console.log(quiz);
                var question = quiz.questions.id(ObjectId(question_id));
                var option = question.options.id(ObjectId(option_id));
                option
                    .remove()
                    .then(() => {
                        res.redirect(`/course/${quiz_id}/question/${question_id}`);
                    });
            }).catch((err) => next(err));
    };

    var answerQuizQuestion = function(req, res, next) {

        var quiz_id = req.params.quiz_id,
            question_nr = req.params.question_nr;

        findQuizById(quiz_id)
            .then((quiz) => {

                var question = quiz.details.questions[question_nr],
                    options = question.options,
                    answer_id = req.body.answer_id;

                quiz.answers.push({
                    _question : question._id,
                    _answer: answer_id
                });

                var next_question_nr = ++question_nr;
                var lastQuestion = quiz.details.questions.length === next_question_nr;
                if (lastQuestion) {
                    quiz.status = "completed";
                }

                quiz
                    .save()
                    .then(() => {
                        if (lastQuestion) {
                            processQuizAnswers(quiz_id)
                                .then(() => {
                                    return res.redirect(`/quiz/${quiz_id}/completed`);
                                }).catch((err) => next(err));
                        }
                        else{
                            return res.redirect(`/quiz/${quiz_id}/answer/${next_question_nr}`)
                        }
                    }).catch((err) => next(err));
            }).catch((err) => next(err));
    };

    var completed = function(req, res, next) {
        var quiz_id = req.params.quiz_id;
        findQuizById(quiz_id).then((quiz) => {
                render(req, res, 'quiz_completed', {score : quiz.score} );
        }).catch((err) => next(err));

    };

    var processQuizAnswers = function(quiz_id) {
        return findQuizById(quiz_id)
            .then((quiz) => {

                var answers = quiz.answers;

                answers.forEach((answer, index) => {

                    var question = quiz.details.questions[index];
                    var correct = question.options.id(answer._answer).isAnswer;
                    answer.correct = correct;
                });

                var totalCorrect = answers.reduce((correctCount, answer) => {
                    if (answer.correct) {
                        correctCount++;
                    }
                    return correctCount;
                }, 0);
                var numberOfQuestions = quiz.details.questions.length;

                var score = (totalCorrect / numberOfQuestions).toPrecision(2);

                quiz.score = score * 100;
                return quiz.save();
            });
    };

    var overview = (req, res, next) => {
        models.User
            .findOne({githubUsername : req.params.user_name})
            .then((user) => {
                models
                    .Questionairre
                    .find({_user : ObjectId(user._id)})
                    .sort({createdAt : -1})
                    .then((questionairres) => {
                        render(req, res, 'user', {
                            user : user,
                            questionairres : questionairres.map((quiz) => {
                                quiz.active = quiz.status != "completed";
                                return quiz;
                            })
                        });
                    })
                    .catch((err) => next(err));
            });
    };

    var showQuizzAllocationScreen = function(req, res, next) {

        var course_id = req.params.course_id;
        Promise.all(
            [ Course.findById(ObjectId(course_id)),
            User.find({})]
        )
        .then((results) => {
                render(req, res, 'course_allocate',
                    { course : results[0],
                      candidates : results[1] });
        })
        .catch((err) => next(err));
    };

    function allocateQuiz(course_id, user_id, question_count){

        var course_id = course_id instanceof ObjectId ? course_id :  ObjectId(course_id),
            user_id = user_id instanceof ObjectId ? user_id : ObjectId(user_id),
            question_count = question_count || 3;

        return Quiz.find({
                _course: course_id,
                _user: user_id,
                status : 'active'
            })
            .then((quizzes) => {
                if (quizzes.length === 0) {

                    return Course.findById(course_id,
                            '-_id -questions._id -questions.options._id -__v')
                        .then((course) => {

                            var questions = _.sampleSize(course.questions, question_count);
                            var shuffleOptions = (question) => question.options = _.shuffle(question.options);
                            questions.forEach(shuffleOptions);
                            delete course.questions;
                            course.questions = questions;

                            var quiz = Quiz({
                                _user: user_id,
                                _course : course_id,
                                details: course
                            });
                            return quiz.save();
                        });
                } else {
                    return {user_id : user_id, status : 'already allocated'};
                }
            });
    };

    var allocateQuizToUsers = function(req, res){

        req.checkBody('candidateId', 'You must select some candidates to add to the quiz.').notEmpty();

        var errors = req.validationErrors();
        if (errors){
            reportErrors(req, errors);
            return res.redirect(`/course/allocate/${course_id}`);
        }

        var course_id = req.params.course_id,
            candidateIds = req.body.candidateId;

        candidateIds = Array.isArray(candidateIds) ? candidateIds : [candidateIds];
        var allocations = candidateIds.map((candidate_id) => {
            return allocateQuiz(course_id, candidate_id, 3);
        });

        Promise
            .all(allocations)
            .then((all) => {
                render(req, res, 'quiz_allocated');
            })
            .catch((err) => next(err));
    };

    var quizResults = function(req, res, next){
        var quiz_id = req.params.quiz_id;
        findQuizById(quiz_id)
            .then((quiz) => {
                //render(req, res, 'quiz_completed', {score : quiz.score} );
                render(req, res, 'quiz_results', { quizResults : quizResultsBuilder(quiz)});
            })
            .catch((err) => next(err));
    };

    var answerQuizQuestionOptionDelete = function(req, res){

    };

    return {
        showQuiz: showQuiz,
        showQuizQuestion: showQuizQuestion,
        deleteQuizQuestionOption : deleteQuizQuestionOption,
        quizResults : quizResults,
        answerQuizQuestion: answerQuizQuestion,
        completed: completed,
        overview,
        showQuizzAllocationScreen : showQuizzAllocationScreen,
        allocateQuizToUsers : allocateQuizToUsers,
    }
};
