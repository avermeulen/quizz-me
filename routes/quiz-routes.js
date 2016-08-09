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

                var next_question_nr = ++question_nr;

                if (quiz.details.questions.length === next_question_nr){
                    return res.redirect(`/quiz/${quiz_id}/completed`);
                }
                res.redirect(`/quiz/${quiz_id}/answer/${next_question_nr}`)
            }).catch((err) => next(err));
    };

    var completed = function(req, res, next){
        res.render('quiz_completed');
    };

    return {
        showQuiz : showQuiz,
        showQuizQuestion : showQuizQuestion,
        answerQuizQuestion : answerQuizQuestion,
        completed : completed
    }
};
