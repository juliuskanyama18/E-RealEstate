import dotenv from 'dotenv';
dotenv.config();

// Uses Brevo HTTP API instead of SMTP — works on all hosting platforms (no port blocking)
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export const sendEmail = async ({ from, to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const payload = {
    sender: { email: from || process.env.EMAIL, name: 'RentalSaaS' },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Brevo API error:', error);
    throw new Error(`Brevo API error ${response.status}: ${error}`);
  }

  const result = await response.json();
  console.log('✅ Email sent successfully via Brevo API:', result.messageId);
  return result;
};

export const checkEmailHealth = async () => {
  if (!process.env.BREVO_API_KEY) {
    return { status: 'error', message: 'BREVO_API_KEY not configured' };
  }
  return { status: 'healthy', message: 'Brevo API configured' };
};

export default { sendEmail, checkEmailHealth };
