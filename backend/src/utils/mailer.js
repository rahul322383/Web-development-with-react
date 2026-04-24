'use strict';

const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: Number(env.MAIL_PORT),
    secure: env.MAIL_PORT === '465',
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
    },
});

const sendMail = ({ to, subject, html }) =>
    transporter.sendMail({
        from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
        to,
        subject,
        html,
    });

module.exports = { sendMail };