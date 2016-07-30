var assert = require('assert'),
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



});
