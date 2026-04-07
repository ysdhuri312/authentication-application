/** @format */

import nodemailer from 'nodemailer';

import { env } from '../config/env';

export async function sendResetEmail(email: string, token: string) {
  const url = `${env.FRONTEND_URL}/reset-password?t=${token}`;

  const transporter = nodemailer.createTransport({
    auth: {
      user: env.EMAIL,
      pass: env.EMAIL_APP_PASSWORD,
    },
    service: 'gmail',
  });

  try {
    await transporter.verify();
    console.log('Server is ready to take our messages');
  } catch (error) {
    console.error('Verification failed:', error);
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Reset your password',
      html: `
             <h2>Password Reset</h2>
            <p>Click below to reset your password:</p>
            <a href="${url}">${url}</a>
            <p>This link expires in 10 minutes.</p>
        `,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log('Error while sending mail:', error);
  }

  return;
}
