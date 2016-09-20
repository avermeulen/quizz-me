const nodemailer = require('nodemailer'),
    Promise = require('bluebird');

module.exports = function (email, password){

    var transporter = nodemailer.createTransport(`smtps://${email}:${password}@smtp.gmail.com`);

    var sendEmail = function(mailOptions){

        return new Promise(function(resolve, reject) {

            transporter.sendMail(mailOptions, function(error, info) {
                if (error) {
                    return reject(error);
                }
                return resolve(info);
            });

        });
    };

    return {
        send : sendEmail
    }
}
