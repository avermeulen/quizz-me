const _ = require('lodash');

module.exports = function(quizResults){

    var answers = quizResults.answers,
        details = quizResults.details,
        questions = details.questions;

    var quizAnswerResults =  answers.map((answer) => {

        var question = _.find(questions, function(question) {
             return question._id.toString() === answer._question.toString();
         });
        var correctAnswer = _.find(question.options, (option) => option.isAnswer);

        var questionText = question.question;

        var userAnswerDetails = {
            question : questionText,
            correct : answer.correct,
            correctAnswer : correctAnswer.answerOption
        };

        if(!answer.correct){
            var incorrectAnswer = _.find(question.options, 
                    (option) => option._id.toString() === answer._answer.toString());
                    
            userAnswerDetails.wrongAnswer = incorrectAnswer.answerOption;
            userAnswerDetails.incorrect = true;
        }

        return userAnswerDetails;
    });

    return quizAnswerResults;

}
