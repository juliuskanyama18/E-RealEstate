import cron from "node-cron";
import User from "../models/User.js";
import { sendEmail } from "../config/nodemailer.js";
import { getRentReminderTemplate } from "./emailTemplates.js";

const sendRentReminders = async () => {
  try {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 3);
    const targetDay = targetDate.getDate();

    console.log(`[CronJob] Rent reminder check — targeting day ${targetDay} of month`);

    const tenants = await User.find({
      role: "tenant",
      rentDueDate: targetDay,
      isActive: true,
    })
      .populate("house", "name address city")
      .populate("landlord", "isActive name");

    const eligible = tenants.filter((t) => t.landlord?.isActive && t.email);

    if (eligible.length === 0) {
      console.log("[CronJob] No eligible tenants with rent due in 3 days");
      return;
    }

    console.log(`[CronJob] Sending reminders to ${eligible.length} tenant(s)`);

    const results = await Promise.allSettled(
      eligible.map((tenant) =>
        sendEmail({
          from: process.env.EMAIL,
          to: tenant.email,
          subject: "Rent Reminder – Due in 3 Days",
          html: getRentReminderTemplate(tenant, tenant.house),
        })
      )
    );

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        console.log(`[CronJob] ✓ Sent to ${eligible[i].email}`);
      } else {
        console.error(`[CronJob] ✗ Failed for ${eligible[i].email}: ${result.reason?.message}`);
      }
    });
  } catch (error) {
    console.error("[CronJob] Critical error:", error.message);
  }
};

export const startCronJob = () => {
  cron.schedule("0 9 * * *", sendRentReminders, {
    scheduled: true,
    timezone: "Africa/Nairobi",
  });
  console.log("[CronJob] Rent reminder job scheduled — daily at 09:00 AM");
};
