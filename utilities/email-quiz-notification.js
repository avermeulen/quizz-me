const EnqueueEmail = require('../utilities/email-queue');

module.exports = function(models){

    const User = models.User;
    const Quiz = models.Questionairre;
    const Course = models.Course;

    const enqueueEmail = EnqueueEmail(models);

    async function sendQuizEmail(user_id, quiz_id){
                
        const user = await User.findById(user_id);
        const quiz = await Quiz.findById(quiz_id);
        const course = await Course.findById(quiz._course);

        await enqueueEmail({
            emailType : 'quiz_sent',
            subject : 'codeX quizz to complete : ' + course.name,
            username : user.githubUsername,
            quiz_id : quiz._id,
            data : {
                name : course.name,
                description : course.description
            }
        });
    }

    return sendQuizEmail;

}
