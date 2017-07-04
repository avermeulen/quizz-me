const EmailSender = require('./utilities/email-sender');
const email = process.env.GMAIL_ACCOUNT, password = process.env.GMAIL_CREDENTIALS;
if (email && password) {
    var emailSender = EmailSender(email, password);
    // create reusable transporter object using the default SMTP transport
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"Quizz Me" <andre@projectcodex.co>',
        to: 'andre.vermeulen@gmail.com',
        subject: 'You got a new quiz!',
        text: 'Hello world',
        html: '<b>Hello world</b>' // html body
    };
    // send mail with defined transport object
    emailSender
        .send(mailOptions)
        .then(() => console.log('email sent'))
        .catch((err) => console.log(err));
}
else {
    console.log('credentials not found!');
}
//# sourceMappingURL=send_email.js.map