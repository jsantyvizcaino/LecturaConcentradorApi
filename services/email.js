class Mail {
    constructor() {
        this.nodemailer = require("nodemailer");
        this.gmailAccount = process.env.GMAIL_ACCOUNT;
        this.gmailPassword = process.env.GMAIL_PASSWORD;
        this.fs = require("fs");
        this.handlebars = require("handlebars");
        this.path = require("path");
    }

    createTransporter() {
        return this.nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: this.gmailAccount,
                pass: this.gmailPassword,
            },
        });
    }

    makeCode(length) {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    sendMail(email, subject, title, description) {

        return new Promise((resolve, reject) => {
            const filePath = this.path.join(__dirname, "../email/index.html");
            const source = this.fs.readFileSync(filePath, "utf-8").toString();
            const template = this.handlebars.compile(source);
            const replacements = {
                title,
                description,
            };
            const htmlToSend = template(replacements);
            this.createTransporter().sendMail({
                    from: `"SUPTELEC" <${this.gmailAccount}>`,
                    to: `${email}`,
                    subject,
                    html: htmlToSend,
                },
                (err, info) => {
                    if (err) {
                        console.log(err)
                        resolve(false);
                    }
                    resolve(info);
                }
            );
        });
    }

    sendMail(email, subject, html) {

        return new Promise((resolve, reject) => {

            const htmlToSend = html;
            this.createTransporter().sendMail({
                    from: `"SUPTELEC" <${this.gmailAccount}>`,
                    to: `${email}`,
                    subject,
                    html: htmlToSend,
                },
                (err, info) => {
                    if (err) {
                        console.log(err)
                        resolve(false);
                    }
                    resolve(info);
                }
            );
        });
    }
}

module.exports = Mail;