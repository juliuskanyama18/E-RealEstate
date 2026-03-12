const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const getRentReminderTemplate = (tenant, house) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Rent Reminder</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#2563eb,#1e40af);padding:32px 40px;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Rent Reminder</h1>
    <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px;">Your rent is due in 3 days</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>${tenant.name}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      This is a friendly reminder that your rent is due in <strong>3 days</strong>, on the
      <strong>${ordinal(tenant.rentDueDate)}</strong> of this month.
    </p>
    <table width="100%" style="background:#eff6ff;border-radius:8px;padding:20px;margin-bottom:24px;">
      <tr><td style="padding:8px 0;">
        <span style="color:#6b7280;font-size:13px;display:block;">Property</span>
        <span style="color:#111827;font-size:15px;font-weight:600;">${house.name}</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-top:1px solid #dbeafe;">
        <span style="color:#6b7280;font-size:13px;display:block;">Address</span>
        <span style="color:#111827;font-size:15px;">${house.address}</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-top:1px solid #dbeafe;">
        <span style="color:#6b7280;font-size:13px;display:block;">Rent Amount</span>
        <span style="color:#1d4ed8;font-size:20px;font-weight:700;">KES ${tenant.rentAmount?.toLocaleString()}</span>
      </td></tr>
      ${tenant.balance > 0 ? `
      <tr><td style="padding:8px 0;border-top:1px solid #dbeafe;">
        <span style="color:#6b7280;font-size:13px;display:block;">Outstanding Balance</span>
        <span style="color:#dc2626;font-size:15px;font-weight:600;">KES ${tenant.balance.toLocaleString()}</span>
      </td></tr>` : ""}
    </table>
    <p style="color:#6b7280;font-size:14px;margin:0;">Please ensure payment is made on time. Contact your landlord for any queries.</p>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Automated reminder from RentalSaaS</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`.trim();

export const getTenantWelcomeTemplate = (tenant, house, hasLogin) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Welcome</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#059669,#047857);padding:32px 40px;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Welcome, ${tenant.name}!</h1>
    <p style="color:#a7f3d0;margin:6px 0 0;font-size:14px;">Your rental details are confirmed</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="color:#374151;font-size:15px;margin:0 0 24px;">You have been added as a tenant. Here are your rental details:</p>
    <table width="100%" style="background:#f0fdf4;border-radius:8px;padding:20px;margin-bottom:24px;">
      <tr><td style="padding:8px 0;">
        <span style="color:#6b7280;font-size:13px;display:block;">Property</span>
        <span style="color:#111827;font-size:15px;font-weight:600;">${house.name}</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-top:1px solid #d1fae5;">
        <span style="color:#6b7280;font-size:13px;display:block;">Address</span>
        <span style="color:#111827;font-size:15px;">${house.address}, ${house.city}</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-top:1px solid #d1fae5;">
        <span style="color:#6b7280;font-size:13px;display:block;">Monthly Rent</span>
        <span style="color:#065f46;font-size:20px;font-weight:700;">KES ${tenant.rentAmount?.toLocaleString()}</span>
      </td></tr>
      <tr><td style="padding:8px 0;border-top:1px solid #d1fae5;">
        <span style="color:#6b7280;font-size:13px;display:block;">Due Date</span>
        <span style="color:#111827;font-size:15px;">Day ${tenant.rentDueDate} of each month</span>
      </td></tr>
    </table>
    ${hasLogin ? `<div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:4px;padding:16px;margin-bottom:24px;">
      <p style="color:#1e40af;font-size:14px;margin:0;font-weight:600;">Portal Access Enabled</p>
      <p style="color:#3b82f6;font-size:13px;margin:6px 0 0;">Login with your email and the password provided by your landlord to access your tenant portal.</p>
    </div>` : ""}
    <p style="color:#6b7280;font-size:14px;margin:0;">You will receive automated reminders 3 days before rent is due.</p>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">Automated notification from RentalSaaS</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`.trim();

export const getLandlordWelcomeTemplate = (landlord) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Welcome to RentalSaaS</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:32px 40px;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Welcome to RentalSaaS</h1>
    <p style="color:#ddd6fe;margin:6px 0 0;font-size:14px;">Your landlord account is ready</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="color:#374151;font-size:16px;margin:0 0 16px;">Hi <strong>${landlord.name}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your account has been created successfully. You can now log in to manage your houses and tenants.
    </p>
    <ul style="color:#374151;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
      <li>Add and manage rental houses</li>
      <li>Add tenants with lease details</li>
      <li>Track rent balances</li>
      <li>Automated rent reminders sent to tenants</li>
    </ul>
    <p style="color:#6b7280;font-size:14px;margin:0;">Login with your email: <strong>${landlord.email}</strong></p>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">RentalSaaS — Rental Management Platform</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`.trim();

export const getPasswordResetTemplate = (resetUrl) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Reset Password</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px 40px;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Password Reset</h1>
    <p style="color:#fca5a5;margin:6px 0 0;font-size:14px;">Link expires in 10 minutes</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="color:#374151;font-size:15px;margin:0 0 24px;">Click the button below to reset your password:</p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;">Reset Password</a>
    </div>
    <p style="color:#9ca3af;font-size:13px;margin:0;">If you did not request this, ignore this email. Your password will not change.</p>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">RentalSaaS — Rental Management Platform</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`.trim();
