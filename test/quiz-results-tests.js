const quizResults = require('./data/quiz-result.json');
const quizResultsBuilder = require('../dist/utilities/quiz-results-builder');
const _ = require('lodash');
const assert = require('assert');
const models = require('../dist/models');
const mongooseConnect = require('./mongoose-connect');
const co = require('co');
//var mocha = require('mocha');
require('co-mocha');

describe('ResultsBuilder', function(done){
    mongooseConnect();

    beforeEach(function*(){
        yield models.Questionairre.remove({});

        var quiz = new models.Questionairre(quizResults);
        yield quiz.save();

    });

    it('should match results and correct answers', function*() {

            var quiz = yield models.Questionairre
                .findById("57c6da441fb2c0ac907f6746");

            var results =  quizResultsBuilder(quiz);
            assert.equal(results.length, 3)

            assert.equal(results[0].correct, false);
            assert.equal(results[0].question, 'Which number is the biggest');
            assert.equal(results[0].wrongAnswer, 5);

            assert.equal(results[1].correct, true);
            assert.equal(results[1].question, 'Which number is the square root of 25?');
            assert.equal(results[1].wrongAnswer, null);

            assert.equal(results[2].correct, true);
            assert.equal(results[2].question, 'What number is bigger than 100');
            assert.equal(results[2].wrongAnswer, null);

    });
});
