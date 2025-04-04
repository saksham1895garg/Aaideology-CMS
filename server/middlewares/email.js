const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD  // Use APP_PASSWORD instead of PASSWORD
    }
});

const sendPasswordEmail = async(toEmail, password) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: toEmail,
        subject: 'Aaideology - Password',
        text: `Welcome! Here are your login details:\n\nEmail: ${toEmail}\nPassword: ${password}\n\nPlease keep your credentials secure.`

    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Password email sent successfully', toEmail);
    } catch (error) {
        console.error('Error sending password email:', error);
    }
};

const verifyPassword = async(email, subject, text) => {
    try{
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:process.env.PORT,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD  
            }

        });
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: text
        })
        console.log("Email sent successfully")
    }catch(error){
        console.log("Email not sent successfully");
        console.error(error);
    }
}




module.exports = sendPasswordEmail;