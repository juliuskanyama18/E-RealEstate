import cron from "node-cron";
import twilio from "twilio";
import User from "../models/User.js";
import { sendEmail } from "../config/nodemailer.js";
import { getRentReminderTemplate } from "./emailTemplates.js";

// ── Tanzanian phone normaliser ────────────────────────────────────────────────
// Accepts:  07XXXXXXXX  |  +2557XXXXXXXX  |  2557XXXXXXXX  |  7XXXXXXXX
// Returns:  +2557XXXXXXXX  or null if unrecognisable
const normalizeTZPhone = (raw) => {
  if (!raw) return null;
  const digits = raw.replace(/[\s\-().]/g, "");
  if (/^\+255[67]\d{8}$/.test(digits)) return digits;          // +2557XXXXXXXX
  if (/^255[67]\d{8}$/.test(digits))   return `+${digits}`;   // 2557XXXXXXXX
  if (/^0[67]\d{8}$/.test(digits))     return `+255${digits.slice(1)}`; // 07XXXXXXXX
  if (/^[67]\d{8}$/.test(digits))      return `+255${digits}`;          // 7XXXXXXXX
  return null;
};

// ── Twilio SMS client (lazy-init so missing creds don't crash boot) ──────────
let _twilioClient = null;
const getSms = () => {
  if (_twilioClient) return _twilioClient;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) return null;
  try {
    _twilioClient = twilio(accountSid, authToken);
    return _twilioClient;
  } catch {
    return null;
  }
};

const sendRentReminders = async () => {
  try {
    const today = new Date();

    console.log(`[CronJob] Rent reminder check — ${today.toDateString()}`);

    // Fetch all active tenants with their house and landlord (including org settings)
    const tenants = await User.find({
      role: "tenant",
      isActive: true,
      email: { $exists: true, $ne: "" },
    })
      .populate("house", "name address city")
      .populate("landlord", "isActive name notifyDaysBefore notificationEmail");

    // For each tenant, check if rent is due in exactly `landlord.notifyDaysBefore` days
    const eligible = tenants.filter((t) => {
      if (!t.landlord?.isActive || !t.rentDueDate) return false;

      const daysAhead = t.landlord.notifyDaysBefore ?? 3;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysAhead);
      const targetDay = targetDate.getDate();

      return t.rentDueDate === targetDay;
    });

    if (eligible.length === 0) {
      console.log("[CronJob] No tenants with rent due today + configured reminder days");
      return;
    }

    console.log(`[CronJob] Sending reminders to ${eligible.length} tenant(s)`);

    const sms = getSms();

    const results = await Promise.allSettled(
      eligible.map(async (tenant) => {
        const daysAhead = tenant.landlord.notifyDaysBefore ?? 3;
        const tasks = [];

        // Email reminder
        tasks.push(
          sendEmail({
            from: process.env.EMAIL,
            to: tenant.email,
            subject: `Rent Reminder – Due in ${daysAhead} Day${daysAhead !== 1 ? "s" : ""}`,
            html: getRentReminderTemplate(tenant, tenant.house, daysAhead),
          })
        );

        // SMS reminder (only when phone is present and Twilio credentials are set)
        const phone = normalizeTZPhone(tenant.phone);
        if (phone && sms) {
          const houseName = tenant.house?.name || "your house";
          const amount    = tenant.rentAmount
            ? `TZS ${tenant.rentAmount.toLocaleString()}`
            : "your rent";
          const msg =
            `Hi ${tenant.name}, this is a reminder that ${amount} for ${houseName} is due in ${daysAhead} day${daysAhead !== 1 ? "s" : ""}. Please ensure timely payment.`;
          tasks.push(
            sms.messages.create({ to: phone, from: process.env.TWILIO_PHONE_NUMBER, body: msg })
          );
        }

        return Promise.all(tasks);
      })
    );

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        const phone = normalizeTZPhone(eligible[i].phone);
        const smsNote = phone && sms ? ` + SMS → ${phone}` : "";
        console.log(`[CronJob] ✓ Email → ${eligible[i].email}${smsNote}`);
      } else {
        console.error(
          `[CronJob] ✗ Failed for ${eligible[i].email}: ${result.reason?.message}`
        );
      }
    });
  } catch (error) {
    console.error("[CronJob] Critical error:", error.message);
  }
};

export const startCronJob = () => {
  cron.schedule("0 9 * * *", sendRentReminders, {
    scheduled: true,
    timezone: "Africa/Dar_es_Salaam",
  });
  console.log("[CronJob] Rent reminder job scheduled — daily at 09:00 AM (Africa/Dar_es_Salaam)");
};
