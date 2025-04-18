import nodemailer from 'nodemailer';
import { getEmailAccounts } from '../config/email';

const accounts = getEmailAccounts();

export async function sendEmail(fromAlias: string, to: string, subject: string, text: string) {
  const account = accounts[fromAlias];
  if (!account) throw new Error(`Account email '${fromAlias}' non configurato`);

  const transporter = nodemailer.createTransport({
    host: account.host,
    port: account.port,
    secure: account.port === 465,
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });

  const info = await transporter.sendMail({
    from: account.user,
    to,
    subject,
    text,
  });

  return info;
}
