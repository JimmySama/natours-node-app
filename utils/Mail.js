const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Natours <${process.env.EMAIL_FROM}>`;
    }

    createTransport() {
        //Production with Sendgrid
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                },
            });
        }
        //Development with Mailtrap
        return nodemailer.createTransport({
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
                user: process.env.EMAIL_ACCOUNT, //generated by Mailtrap
                pass: process.env.EMAIL_PASSWORD, //generated by Mailtrap
            },
        });
    }

    async send(template, subject) {
        //1 render html template
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject,
        });
        //2 mail options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
        };
        //3 create transporter
        await this.createTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to Natours Family');
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Sending password reset email');
    }
};
