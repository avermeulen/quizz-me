
const assert = require('assert'),
    Promise = require('bluebird'),
    co = require('co'),
    mongoose = require('mongoose'),
    EmailQueue = require('../dist/utilities/email-queue'),
    models = require('../dist/models'),
    mongooseConnect = require('./mongoose-connect');

describe('Group tests', function(){
    mongooseConnect();

    it("should add group", function(done){

        models.UserGroup
            .find({}, function(err){
                done(err);
            })


    });

});
