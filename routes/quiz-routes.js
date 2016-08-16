const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;

module.exports = function(models) {

    function findQuizById(quiz_id) {
        return models.Questionairre
            .findOne({
                _id: ObjectId(quiz_id)
            });
    }

    function render(res, viewName, params){
        params.quizPath = true;
        res.render(viewName, params);
    }

    var showQuiz = function(req, res, next) {
        var quiz_id = req.params.quiz_id;
        models.Questionairre
            .findOne({
                _id: ObjectId(quiz_id)
            })
            .then((quiz) => {
                var question = quiz.details.questions[0],
                    options = question.options;
                render(res, 'quiz', {
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

                render(res, 'quiz', {
                    quiz_id: quiz_id,
                    question: question,
                    options: options,
                    question_nr: question_nr
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
                    _awnser: answer_id
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
                                });
                        }
                        else{
                            return res.redirect(`/quiz/${quiz_id}/answer/${next_question_nr}`)
                        }
                    });
            }).catch((err) => next(err));
    };

    var completed = function(req, res, next) {
        var quiz_id = req.params.quiz_id;
        findQuizById(quiz_id).then((quiz) => {
                render(res, 'quiz_completed', {score : quiz.score} );
            });

    };

    var processQuizAnswers = function(quiz_id) {
        return findQuizById(quiz_id)
            .then((quiz) => {
                quiz.answers.forEach((answer, index) => {
                    var question = quiz.details.questions[index];
                    var correct = question.options.id(answer._awnser).isAnswer;
                    answer.correct = correct;
                });

                var totalCorrect = quiz.answers.reduce((correctCount, answer) => {
                    if (answer.correct) {
                        correctCount++;
                    }
                    return correctCount;
                }, 0);

                var score = (totalCorrect / quiz.details.questions.length).toPrecision(2);

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
                        render(res, 'user', {
                            user : user,
                            questionairres : questionairres.map((quiz) => {
                                quiz.active = quiz.status != "completed";
                                return quiz;
                            })
                        });
                    }).catch((err) => next(err));
            });
    };

    /*
    var showQuizResults = function(req, res, next) {
        var quiz_id = req.params.quiz_id;

        findQuizById(quiz_id)
            .then((quiz) => {

                quiz.answers.forEach((answer, index) => {
                    var question = quiz.details.questions[index];
                    var correct = question.options.id(answer._awnser).isAnswer;
                    answer.correct = correct;
                });

                var totalCorrect = quiz.answers.reduce((correctCount, answer) => {
                    if (answer.correct) {
                        correctCount++;
                    }
                    return correctCount;
                }, 0);

                var score = (totalCorrect / quiz.details.questions.length).toPrecision(2) * 100;
                console.log(score);
                quiz.score = score;

                quiz
                    .save()
                    .then((quiz) => {
                        res.send(quiz);
                    }).catch((err) => next(err))

            }).catch((err) => next(err));
    }
    */

    return {
        showQuiz: showQuiz,
        showQuizQuestion: showQuizQuestion,
        answerQuizQuestion: answerQuizQuestion,
        completed: completed,
        overview
        //showQuizResults: showQuizResults
    }
};
