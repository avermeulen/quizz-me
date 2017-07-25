`
export CLIENT_ID=8e0848f804ad39d0446f
export CLIENT_SECRET=6aa4c71e728a5946520ef14e26131a535ad58fa6
export MONGODB_URL=mongodb://localhost/quizz_me_active
export DOMAIN_NAME=quiz-me.projectcodex.co
export EMAIL=andre@projectcodex.co
export EMAIL_CREDENTIALS=
`

export TEST_EMAIL=andre@projectcodex.co

run this script to fix existing questions that got no `questionType`:

`node mongo_scripts/fix_missing_questionTypes.js`
