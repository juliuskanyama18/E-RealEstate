/**
 * Quick SMS test via Beem Africa — run with:
 *   node --env-file=.env.local test-sms.js 255XXXXXXXXX
 */

import { sendSms, normalizeTZPhone } from "./utils/sms.js";

const raw = process.argv[2];

if (!raw) {
  console.error("Usage: node --env-file=.env.local test-sms.js <phone>");
  process.exit(1);
}

const phone = normalizeTZPhone(raw);
if (!phone) {
  console.error(`Could not parse phone number: ${raw}`);
  process.exit(1);
}

console.log(`Sending test SMS to ${phone} via Beem Africa…\n`);

try {
  const result = await sendSms(phone, "Test SMS from Kanyama Estates. Beem Africa integration is working!");
  console.log("Response:", JSON.stringify(result, null, 2));
} catch (err) {
  console.error("SMS failed:", err.message || err);
  process.exit(1);
}
