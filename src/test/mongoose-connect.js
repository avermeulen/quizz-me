const mongoose = require('mongoose');
const Promise = require('bluebird');

module.exports = function(){
    if (!mongoose.connection.readyState){
        mongoose.Promise = Promise;
        mongoose.connect('mongodb://localhost/quizz_me_tests');
    }
}
