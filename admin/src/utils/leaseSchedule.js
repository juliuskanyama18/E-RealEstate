// Shared lease payment-schedule math — used anywhere a "when is rent due"
// question is asked (Dashboard calendar, House Detail rent overview / payment
// periods). Keeping this in one place avoids re-deriving (and drifting from)
// the frequency-aware due-date logic per screen.

/* Frequency → interval in months. 0 = One-Time (no recurring due dates). */
export const FREQ_MONTHS = {
  'One-Time': 0, '1 Month': 1, '2 Months': 2, '3 Months': 3,
  '4 Months': 4, '5 Months': 5, '6 Months': 6, '9 Months': 9,
  '18 Months': 18, '24 Months': 24, '1 Year': 12,
};

/* Actual calendar day for paymentDay in a given year/month. paymentDay 31 = last day of month. */
export const actualPayDay = (paymentDay, yr, mo) => {
  if (paymentDay === 31) return new Date(yr, mo + 1, 0).getDate();
  return Math.min(paymentDay, new Date(yr, mo + 1, 0).getDate());
};

/* Is calYear/calMonth an installment-due month for this lease, given its frequency? */
export const isDueMonth = (lease, calYear, calMonth) => {
  if (!lease?.startDate || !lease?.paymentDay) return false;
  const interval = FREQ_MONTHS[lease.frequency] ?? 1;
  if (interval === 0) return false; // One-Time has no recurring monthly due dates

  const start = new Date(lease.startDate);
  start.setHours(0, 0, 0, 0);

  let dueYr = start.getFullYear();
  let dueMo = start.getMonth();
  const firstDueDay = actualPayDay(lease.paymentDay, dueYr, dueMo);
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

/* Next installment due date on/after `fromDate` (defaults to today), respecting lease end date. */
export const getNextDueDate = (lease, fromDate = new Date()) => {
  if (!lease?.startDate || !lease?.paymentDay) return null;
  const end = lease.endDate ? new Date(lease.endDate) : null;
  let yr = fromDate.getFullYear();
  let mo = fromDate.getMonth();
  for (let i = 0; i < 600; i++) { // 50 years of monthly steps is a generous ceiling
    if (isDueMonth(lease, yr, mo)) {
      const day = actualPayDay(lease.paymentDay, yr, mo);
      const due = new Date(yr, mo, day);
      if (due >= new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())) {
        if (end && due > end) return null;
        return due;
      }
    }
    mo += 1;
    if (mo > 11) { mo = 0; yr += 1; }
  }
  return null;
};
