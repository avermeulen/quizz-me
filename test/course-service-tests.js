var assert = require('assert'),
    CourseService = require('../services/course-service'),
    QueryBuilder = require('../utilities/query-builder'),
    mysql = require('mysql'),
    Promise = require('bluebird'),
    Sequelize = require('sequelize'),
    Modelz = require('../modelz');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'quiz_master',
    password: 'password',
    database: 'quizz_me'
});

var sequalize = new Sequelize('quizz_me', 'quiz_master', 'password', {
    host : 'localhost',
    dialect : 'mysql'
});

var modelz = new Modelz(sequalize);

describe("the course service", () =>{

    beforeEach((done) => {
        var queryBuilder = QueryBuilder(connection);

        Promise.join(
            queryBuilder.execute('delete from courses where name like ?', 'Test%'),
            queryBuilder.execute('delete from questions where question like ?', 'What%'),
            () => {
                done();
            }
        );

        /*
        connection.query('delete from courses where name like ?', 'Test%', (err) => {
            done(err);
        });
        */
        //done();
    });

    // it('find alll', (done) => {
    //
    //     modelz.Course.findAll().then(function(results){
    //         assert.equal(1, results.length);
    //         done();
    //     });
    //
    // })

    it("should be able it add a course", (done) =>{
        var courseService = CourseService(connection),
            testCourse = {name : 'Test Course',
                description : 'This is a test course'};

        courseService
            .create(testCourse)
            .then(() => {
                    courseService
                        .findCourseByName(testCourse.name)
                        .then((courses) => {
                            assert.equal(courses.length, 1);
                            done();
                        });
                });
    });

    it("should be able it add a question to a course", (done) =>{
        var courseService = CourseService(connection);

        courseService
            .findCourseByName('Know your world')
            .then((course) => {

                assert.equal(1, course.length);
                var course_id = course[0].id,
                questionToAdd = {question : 'What color is the sky?',
                        course_id : course_id };

                courseService
                    .addQuestion(questionToAdd)
                    .then(() => {
                            courseService
                                .findQuestionsForCourse(questionToAdd.course_id)
                                .then((questions) => {
                                    assert.equal(questions.length, 1);
                                    done();
                                })
                                .catch((err) => done(err) );
                        });

            });

    });



});
