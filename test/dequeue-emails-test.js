const assert = require('assert'),
    Promise = require('bluebird'),
    DequeueEmails = require('../utilities/email-dequeue'),
    co = require('co'),
    co_mocha = require('co-mocha');

describe('dequeueEmails', () => {

    it('constructor should fail if no mongoose models given', function*() {
        try {
            new DequeueEmails({});
            // this will only happen if mongoose models available
            assert.fail('There should have been an exception!');
        } catch (e) {

        }
    });

    it('constructor should NOT fail if mongoose models given', function*() {
        try {
            const USERNAME = 'theUser';
            const EMAIL = 'email@user.za';
            const SUBJECT = 'You got a new quiz!';
            const QUIZ_ID = '925';

            var Email = function(data){
                this.data = data;
            };

            Email.find = function(){
                return [];
            }

            Email.prototype.save = function(){

                assert.equal(this.data.to, EMAIL);
                assert.equal(this.data.subject, 'You got a new quiz!');
                assert.equal(this.data.status, 'NEW');

                const ID_IN_EMAIL = this.data.content.indexOf(QUIZ_ID) !== -1
                assert.equal(ID_IN_EMAIL, true, 'Quiz id not in email');

                return Promise.resolve({});

            };


            var models = {
                User: {
                    find: function(user) {
                        assert.equal(user.githubUsername, USERNAME)
                        return Promise.resolve({
                            firstName: 'UserOne',
                            email: EMAIL,
                        });
                    }
                },
                Email: Email
            };

            const dequeueEmails = DequeueEmails(models);

            //
            var result = yield dequeueEmails();

        } catch (err) {
            assert.fail('there should not be exceptions', err)
        }
    });


});
