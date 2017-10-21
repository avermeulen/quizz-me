const mongoose = require('mongoose'),
    _ = require('lodash'),
    ObjectId = mongoose.Types.ObjectId,
    AllocateQuiz = require('../utilities/allocate-quiz');


module.exports = function(models, emailQuizNotification) {

    const Course = models.Course,
        Quiz = models.Questionairre,
        User = models.User;

    const allocateQuiz = AllocateQuiz(models);

    async function allocateQuizToMany(course_id, candidateIds){

        const allocations = candidateIds.map((candidate_id) => {
            return allocateQuiz(course_id, candidate_id);
        });

        const allocatedQuizList = await Promise.all(allocations);

        // a user might already have a open quiz allocated for this course
        const newlyAllocatedQuizList =
            allocatedQuizList.filter((q) => q.status !== "already allocated");

        const emailedAll = newlyAllocatedQuizList.map((response) => {
            const allocatedQuiz = response.data;
            return emailQuizNotification(allocatedQuiz._user, allocatedQuiz._id);
        });

        await Promise.all(emailedAll);
        
        return newlyAllocatedQuizList.map((alloc) => alloc.data);
    }

    return allocateQuizToMany;

}
