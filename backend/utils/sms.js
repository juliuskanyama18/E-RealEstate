// Beem Africa SMS — https://apisms.beem.africa/v1/send
// Env vars: BEEM_API_KEY, BEEM_SECRET_KEY, BEEM_SOURCE_ADDR (sender name, e.g. "KANYAMA")

// Accepts: 07XXXXXXXX | 7XXXXXXXX | 255XXXXXXXX | +255XXXXXXXX
// Returns: 255XXXXXXXX (Beem expects no + prefix) or null
export const normalizeTZPhone = (raw) => {
  if (!raw) return null;
  const digits = raw.replace(/[\s\-().+]/g, "");
  if (/^255[67]\d{8}$/.test(digits)) return digits;
  if (/^0[67]\d{8}$/.test(digits))   return `255${digits.slice(1)}`;
  if (/^[67]\d{8}$/.test(digits))    return `255${digits}`;
  return null;
};

export const sendSms = async (destAddr, message) => {
  const apiKey     = process.env.BEEM_API_KEY;
  const secretKey  = process.env.BEEM_SECRET_KEY;
  const sourceAddr = process.env.BEEM_SOURCE_ADDR || "INFO";

  if (!apiKey || !secretKey) {
    console.warn("[SMS] BEEM_API_KEY or BEEM_SECRET_KEY not set — skipping SMS");
    return null;
  }

  const auth = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const res = await fetch("https://apisms.beem.africa/v1/send", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_addr:   sourceAddr,
      encoding:      0,
      schedule_time: "",
      message,
      recipients: [{ recipient_id: "1", dest_addr: destAddr }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Beem API error ${res.status}`);
  return data;
};
