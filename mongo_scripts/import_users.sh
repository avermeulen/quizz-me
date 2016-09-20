#!/bin/bash

# mongorestore --db quizz_me_prod --collection users

mongoexport --db quizz_me_prod --collection users --file users.json
