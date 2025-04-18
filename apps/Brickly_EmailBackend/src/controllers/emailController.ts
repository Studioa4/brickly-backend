import { Request, Response } from 'express';
import { sendEmail } from '../services/emailService';

export async function inviaEmail(req: Request, res: Response) {
  const { from, to, subject, text } = req.body;

  try {
    const result = await sendEmail(from, to, subject, text);
    res.json({ message: 'Email inviata', result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
