import cron from "node-cron";
import User from "../models/User.js";
import { sendEmail } from "../config/nodemailer.js";
import { getRentReminderTemplate } from "./emailTemplates.js";

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
      eligible.map((tenant) => {
        const daysAhead = tenant.landlord.notifyDaysBefore ?? 3;
        return sendEmail({
          from: process.env.EMAIL,
          to: tenant.email,
          subject: `Rent Reminder – Due in ${daysAhead} Day${daysAhead !== 1 ? "s" : ""}`,
          html: getRentReminderTemplate(tenant, tenant.house, daysAhead),
        });
      })
    );

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        console.log(`[CronJob] ✓ Sent to ${eligible[i].email}`);
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
