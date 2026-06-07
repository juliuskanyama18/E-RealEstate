/**
 * Quick SMS test via Beem Africa — run with:
 *   node --env-file=.env.local test-sms.js 255XXXXXXXXX
 */

import { normalizeTZPhone } from "./utils/sms.js";

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

const apiKey     = process.env.BEEM_API_KEY;
const secretKey  = process.env.BEEM_SECRET_KEY;
const sourceAddr = process.env.BEEM_SOURCE_ADDR || "INFO";

console.log(`Phone      : ${phone}`);
console.log(`Source     : ${sourceAddr}`);
console.log(`API key    : ${apiKey ? apiKey.slice(0, 6) + "…" : "NOT SET"}`);
console.log(`Secret key : ${secretKey ? secretKey.slice(0, 6) + "…" : "NOT SET"}`);
console.log("");

const auth = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
const payload = {
  source_addr:   sourceAddr,
  encoding:      0,
  schedule_time: "",
  message:       "Test SMS from Kanyama Estates. Beem Africa integration is working!",
  recipients: [{ recipient_id: "1", dest_addr: phone }],
};

console.log("Payload:", JSON.stringify(payload, null, 2));
console.log("");

const res = await fetch("https://apisms.beem.africa/v1/send", {
  method: "POST",
  headers: {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const data = await res.json();
console.log(`Status  : ${res.status}`);
console.log("Response:", JSON.stringify(data, null, 2));
