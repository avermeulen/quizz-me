var mongoose = require('mongoose');
var schemas = require('./schemas');

module.exports = {
    Course : mongoose.model('Course', schemas.courseSchema),
    //Question : mongoose.model('Question', schemas.questionSchema),
    User : mongoose.model('User', schemas.userSchema),
    Questionairre : mongoose.model('Questionairre', schemas.questionairreSchema),
};
