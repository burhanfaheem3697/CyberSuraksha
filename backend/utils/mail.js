const Mailgen = require('mailgen')
const nodemailer = require('nodemailer')

exports.sendMail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Task Manager',
            link: 'https://mailgen.js/'

        }
    });

    var emailText = mailGenerator.generatePlaintext(options.mailGenContent)
    var emailBody = mailGenerator.generate(options.mailGenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS,
        },
    });

    const mail = {
        from: process.env.MAILTRAP_SENDEREMAIL,
        to: options.email,
        subject: options.subject,
        text: emailText, // plain‑text body
        html: emailBody, // HTML body
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("email failed",error)
    }


}

exports.emailVerificationMailGenToken = (username, verificationUrl) => {

    return {

        body: {
            name: username,
            intro: 'Welcome to task manager! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Verify your email',
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'

        }
    };
}

exports.forgotPasswordMailGenContent = (username, passwordResetUrl) => {

    return {

        body: {
            name: username,
            intro: 'We got a request to reset your password',
            action: {
                instructions: 'To change the password click the button',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Reset Password',
                    link: passwordResetUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'

        }
    };
}

// sendMail({
//     email : user.email,
//     subject : "aaaa",
//     mailGenContent : emailVerificationMailGenToken(username,``)
// })


