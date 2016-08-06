var mongoose = require('mongoose');
var schemas = require('./schemas');

module.exports = {
    Course : mongoose.model('Course', schemas.courseSchema),
    Question : mongoose.model('Course', schemas.questionSchema)
};
