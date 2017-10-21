const AllocateQuizToMany = require('../utilities/allocate-quiz-to-many'),
    EmailQuizNotification = require("../utilities/email-quiz-notification"),
    mongooseConnect = require('./mongoose-connect'),
    models = require('../models'),
    courseData = require('./course-data.json'),
    assert = require('assert');

describe('AllocateQuizToMany', () => {
    mongooseConnect();

    var course_id,
        user_ids = [];

    beforeEach(async function (){

        var removeAll = [models.Course.remove({}),
            models.Email.remove({}),
            models.Questionairre.remove({})];

        await Promise.all(removeAll);

        var course = models.Course(courseData);
        var result = await course.save();
        course_id = result._id;

        var user1 = models.User({
            "firstName" : "Andre",
            "lastName" : "Vermeulen",
            "email" : "andre@projectcodex.co",
            "githubUsername" : "avermeulen",
            "role" : "candidate",
            "active" : true,
            "__v" : 0
        });

        await user1.save();
        user_ids.push(user1._id);

        var user2 = models.User({
            "firstName" : "Joe",
            "lastName" : "Blaine",
            "email" : "joe@projectcodex.co",
            "githubUsername" : "jblaine",
            "role" : "candidate",
            "active" : true,
            "__v" : 0
        });

        await user2.save();
        user_ids.push(user2._id);

    });

    it('should allocate a quiz', async function() {

        const emailQuizNotification = EmailQuizNotification(models);
        const allocateQuizToMany = AllocateQuizToMany(models, emailQuizNotification);

        await allocateQuizToMany(course_id, user_ids);

        const allocatedQuizList = await models.Questionairre.find({_course : course_id});
        assert.equal(2, allocatedQuizList.length);

        var emails = await models.Email.find({})
        assert.equal(emails.length, 2);

    });

});
