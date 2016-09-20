#!/bin/bash

# mongorestore --db quizz_me_prod --collection users

mongoimport --db quizz_me_prod --collection users --file users.json
