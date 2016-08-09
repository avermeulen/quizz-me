const mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId;

module.exports = function(models){

    var showQuiz = function(req, res, next){
        var quiz_id = req.params.quiz_id;
        models.Questionairre
            .findOne({_id : ObjectId(quiz_id)})
            .then((quiz) => {
                console.log(quiz);
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

        models.Questionairre
            .findOne({_id : ObjectId(quiz_id)})
            .then((quiz) => {
                var question = quiz.details.questions[question_nr],
                    options = question.options;
                res.render('quiz', { question : question, options : options });
            }).catch((err) => next(err));
    };

    var answerQuizQuestion = function(req, res, next){

    };

    return {
        showQuiz : showQuiz,
        showQuizQuestion : showQuizQuestion,
        answerQuizQuestion : answerQuizQuestion
    }
};
