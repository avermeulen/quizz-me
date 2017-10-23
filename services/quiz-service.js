module.exports = function(models){

    const Quiz = models.Questionairre;

    async function getQuiz(quiz_id){
        let quiz = await Quiz.findById(quiz_id);
        return quiz;
    }

    async function answerQuiz(params){

        const quiz_id = params.quiz_id;
        const question_id = params.question_id;
        const answer = params.answer;

        const quiz = await Quiz.findById(quiz_id);
        const currentAnswer = quiz.answers.find((q) => q._question.toString() === question_id);

        //if already answered do nothing
        if (quiz.completed || currentAnswer){
            return;
        }

        const question = quiz.details.questions.id(question_id);
        const theAnswer = {
                _question : question_id,
                questionType : question.questionType,
        };

        if (question.questionType === "mcq"){
            theAnswer._awnser = answer
        }
        else if (question.questionType === "freetext"){
            theAnswer.answerText = answer;
        }

        quiz.answers.push(theAnswer);
        quiz.nextQuestionNumber = quiz.answers.length;

        if (quiz.answers.length === quiz.details.length){
            quiz.status = "completed";
            quiz.completedAt = new Date();
        }

        return await quiz.save();
    }

    return {
        getQuiz,
        answerQuiz
    }

};
