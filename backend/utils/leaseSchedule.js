// Shared lease payment-schedule math — mirrors admin/src/utils/leaseSchedule.js.
// Used anywhere the backend needs to know "is this month an installment due
// month for this lease's payment frequency" (tenant payment schedule, the
// daily rent-reminder cron job), so a quarterly/biannual/etc. lease isn't
// treated as if it billed every month.

/* Frequency → interval in months. 0 = One-Time (no recurring due dates). */
export const FREQ_MONTHS = {
  "One-Time": 0, "1 Month": 1, "2 Months": 2, "3 Months": 3,
  "4 Months": 4, "5 Months": 5, "6 Months": 6, "9 Months": 9,
  "18 Months": 18, "24 Months": 24, "1 Year": 12,
};

/* Actual calendar day for paymentDay in a given year/month. paymentDay 31 = last day of month. */
export const actualPayDay = (paymentDay, yr, mo) => {
  if (paymentDay === 31) return new Date(yr, mo + 1, 0).getDate();
  return Math.min(paymentDay, new Date(yr, mo + 1, 0).getDate());
};

/* Is calYear/calMonth an installment-due month, given a lease's startDate/paymentDay/frequency? */
export const isDueMonth = (startDate, paymentDay, frequency, calYear, calMonth) => {
  if (!startDate || !paymentDay) return false;
  const interval = FREQ_MONTHS[frequency] ?? 1;
  if (interval === 0) return false; // One-Time has no recurring monthly due dates

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  let dueYr = start.getFullYear();
  let dueMo = start.getMonth();
  const firstDueDay = actualPayDay(paymentDay, dueYr, dueMo);
  if (new Date(dueYr, dueMo, firstDueDay) < start) {
    dueMo += interval;
    dueYr += Math.floor(dueMo / 12);
    dueMo %= 12;
  }
  const firstTotalMo = dueYr * 12 + dueMo;
  const calTotalMo = calYear * 12 + calMonth;
  const diff = calTotalMo - firstTotalMo;
  return diff >= 0 && diff % interval === 0;
};
