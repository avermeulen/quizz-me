#!/bin/bash

# mongorestore --db quizz_me_prod --collection users

mongoimport --db quizz_me_tests --collection questionairres --file number_quiz.json
