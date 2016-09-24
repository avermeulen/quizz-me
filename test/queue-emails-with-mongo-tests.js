const assert = require('assert'),
    Promise = require('bluebird'),
    co = require('co'),
    mongoose = require('mongoose'),
    EmailQueue = require('../utilities/email-queue'),
    models = models = require('../models'),
    mongooseConnect = require('./mongoose-connect');

require('co-mocha')

describe('EmailQueue with Mongo', () => {
    mongooseConnect();

    beforeEach(function*() {
        yield models.Email.remove({});
    })

    it('should store data in the database correctly', function*() {
        try {

            const USERNAME = 'theUser';
            const EMAIL = 'email@user.za';
            const SUBJECT = 'You got a new quiz!';
            const QUIZ_ID = '925';
            const queueEmail = EmailQueue(models);

            //
            var result = yield queueEmail({
                username: USERNAME,
                subject: SUBJECT,
                quiz_id: QUIZ_ID,
                emailType: 'quiz_sent'
            });

            var email = yield models.Email.find({emailType : 'quiz_sent'});

            assert.equal(email.length, 1);
            var containsQuizId = email[0].content.indexOf(QUIZ_ID) != -1;
            assert(containsQuizId, 'quiz id should be in the email contnent');

        } catch (err) {
            assert.fail('there should not be exceptions', err)
        }
    });


});
