var assert = require('assert'),
    CourseService = require('../services/course-service'),
    mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'quiz_master',
    password: 'password',
    database: 'quizz_me'
});

describe("the course service", () =>{

    beforeEach((done) => {

        connection.query('delete from courses', (err) => {
            done(err);
        });

    });

    it("should be able it add a course", (done) =>{
        var courseService = CourseService(connection);
        courseService.create({name : 'Test Course', description : 'This is a test course'});
        courseService
            .findAll()
            .then((courses) => {
                assert.equal(courses.length, 1);
                done();
            });
    });

});
