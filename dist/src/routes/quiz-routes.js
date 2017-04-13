var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const mongoose = require('mongoose'), _ = require('lodash'), marked = require('marked'), co = require('co'), moment = require('moment'), ObjectId = mongoose.Types.ObjectId, render = require('../utilities/render'), AllocateQuiz = require('../utilities/allocate-quiz'), quizResultsBuilder = require('../utilities/quiz-results-builder'), reportErrors = require('../utilities/http_utilities').reportErrors, Services = require('./services');
module.exports = function (models) {
    const services = new Services(models);
    const Course = models.Course, Quiz = models.Questionairre, User = models.User, allocateQuiz = AllocateQuiz(models);
    function findQuizById(quiz_id) {
        return models.Questionairre
            .findOne({
            _id: ObjectId(quiz_id)
        });
    }
    ;
    var resetQuizConfirm = function (req, res, next) {
        var quiz_id = req.params.quiz_id;
        var group_id = req.params.group_id;
        render(req, res, 'quiz_confirm_reset', {
            quiz_id,
            group_id
        });
    };
    var resetQuiz = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz_id = req.params.quiz_id;
                const group_id = req.params.group_id;
                var quiz = yield findQuizById(quiz_id);
                quiz.answers = [];
                quiz.status = 'active';
                quiz.score = 0;
                quiz.nextQuestionNumber = 0;
                yield quiz.save();
                res.redirect(`/groups/edit/${group_id}`);
            }
            catch (err) {
                next(err);
            }
        });
    };
    var showQuizQuestion = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var quiz_id = req.params.quiz_id, question_nr = Number(req.params.question_nr);
                let quiz = yield findQuizById(quiz_id);
                if (question_nr >= quiz.details.questions.length) {
                    return res.render('error', { error: 'Invalid question index.' });
                }
                const question = quiz.details.questions[question_nr], name = quiz.details.name, options = question.options, templateName = question.mcq ? 'quiz' : 'quiz_freetext';
                var questions = [];
                if (quiz.details && quiz.details.questions) {
                    questions = quiz.details.questions;
                }
                const progress_message = 'Question ' +
                    (question_nr + 1) + ' of ' +
                    questions.length;
                render(req, res, templateName, {
                    name: name,
                    quiz_id: quiz_id,
                    progress_message,
                    questionType: question.questionType,
                    question: marked(question.question),
                    options: options.map((option) => {
                        option.answerOption = marked(option.answerOption);
                        return option;
                    }),
                    question_nr: question_nr
                });
            }
            catch (err) {
                next(err);
            }
        });
    };
    var answerQuiz = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz_id = req.params.quiz_id;
                const quiz = yield findQuizById(quiz_id);
                const question_nr = quiz.nextQuestionNumber ? quiz.nextQuestionNumber : 0;
                return res.redirect(`/quiz/${quiz_id}/answer/${question_nr}`);
            }
            catch (err) {
                next(err);
            }
        });
    };
    var answerQuizQuestion = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quiz_id = req.params.quiz_id, question_nr = req.params.question_nr, questionType = req.body.questionType, answer_id = req.body.answer_id, answerText = req.body.answerText;
                req.checkBody('answerText', 'Please answer the question.')
                    .notEmpty();
                if (questionType === "freetext") {
                    var errors = req.validationErrors();
                    if (errors) {
                        reportErrors(req, errors);
                        return res.redirect(`/quiz/${quiz_id}/answer/${question_nr}`);
                    }
                }
                var quiz = yield findQuizById(quiz_id);
                const quizDetails = quiz.details, quizQuestions = quizDetails.questions, question = quizQuestions[question_nr], options = question.options;
                var answersForCurrentQuestion = quiz.answers.filter((answer) => {
                    return answer._question.equals(question._id);
                });
                if (answersForCurrentQuestion.length === 0) {
                    quiz.answers.push({
                        _question: question._id,
                        _answer: answer_id,
                        questionType,
                        answeredAt: new Date(),
                        answerText
                    });
                }
                quiz.nextQuestionNumber = question_nr + 1;
                var lastQuestion = quizQuestions.length === quiz.nextQuestionNumber;
                if (lastQuestion) {
                    quiz.status = "completed";
                    quiz.completedAt = new Date();
                }
                yield quiz.save();
                if (lastQuestion) {
                    yield processQuizAnswers(quiz_id);
                    return res.redirect(`/quiz/${quiz_id}/completed`);
                }
                return res.redirect(`/quiz/${quiz_id}/answer/${quiz.nextQuestionNumber}`);
            }
            catch (err) {
                next(err);
            }
        });
    };
    var completed = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var quiz_id = req.params.quiz_id;
                var quiz = yield findQuizById(quiz_id);
                render(req, res, 'quiz_completed', { score: quiz.score });
            }
            catch (err) {
                next(err);
            }
        });
    };
    var processQuizAnswers = function (quiz_id) {
        return __awaiter(this, void 0, void 0, function* () {
            var quiz = yield findQuizById(quiz_id);
            const answers = quiz.answers;
            const quizQuestions = quiz.details.questions;
            const isMcq = (entry) => entry.questionType === 'mcq';
            const numberOfMcqs = _.filter(quizQuestions, isMcq).length;
            if (numberOfMcqs === 0) {
                return {};
            }
            answers.forEach((answer, index) => {
                var question = quizQuestions[index];
                if (question.mcq) {
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
            var score = Math.ceil((totalCorrect / numberOfMcqs) * 100);
            quiz.score = score.toPrecision(2);
            return quiz.save();
        });
    };
    var profile = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userQuizData = yield services
                    .findUserQuizzes(req.session.username);
                render(req, res, 'profile', userQuizData);
            }
            catch (err) {
                next(err);
            }
        });
    };
    var showQuizzAllocationScreen = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var course_id = req.params.course_id;
                var results = yield Promise.all([Course.findById(ObjectId(course_id)),
                    User.find({})]);
                render(req, res, 'course_allocate', { course: results[0],
                    candidates: results[1] });
            }
            catch (err) {
                ;
                next(err);
            }
        });
    };
    var allocateQuizToUsers = function (req, res, next) {
        req.checkBody('candidateId', 'You must select some candidates to add to the quiz.').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            reportErrors(req, errors);
            return res.redirect(`/course/allocate/${course_id}`);
        }
        var course_id = req.params.course_id, candidateIds = req.body.candidateId;
        candidateIds = Array.isArray(candidateIds) ? candidateIds : [candidateIds];
        var allocations = candidateIds.map((candidate_id) => {
            return allocateQuiz(course_id, candidate_id, 3);
        });
        Promise
            .all(allocations)
            .then((all) => {
            render(req, res, 'quiz_allocated');
        })
            .catch((err) => {
            next(err);
        });
    };
    var quizResults = function (req, res, next) {
        try {
            var quiz_id = req.params.quiz_id;
            let quiz = findQuizById(quiz_id)
                .populate('_user')
                .populate('_course');
            const quizResults = quizResultsBuilder(quiz);
            quizResults.forEach((result) => {
                result.question = marked(result.question);
                if (result.correctAnswer) {
                    result.correctAnswer = marked(result.correctAnswer);
                }
                if (result.incorrect) {
                    result.wrongAnswer = marked(result.wrongAnswer);
                }
            });
            var date = moment(quiz.completedAt).format('DD-MM-YYYY hh:mm:ss');
            render(req, res, 'quiz_results', {
                course: quiz._course,
                user: quiz._user,
                completedAt: date,
                quizResults: quizResults
            });
        }
        catch (err) {
            next(err);
        }
    };
    var cancel = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var quiz_id = req.params.quiz_id;
                const quiz = yield findQuizById(quiz_id);
                quiz.status = 'cancelled';
                yield quiz.save();
                const user = yield User.findById(ObjectId(quiz._user));
                const username = user.githubUsername;
                res.redirect(`/user/${username}`);
            }
            catch (err) {
                next(err);
            }
        });
    };
    return {
        allocateQuizToUsers,
        answerQuiz,
        answerQuizQuestion,
        cancel,
        completed,
        showQuizQuestion,
        profile,
        quizResults,
        resetQuiz,
        resetQuizConfirm,
        showQuizzAllocationScreen,
    };
};
