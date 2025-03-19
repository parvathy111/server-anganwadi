
const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PSWD
    }
});

// Generic function for both Worker and Supervisor
const sendWelcomeEmail = (email, username, password, role = 'User') => {
    const mailOptions = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: `Welcome ${role}: Your Registration is Successful`,
        html: `
            <p>Hello <strong>${username}</strong>,</p>
            <p>Your ${role} account has been created. Here are your login details:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please change your password after logging in.</p>
        `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports = { sendWelcomeEmail };
