const co = require('co');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports = function(models){

    var Quiz = models.Questionairre,
        User = models.User;

    const findUserQuizzes = function(username){

        return co(function*(){
            const user = yield User.findOne({githubUsername : username});
            const quizzes = yield Quiz
                    .find({_user : ObjectId(user._id)})
                    .sort({createdAt : -1});

            return {
                user,
                quizzes : quizzes.map((quiz) => {
                    quiz.active = quiz.status != "completed";
                    quiz.cancelled = quiz.status === "cancelled";
                    return quiz;
                })
            };
        });
    };

    return {
        findUserQuizzes
    };

};
