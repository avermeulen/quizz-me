var QueryBuilder = require('../utilities/query-builder');

var Promise = require('bluebird');

module.exports = function(connection) {

    var queryBuilder = QueryBuilder(connection);

    var create = function(courseData) {
        return queryBuilder.execute('insert into courses set ?', courseData)
    };

    var findAllCourses = function() {
        return queryBuilder.execute('select * from courses');
    };

    var findCourseByName = function(courseName) {
        return queryBuilder.execute('select * from courses where name = ? ', [courseName]);
    };

    var findCourseById = function(courseId) {
        return Promise.join(queryBuilder.execute('select * from courses where Id = ? ', [courseId]),
                     findQuestionsForCourse(courseId),
                 function(courses, questions){
                     var course = courses[0];
                     course.questions = questions;
                     return Promise.resolve(course);
                 });
    };

    var addQuestion = function(questionData) {
        if (!questionData.course_id){
            throw new Error('Course Id should have a value');
        }
        return queryBuilder.execute('insert into questions set ? ', questionData);
    };

    var findQuestionsForCourse = function(courseId){
        return queryBuilder.execute('select * from questions where course_id = ?', [courseId]);
    };

    var addQuestionOption = function(questionOption){
        if (!questionOption.question_id){
            throw new Error('Question Id should have a value');
        }
        return queryBuilder.execute('insert into question_options set ?', questionOption);
    };

    var findQuestion = function (text) {
        return queryBuilder.execute('select * from questions where question = ?', [text]);
    };

    var findQuestionOptions = function(questionId){
        return queryBuilder.execute('select * from question_options where question_id = ?', [questionId])
    };

    return {
        addQuestionOption : addQuestionOption,
        findQuestionsForCourse : findQuestionsForCourse,
        findQuestionOptions : findQuestionOptions,
        findCourseByName : findCourseByName,
        findCourseById : findCourseById,
        findQuestion : findQuestion,
        addQuestion : addQuestion,
        create: create,
        findAllCourses: findAllCourses
    };
}
