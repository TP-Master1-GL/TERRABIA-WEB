import nodemailer from 'nodemailer';
import { emailUser, emailPass } from '../config/index.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser,
        pass: emailPass
    }
});

export async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: emailUser,
        to,
        subject,
        text
    };

    await transporter.sendMail(mailOptions);
    console.log(`email sent to ${to}`);
}