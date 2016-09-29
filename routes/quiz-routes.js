const mongoose = require('mongoose'),
    _ = require('lodash'),
    marked = require('marked'),
    co = require('co'),
    ObjectId = mongoose.Types.ObjectId,
    render = require('../utilities/render'),
    AllocateQuiz = require('../utilities/allocate-quiz'),
    quizResultsBuilder = require('../utilities/quiz-results-builder'),
    reportErrors = require('../utilities/http_utilities').reportErrors,
    Services = require('./services');

module.exports = function(models) {
    const services = new Services(models)

    const Course = models.Course,
        Quiz = models.Questionairre,
        User = models.User,
        allocateQuiz = AllocateQuiz(models);

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

                const question = quiz.details.questions[0],
                    options = question.options,
                    templateName = question.mcq ? 'quiz' : 'quiz_freetext';

                render(req, res, templateName, {
                    question: question,
                    options: options.map((option) => {
                        option.answerOption = marked(option.answerOption);
                        return option;
                    })
                });

            }).catch((err) => next(err));
    };

    var showQuizQuestion = function(req, res, next) {
        var quiz_id = req.params.quiz_id,
            question_nr = req.params.question_nr;

        findQuizById(quiz_id)
            .then((quiz) => {
                const question = quiz.details.questions[question_nr],
                    options = question.options,
                    templateName = question.mcq ? 'quiz' : 'quiz_freetext';

                render(req, res, templateName, {
                    quiz_id: quiz_id,
                    question: marked(question.question),
                    options: options.map((option) => {
                        option.answerOption = marked(option.answerOption);
                        return option;
                    }),
                    question_nr: question_nr
                });
            }).catch((err) => next(err));
    };

    var answerQuizQuestion = function(req, res, next) {

        const quiz_id = req.params.quiz_id,
            question_nr = req.params.question_nr,
            questionType = req.body.questionType,
            answer_id = req.body.answer_id,
            answerText = req.body.answerText;

        req.checkBody('answerText', 'Please answer the question.').notEmpty();

        if (questionType === "freetext"){
            var errors = req.validationErrors();
            if (errors){
                reportErrors(req, errors);
                return res.redirect(`/quiz/${quiz_id}/answer/${question_nr}`);
            }
        }

        findQuizById(quiz_id)
            .then((quiz) => {

                const quizDetails = quiz.details,
                    quizQuestions = quizDetails.questions,
                    question = quizQuestions[question_nr],
                    options = question.options;

                quiz.answers.push({
                    _question : question._id,
                    _answer: answer_id,
                    questionType,
                    answerText
                });

                var next_question_nr = ++question_nr;
                var lastQuestion = quizQuestions.length === next_question_nr;
                if (lastQuestion) {
                    quiz.status = "completed";
                }

                quiz.save()
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

                const isMcq = (entry) => entry.questionType === 'mcq';
                const answers = quiz.answers;
                const quizQuestions = quiz.details.questions;
                const numberOfMcqs =  _.filter(quizQuestions, isMcq).length;

                if (numberOfMcqs === 0){
                    return {};
                }

                answers.forEach((answer, index) => {
                    var question = quizQuestions[index];
                    if (question.mcq){
                        var correct = question.options.id(answer._answer).isAnswer;
                        answer.correct = correct;
                    }
                });

                const totalCorrect = answers.reduce((correctCount, answer) => {
                    if (answer.correct) {
                        correctCount++;
                    }
                    return correctCount;
                }, 0);

                const score = (totalCorrect / numberOfMcqs).toPrecision(2);
                quiz.score = score * 100;

                return quiz.save();
            });
    };

    var profile = (req, res, next) => {
        co(function*(){
            try{
                const userQuizData = yield services
                    .findUserQuizzes(req.session.username);

                render(req, res, 'profile', userQuizData);
            }
            catch(err){
                next(err);
            }
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
                const quizResults = quizResultsBuilder(quiz);
                quizResults.forEach((result) => {
                    result.question = marked(result.question);

                    if (result.correctAnswer){
                        result.correctAnswer = marked(result.correctAnswer);
                    }

                    if (result.incorrect){
                        result.wrongAnswer = marked(result.wrongAnswer);
                    }
                });

                render(req, res, 'quiz_results', { quizResults : quizResults});
            })
            .catch((err) => next(err));
    };

    var cancel = function(req, res, next){
        co(function*(){
            try{
                var quiz_id = req.params.quiz_id;
                const quiz = yield findQuizById(quiz_id);
                quiz.status = 'cancelled';
                yield quiz.save();
                res.redirect(`/user/{quiz._user}`);
            }
            catch(err){
                next(err);
            }
        });
    };


    return {
        showQuiz,
        showQuizQuestion,
        quizResults,
        answerQuizQuestion,
        completed,
        profile,
        cancel,
        showQuizzAllocationScreen,
        allocateQuizToUsers
    };
};
