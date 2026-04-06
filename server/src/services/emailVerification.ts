/** @format */

import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'node:path';
import { env } from '../config/env';

export const emailVerify = async (token: string, email: string) => {
  const transporter = nodemailer.createTransport({
    auth: {
      user: env.EMAIL,
      pass: env.EMAIL_APP_PASSWORD,
    },
    service: 'gmail',
  });

  const verificationLink = `http://localhost:3000/api/v1/auth/verify-email?t=${token}`;

  try {
    await transporter.verify();
    console.log('Server is ready to take our messages');
  } catch (error) {
    console.error('Verification failed:', error);
  }

  const html = path.join(path.resolve(), '/src/services/emailTemplate.ejs');
  const emailTemplate = await ejs.renderFile(html, { verificationLink });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Email Verification',
      html: emailTemplate,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log('Error while sending mail:', error);
  }
};
