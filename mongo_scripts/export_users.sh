#!/bin/bash

#mongodump --db quizz_me_registration_tests --collection users
mongoexport --db quizz_me_registration_tests --collection users --out users.json
