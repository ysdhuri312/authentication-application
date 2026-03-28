/** @format */

import nodemailer from 'nodemailer';

export const emailVerify = async (email: string) => {
  const transporter = nodemailer.createTransport({
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_APP_PASSWORD,
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
      subject: 'Email Verification',
      html: '<b>Hello world?</b>',
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.log('Error while sending mail:', error);
  }
};
