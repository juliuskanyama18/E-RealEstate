import cron from "node-cron";
import User from "../models/User.js";
import Reminder from "../models/Reminder.js";
import { sendEmail } from "../config/nodemailer.js";
import { getRentReminderTemplate } from "./emailTemplates.js";
import { sendSms, normalizeTZPhone } from "./sms.js";

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

        // SMS reminder via Beem Africa
        const phone = normalizeTZPhone(tenant.phone);
        if (phone) {
          const houseName = tenant.house?.name || "your house";
          const amount    = tenant.rentAmount
            ? `TZS ${tenant.rentAmount.toLocaleString()}`
            : "your rent";
          const msg =
            `Hi ${tenant.name}, this is a reminder that ${amount} for ${houseName} is due in ${daysAhead} day${daysAhead !== 1 ? "s" : ""}. Please ensure timely payment.`;
          tasks.push(sendSms(phone, msg));
        }

        return Promise.all(tasks);
      })
    );

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        const phone = normalizeTZPhone(eligible[i].phone);
        const smsNote = phone ? ` + SMS → ${phone}` : "";
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

const advanceRecurringReminders = async () => {
  try {
    const now = new Date();
    const due = await Reminder.find({ recurring: true, status: "upcoming", dateTime: { $lt: now } });
    if (due.length === 0) return;
    console.log(`[CronJob] Advancing ${due.length} recurring reminder(s)`);

    for (const r of due) {
      r.status = "overdue";
      await r.save();

      const next = new Date(r.dateTime);
      if (r.repeatInterval === "daily")   next.setDate(next.getDate() + 1);
      if (r.repeatInterval === "weekly")  next.setDate(next.getDate() + 7);
      if (r.repeatInterval === "monthly") next.setMonth(next.getMonth() + 1);
      if (r.repeatInterval === "yearly")  next.setFullYear(next.getFullYear() + 1);

      await Reminder.create({
        house:          r.house,
        landlord:       r.landlord,
        tenant:         r.tenant,
        dateTime:       next,
        category:       r.category,
        notes:          r.notes,
        status:         "upcoming",
        notifyTenant:   r.notifyTenant,
        recurring:      true,
        repeatInterval: r.repeatInterval,
      });
    }
  } catch (err) {
    console.error("[CronJob] Error advancing recurring reminders:", err.message);
  }
};

export const startCronJob = () => {
  cron.schedule("0 9 * * *", async () => {
    await sendRentReminders();
    await advanceRecurringReminders();
  }, {
    scheduled: true,
    timezone: "Africa/Dar_es_Salaam",
  });
  console.log("[CronJob] Rent reminder + recurring reminder job scheduled — daily at 09:00 AM (Africa/Dar_es_Salaam)");
};
