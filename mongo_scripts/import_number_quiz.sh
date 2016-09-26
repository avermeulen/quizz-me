#!/bin/bash

# mongorestore --db quizz_me_prod --collection users

mongoimport --db quizz_me_active --collection questionairres --file number_quiz.json
