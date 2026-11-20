const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER || process.env.EMAIL_USER,
    pass: process.env.BREVO_PASS || process.env.EMAIL_PASS
  }
});

module.exports = transporter;
