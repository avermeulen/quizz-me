const _ = require('lodash');

var mcqCommand = function(answer, question){
    var correctAnswer = _.find(question.options,
            (option) => option.isAnswer);

    const userAnswerDetails = {
        question : question.question,
        correctAnswer : correctAnswer.answerOption,
        correct : answer.correct
    };

    if(!answer.correct){
        var incorrectAnswer = _.find(question.options,
                (option) => option._id.toString()
                    === answer._answer.toString());

        userAnswerDetails.wrongAnswer = incorrectAnswer.answerOption;
        userAnswerDetails.incorrect = true;
    }
    return userAnswerDetails;
};

var freetextCommand = function(answer, question){
    return {
        question : question.question,
        correctAnswer : answer.answerText
    };
}

var answerBuilderCommands = {
    "mcq" : mcqCommand,
    "freetext" : freetextCommand
}

module.exports = function(quizResults){

    var answers = quizResults.answers,
        details = quizResults.details,
        questions = details.questions;

    var quizAnswerResults =  answers.map((answer) => {
        const question = _.find(questions, (question) => {
             return question._id.toString()
                === answer._question.toString();
         });

         var answerBuilder = answerBuilderCommands[question.questionType];
         return answerBuilder(answer, question);
    });
    
    return quizAnswerResults;
}
