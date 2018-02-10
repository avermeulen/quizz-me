module.exports = function(models){
    
    const Quiz = models.Questionairre;
    const User = models.User;
    const Course = models.Course;

    return async function allocateQuizToCoder(params) {

        let user = await User.findOne({ githubUsername: params.username });

        let currentQuiz = await Quiz.findOne({
            _user : user._id,
            context : params.context
        });
        
        //only create allocate a new Quiz if there is not already one for the current context.
        if (currentQuiz){
            return currentQuiz;
        }

        let course = await Course.findById(params.courseId,
            '-_id -questions._id -questions.options._id -__v');

        let quiz = Quiz({
            _user: user._id,
            _course: course._id,
            context : params.context,
            details: course,
        });

        return await quiz.save();
    }

}