/**
 * Quick SMS test — run with:
 *   node --env-file=.env.local test-sms.js +255XXXXXXXXX
 */

import twilio from "twilio";

const phone = process.argv[2];

if (!phone) {
  console.error("Usage: node --env-file=.env.local test-sms.js +XXXXXXXXXXX");
  process.exit(1);
}

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN or TWILIO_PHONE_NUMBER not set in .env.local");
  process.exit(1);
}

console.log(`From    : ${TWILIO_PHONE_NUMBER}`);
console.log(`Sending test SMS to ${phone} …\n`);

try {
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  const message = await client.messages.create({
    to: phone,
    from: TWILIO_PHONE_NUMBER,
    body: "Test SMS from your rental system. Twilio integration is working!",
  });

  console.log("Status :", message.status);
  console.log("SID    :", message.sid);
} catch (err) {
  console.error("SMS failed:", err.message || err);
  process.exit(1);
}
