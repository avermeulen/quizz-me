var QueryBuilder = require('../utilities/query-builder');

module.exports = function(connection) {

    var queryBuilder = QueryBuilder(connection);

    var create = function(courseData) {
        return queryBuilder.execute('insert into courses set ?', courseData)
    };

    var findAll = function(courseData) {
        return queryBuilder.execute('select * from courses');
    };

    return {
        create: create,
        findAll: findAll
    };
}
