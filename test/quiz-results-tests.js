const quizResults = require('./quiz-result');
const quizResultsBuilder = require('../utilities/quiz-results-builder');
const _ = require('lodash');
const assert = require('assert');

describe('ResultsBuilder', () => {

    it('should match results and correct answers', () => {

            var results =  quizResultsBuilder(quizResults);
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

            //console.log(results);
    });
});
