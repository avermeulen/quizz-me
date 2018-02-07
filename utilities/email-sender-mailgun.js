const nodemailer = require('nodemailer');
const mailgun = require('nodemailer-mailgun-transport');
const hbs = require('nodemailer-express-handlebars');
const handlebars = require('express-handlebars');
const path = require('path');

module.exports = function (api_key){

        var auth = {
            auth: {
                api_key,
                domain: 'mg.projectcodex.co'  
            }
        }
        
        const nodemailerMailgun = nodemailer.createTransport(mailgun(auth));
        
        nodemailerMailgun.use('compile', hbs({
            viewEngine: handlebars.create(),
            viewPath: path.resolve('./email-templates')
        }));


    return function(mailOptions){
        return new Promise(function(resolve, reject) {
            nodemailerMailgun.sendMail(mailOptions, function(err, info) {
                if (err) {
                    return reject(err);
                }
                return resolve(info);
            });
        });
    };

}
