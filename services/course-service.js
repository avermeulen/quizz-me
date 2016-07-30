var QueryBuilder = require('../utilities/query-builder');

module.exports = function(connection) {

    var queryBuilder = QueryBuilder(connection);

    var create = function(courseData) {
        return queryBuilder.execute('insert into courses set ?', courseData)
    };

    var findAll = function(courseData) {
        return queryBuilder.execute('select * from courses');
    };

    var findCourseByName = function(courseName) {
        return queryBuilder.execute('select * from courses where name = ? ', [courseName]);
    };

    var addQuestion = function(questionData) {
        if (!questionData.course_id){
            throw new Error('Course Id should have a value');
        }
        return queryBuilder.execute('insert into questions set ? ', questionData);
    };

    var findQuestionsForCourse = function(course_id){
        return queryBuilder.execute('select * from questions where course_id = ?', [course_id]);
    }

    return {
        findQuestionsForCourse : findQuestionsForCourse,
        findCourseByName : findCourseByName,
        addQuestion : addQuestion,
        create: create,
        findAll: findAll
    };
}
