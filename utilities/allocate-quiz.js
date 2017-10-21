const mongoose = require('mongoose'),
    _ = require('lodash'),
    ObjectId = mongoose.Types.ObjectId;

module.exports = function(models) {

    var Course = models.Course,
        Quiz = models.Questionairre,
        User = models.User;

    const isObjectId = (id) => id instanceof ObjectId ? id : Object(id);

    function shuffleMcqOptions(mcqQuestions, question_count){
        const questions = _.sampleSize(mcqQuestions, question_count);
        const shuffleOptions = (question) => question.options = _.shuffle(question.options);
        questions.forEach(shuffleOptions);
        return questions;
    }

    const selectAndShuffleQuestions = (course, question_count) => {
        const mcqQuestions = _.filter(course.questions,
            (question) => question.questionType === 'mcq');

        const freetextQuestions = _.filter(course.questions,
            (question) => question.questionType === 'freetext');

        const questions = shuffleMcqOptions(mcqQuestions, question_count);

        //append freetext at the end
        return questions.concat(freetextQuestions);

    };

    async function allocateQuiz(course_id, user_id, question_count) {

        var course_id = isObjectId(course_id),
            user_id = isObjectId(user_id),
            question_count = question_count || 3;

        var activeQuizForUser = await Quiz.find({
            _course: course_id,
            _user: user_id,
            status: 'active'
        });

        if (activeQuizForUser.length === 0) {

            const course = await Course.findById(course_id,
                '-_id -questions._id -questions.options._id -__v');

            if (course.questions) {
                question_count = course.questions.length;
                if (course.questions && course.questions.length > 5) {
                    question_count = Math.ceil(course.questions.length / 2) + 1
                }
            }

            course.questions = selectAndShuffleQuestions(course, question_count);

            const quiz = Quiz({
                _user: user_id,
                _course: course_id,
                details: course
            });

            const savedQuiz = await quiz.save();
            return {
                status : "success",
                data : savedQuiz
            };

        } else {
            return {
                status: 'already allocated',
                data : {
                    user_id,
                    course_id,
                }
            };
        }
    };

    return allocateQuiz;
}
