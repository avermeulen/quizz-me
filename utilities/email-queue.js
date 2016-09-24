//'use strict';
const fs = require('fs');
const co = require('co');
const fsp = require('fs-promise');
const Handlebars = require('handlebars');

module.exports = function(models){

    //const models = params.models;
    if (!models){
        throw new Error('Email service needs the mongoose models')
    }

    const Email = models.Email,
        User = models.User;

    var queueEmail = function(params){
        return co(function*(){

            const emailType = params.emailType,
                subject = params.subject,
                username = params.username,
                quiz_id = params.quiz_id;

            const rootPath = process.cwd();
            const templatePath = `${rootPath}/email_templates/${emailType}.handlebars`;
            const templateExists = yield fsp.exists(templatePath);
            const serverRoot = process.env.DOMAIN_NAME || 'localhost:3000';
            const quiz_url = `http://${serverRoot}/quiz/${quiz_id}`;

            if (!templateExists){
                throw new Error('Template not found : ' + templatePath);
            }

            const emailTemplateText = yield fsp.readFile(templatePath, 'utf-8'),
                  user = yield User.find({githubUsername : username}),
                  emailTemplate = Handlebars.compile(emailTemplateText);

                const emailDetails = {
                    status : 'NEW',
                    emailType : emailType,
                    to : user.email,
                    from : '"Quizz Me" <andre@projectcodex.co>',
                    subject : subject,
                    content : emailTemplate({
                        first_name : user.firstName,
                        quiz_url
                    })
                };

            return Email.save(emailDetails);
        });
    }

    return queueEmail;
}
