var Sequelize = require('sequelize');

module.exports = function(sequalize){

    var course = sequalize.define('courses', {
        name : {
            type : Sequelize.STRING
        },
        description : {
            type : Sequelize.STRING
        }
    });

    return {
        Course : course
    };


}
