module.exports = function(quizService, allocateQuizFunc){

    async function allocateQuiz(req, res, next){
        try{
            const coder_id = req.params.coder_id;
            const course_id = req.params.course_id;

            let result = await allocateQuizFunc(course_id, coder_id);

            res.json(result);
        }
        catch(err){
            res.json( {
                status : "error",
                err,
                stack : err.stack
            });
        }
    }

    async function getQuiz(req, res, next){
        try{
            const quiz_id = req.params.quiz_id;
            const quiz = await quizService.getQuiz(quiz_id);

            res.json({
                status : "success",
                data : quiz
            });
        }
        catch(err){
            res.json( {
                status : "error",
                err,
                stack : err.stack
            });
        }
    }

    async function answerQuiz(req, res, next){
        try{
            const quiz_id = req.params.quiz_id;
            const question_id = req.params.question_id;
            const answer = req.body.answer;

            const quiz = await quizService.answerQuiz({
                quiz_id,
                question_id,
                answer
            });

            res.json({
                status : "success",
                data : quiz
            });
        }
        catch(err){
            res.json( {
                status : "error",
                err,
                stack : err.stack
            });
        }

    }

    // function answerQuizQuestion(quiz_id, question_id){
    //     const quiz = await Quiz.findQuizById(quiz_id);
    //
    //     quiz.
    //
    //
    // }

    return {
        answerQuiz,
        getQuiz
    }

};
