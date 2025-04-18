import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

config();

export async function inviaEmailLogBatch() {
  const logPath = path.resolve(__dirname, '../../tmp/log_batch.json');

  if (!fs.existsSync(logPath)) {
    console.warn('⚠️ Nessun log trovato da inviare.');
    return;
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const data = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const info = await transport.sendMail({
    from: `"PEC Extractor" <${process.env.SMTP_USER}>`,
    to: process.env.EMAIL_DESTINATARIO,
    subject: `📥 Report Fatture PEC - ${data}`,
    text: 'In allegato trovi il report completo dell\'elaborazione batch delle fatture elettroniche.',
    attachments: [
      {
        filename: 'log_batch.json',
        path: logPath
      }
    ]
  });

  console.log(`📧 Email inviata a ${process.env.EMAIL_DESTINATARIO}: ${info.messageId}`);
}
