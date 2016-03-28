import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { site, email } from '../configs';

const { host, user, pass } = email;
const transporter = nodemailer.createTransport(`smtps://${user}:${pass}@${host}`);

const randomString = () => Math.random().toString().substr(2, 8);

export function generateVerifyCode() {
  const content = Array.from(new Array(5), randomString).join();
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: email.from,
    to,
    subject,
    html,
  });
}

export function sendVerifyEmail(to, verifyCode) {
  const subject = '[API] Confirmation mail';
  const html = `
    <p>
      Click link: ${site.url}/user/register/email-check?code=${verifyCode}
    </p>
  `;

  return sendEmail(to, subject, html);
}
