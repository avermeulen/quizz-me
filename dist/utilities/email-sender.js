const nodemailer = require('nodemailer'), Promise = require('bluebird');
module.exports = function (email, password) {
    const transporter = nodemailer.createTransport(`smtps://${email}:${password}@smtp.gmail.com`);
    return function (mailOptions) {
        return new Promise(function (resolve, reject) {
            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    return reject(err);
                }
                return resolve(info);
            });
        });
    };
};
