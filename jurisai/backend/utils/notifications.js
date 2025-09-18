import nodemailer from 'nodemailer';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_SECURE,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_WHATSAPP_FROM,
  TWILIO_SMS_FROM
} = process.env;

function createMailTransport() {
  const portNumber = EMAIL_PORT ? parseInt(EMAIL_PORT, 10) : 587;
  const secureFlag = EMAIL_SECURE === 'true' || portNumber === 465;

  return nodemailer.createTransport({
    host: EMAIL_HOST || 'smtp.gmail.com',
    port: portNumber,
    secure: secureFlag,
    auth: EMAIL_USER && EMAIL_PASS ? {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    } : undefined
  });
}

export async function sendEmail({ to, subject, text, html }) {
  const transporter = createMailTransport();

  const fromAddress = EMAIL_USER || 'no-reply@example.com';

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject: subject || 'Reminder',
    text: text || undefined,
    html: html || undefined
  });

  return { messageId: info.messageId, accepted: info.accepted, rejected: info.rejected };
}

function createTwilioClient() {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials are not configured');
  }
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

export async function sendWhatsApp({ to, body }) {
  const client = createTwilioClient();
  const fromNumber = TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  const msg = await client.messages.create({
    from: fromNumber,
    to: toNumber,
    body
  });

  return { sid: msg.sid, status: msg.status };
}

export async function sendSms({ to, body }) {
  const client = createTwilioClient();
  const fromNumber = TWILIO_SMS_FROM;
  if (!fromNumber) {
    throw new Error('TWILIO_SMS_FROM is not configured');
  }

  const msg = await client.messages.create({
    from: fromNumber,
    to,
    body
  });

  return { sid: msg.sid, status: msg.status };
}