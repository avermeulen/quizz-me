var mongoose = require('mongoose'),
    assert = require('assert'),
    models = require('../dist/models'),
    Promise = require('bluebird'),
    async = require('co'),
    mongooseConnect = require('./mongoose-connect');

var Course = models.Course;

function addQuestion(course, question){
    course
        .questions
        .push({
            question : question
        });
};

function addCourseWithQuestions(courseDetails, questions) {
    return async(function *(){
        var course = new Course(courseDetails);
        course = yield course.save();
        questions.forEach((question) => addQuestion(course, question));
        return course.save();
    });
}

function addTestCourseWithTwoQuestions() {
    return addCourseWithQuestions({
        name: 'test course',
        description: 'a test course'
    }, ['What color is the sky?',
        'What color are mountains?']);
};

function findQuestion(question){
    return async(function *(){
        var course = yield Course.findOne(
            {'questions.question' : question}
            ,{'questions.$': 1}
        );
        return course.questions[0];
    });
};

describe('mcq mongoose config', () => {

    mongooseConnect();

    beforeEach((done) => {
        Course.remove({}, (err) => {
            done(err);
        });
    });

    it('should allow for adding courses', (done) => {

        async(function *(){
            try{
                var course = new Course({
                    name: 'test course',
                    description: 'a test course'
                });
                yield course.save();
                var courses = yield Course.find({
                    name: 'test course'
                });

                assert.equal(1, courses.length);
                done();
            }
            catch(err){
                done(err);
            }
        });
    });

    it('should allow for adding course questions', (done) => {
        addTestCourseWithTwoQuestions().then(() => {
                Course.findOne({
                        name: 'test course'
                    })
                    .then(function(course) {
                        assert.equal(2, course.questions.length);
                        done();
                    })
                    .catch((err) => done(err));
            });
    });

    it('should allow for adding question options', (done) => {
        addTestCourseWithTwoQuestions().then(() => {
                Course.findOne({
                        name: 'test course'
                    })
                    .then(function(course) {
                        var options = course.questions[0].options;
                        //console.log(course.questions[0].id);
                        options.push({answerOption : 'Blue', isAnswer : true});
                        options.push({answerOption : 'Orange', isAnswer : false});
                        course.save();
                        assert.equal(2, course.questions[0].options.length);
                        done();
                    })
                    .catch((err) => done(err));
            });
    });

    it('should find question in course', (done) => {
        async(function *(){
            try{
                yield addTestCourseWithTwoQuestions();
                var question = yield findQuestion('What color are mountains?');
                assert.equal(question.question, 'What color are mountains?');
                done();
            }
            catch(err){
                done(err);
            }
        });
    });

});
