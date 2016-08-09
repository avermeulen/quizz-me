const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;

module.exports = function(models){

    function findQuizById(quiz_id){
        return models.Questionairre
            .findOne({_id : ObjectId(quiz_id)});
    }

    var showQuiz = function(req, res, next){
        var quiz_id = req.params.quiz_id;
        models.Questionairre
            .findOne({_id : ObjectId(quiz_id)})
            .then((quiz) => {
                var question = quiz.details.questions[0],
                    options = question.options;
                res.render('quiz', { question : question, options : options });
            }).catch((err) => next(err));
    };

    var quizQuestion = function(quiz_id, question_nr){

    };

    var showQuizQuestion = function(req, res, next){
        var quiz_id = req.params.quiz_id,
            question_nr = req.params.question_nr;

        findQuizById(quiz_id)
            .then((quiz) => {
                var question = quiz.details.questions[question_nr],
                    options = question.options;

                res.render('quiz', {
                        quiz_id : quiz_id,
                        question : question,
                        options : options,
                        question_nr : question_nr
                    });
            }).catch((err) => next(err));
    };

    var answerQuizQuestion = function(req, res, next){

        var quiz_id = req.params.quiz_id,
            question_nr = req.params.question_nr;

        findQuizById(quiz_id)
            .then((quiz) => {

                var question = quiz.details.questions[question_nr],
                    options = question.options,
                    answer_id = req.body.answer_id;

                quiz.answers.push({
                    _awnser : answer_id
                });

                var next_question_nr = ++question_nr;
                var lastQuestion = quiz.details.questions.length === next_question_nr;
                if (lastQuestion){
                    quiz.status = "completed";
                }

                quiz
                    .save()
                    .then(() => {
                        if (lastQuestion){
                            return res.redirect(`/quiz/${quiz_id}/completed`);
                        }
                        res.redirect(`/quiz/${quiz_id}/answer/${next_question_nr}`)
                    });
            }).catch((err) => next(err));
    };

    var completed = function(req, res, next){
        res.render('quiz_completed');
    };

    var showQuizResults = function (req, res, next) {
        var quiz_id = req.params.quiz_id;

        findQuizById(quiz_id)
            .then((quiz) => {

                quiz.answers.forEach((answer, index) => {
                    var question = quiz.details.questions[index];
                    var correct = question.options.id(answer._awnser).isAnswer;
                    answer.correct = correct;
                });

                quiz
                    .save()
                    .then((quiz) => {

                        res.send(quiz);
                    })
            

            }).catch((err) => next(err))
    }

    return {
        showQuiz : showQuiz,
        showQuizQuestion : showQuizQuestion,
        answerQuizQuestion : answerQuizQuestion,
        completed : completed,
        showQuizResults : showQuizResults
    }
};
