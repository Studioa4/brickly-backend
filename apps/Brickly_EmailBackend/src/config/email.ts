import dotenv from 'dotenv';
dotenv.config();

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

export function getEmailAccounts(): Record<string, EmailConfig> {
  const accounts = process.env.EMAIL_ACCOUNTS?.split(',') || [];
  const config: Record<string, EmailConfig> = {};

  for (const name of accounts) {
    config[name] = {
      host: process.env[`EMAIL_${name}_HOST`] || '',
      port: Number(process.env[`EMAIL_${name}_PORT`] || 587),
      user: process.env[`EMAIL_${name}_USER`] || '',
      pass: process.env[`EMAIL_${name}_PASS`] || '',
    };
  }

  return config;
}
