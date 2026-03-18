const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// daysBeforeDue — how many days before due date the reminder is sent (from landlord.notifyDaysBefore)
export const getRentReminderTemplate = (tenant, house, daysBeforeDue = 3) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Rent Reminder</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#2563eb,#1e40af);padding:32px 40px;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Rent Reminder</h1>
    <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px;">Your rent is due in ${daysBeforeDue} day${daysBeforeDue !== 1 ? 's' : ''}</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>${tenant.name}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      This is a friendly reminder that your rent is due in <strong>${daysBeforeDue} day${daysBeforeDue !== 1 ? 's' : ''}</strong>, on the
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
        <span style="color:#1d4ed8;font-size:20px;font-weight:700;">TZS ${tenant.rentAmount?.toLocaleString()}</span>
      </td></tr>
      ${tenant.balance > 0 ? `
      <tr><td style="padding:8px 0;border-top:1px solid #dbeafe;">
        <span style="color:#6b7280;font-size:13px;display:block;">Outstanding Balance</span>
        <span style="color:#dc2626;font-size:15px;font-weight:600;">TZS ${tenant.balance.toLocaleString()}</span>
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

// notifyDaysBefore — from landlord.notifyDaysBefore, shown in welcome message
export const getTenantWelcomeTemplate = (tenant, house, hasLogin, notifyDaysBefore = 3) => `
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
        <span style="color:#065f46;font-size:20px;font-weight:700;">TZS ${tenant.rentAmount?.toLocaleString()}</span>
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
    <p style="color:#6b7280;font-size:14px;margin:0;">You will receive automated reminders ${notifyDaysBefore} day${notifyDaysBefore !== 1 ? 's' : ''} before rent is due.</p>
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

export const getTenantInviteTemplate = (tenant, house, setPasswordUrl) => `
<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Welcome to Your Tenant Portal</title></head>
<body style="margin:0;padding:0;background-color:#eeeeee;font-family:'Open Sans',Arial,sans-serif;">
<div style="background:transparent;max-width:600px;margin:0 auto;padding:28px 32px 16px;">
  <span style="font-size:17px;font-weight:800;color:#042238;">Rental Management System</span>
</div>
<div style="max-width:600px;margin:0 auto;">
  <div style="background:linear-gradient(135deg,#033a6d 0%,#042238 100%);padding:36px 40px;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,0.12);border-radius:50%;padding:18px;margin-bottom:12px;">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill="rgba(255,255,255,0.2)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 21V12h6v9" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/></svg>
    </div>
    <p style="color:#7ea8c4;font-size:13px;margin:0;letter-spacing:0.04em;">RENTAL MANAGEMENT SYSTEM</p>
  </div>
</div>
<div style="background:#fefefe;max-width:600px;margin:0 auto;border-radius:0 0 4px 4px;padding:32px 32px 0;">
  <div style="max-width:536px;margin:0 auto;">
    <p style="font-size:16px;font-family:'Open Sans',Arial,sans-serif;font-weight:700;text-transform:uppercase;color:#033a6d;line-height:150%;letter-spacing:0.04px;margin:0 0 6px;">WELCOME HOME 🏡</p>
    <h1 style="font-size:24px;font-family:'Open Sans',Arial,sans-serif;font-weight:600;color:#042238;line-height:142%;margin:0 0 16px;">Explore your Tenant Portal today</h1>
    <p style="font-size:16px;font-family:'Open Sans',Arial,sans-serif;color:#042238;line-height:150%;margin:0 0 12px;">Hi ${tenant.name},</p>
    <p style="font-size:16px;font-family:'Open Sans',Arial,sans-serif;color:#042238;line-height:150%;margin:0 0 4px;">Set up only takes a few minutes and is required by your landlord at your new home — <strong>${house.name}</strong>.</p>
    <div style="height:16px;"></div>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" style="padding-bottom:20px;">
      <table width="236" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:100%;"><tr><td align="center" bgcolor="#033a6d" style="border-radius:60px;padding:13px 0;">
        <a href="${setPasswordUrl}" style="display:inline-block;width:236px;background-color:#033a6d;color:#ffffff;font-family:'Open Sans',Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;text-decoration:none;letter-spacing:0.04px;">GO TO MY TENANT PORTAL</a>
      </td></tr></table>
    </td></tr></table>
    <p style="font-size:16px;font-family:'Open Sans',Arial,sans-serif;color:#042238;line-height:150%;margin:0 0 12px;">It only takes 3 simple steps:</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:8px;">
      <tr><td width="32" valign="top" style="padding-right:10px;padding-bottom:14px;"><div style="width:24px;height:24px;background:#033a6d;border-radius:50%;text-align:center;line-height:24px;"><span style="color:#fff;font-size:13px;font-weight:700;font-family:'Open Sans',Arial,sans-serif;">1</span></div></td>
      <td style="padding-bottom:14px;"><p style="font-size:16px;font-family:'Open Sans',Arial,sans-serif;color:#042238;line-height:150%;margin:0;"><strong>Set your password.</strong> This is what you'll use to login on any device, so make sure it's secure (and one you'll remember).</p></td></tr>
      <tr><td width="32" valign="top" style="padding-right:10px;padding-bottom:14px;"><div style="width:24px;height:24px;background:#033a6d;border-radius:50%;text-align:center;line-height:24px;"><span style="color:#fff;font-size:13px;font-weight:700;font-family:'Open Sans',Arial,sans-serif;">2</span></div></td>
      <td style="padding-bottom:14px;"><p style="font-size:16px;font-family:'Open Sans',Arial,sans-serif;color:#042238;line-height:150%;margin:0;"><strong>Sign in to your account.</strong> Access your tenant portal from any device, at any time.</p></td></tr>
      <tr><td width="32" valign="top" style="padding-right:10px;"><div style="width:24px;height:24px;background:#033a6d;border-radius:50%;text-align:center;line-height:24px;"><span style="color:#fff;font-size:13px;font-weight:700;font-family:'Open Sans',Arial,sans-serif;">3</span></div></td>
      <td><p style="font-size:16px;font-family:'Open Sans',Arial,sans-serif;color:#042238;line-height:150%;margin:0;"><strong>Explore your dashboard.</strong> View rent status, payment history, and submit maintenance requests — all in one place.</p></td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td align="center" style="padding:20px 0 32px;">
      <table width="236" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:100%;"><tr><td align="center" bgcolor="#033a6d" style="border-radius:60px;padding:13px 0;">
        <a href="${setPasswordUrl}" style="display:inline-block;width:236px;background-color:#033a6d;color:#ffffff;font-family:'Open Sans',Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;text-decoration:none;letter-spacing:0.04px;">GO TO MY TENANT PORTAL</a>
      </td></tr></table>
    </td></tr></table>
  </div>
</div>
<div style="background:#fefefe;max-width:600px;margin:0 auto;border-radius:4px;padding:0 32px 32px;">
  <div style="max-width:536px;margin:0 auto;border-top:1px solid #acb9c8;padding-top:16px;text-align:center;">
    <p style="font-size:14px;font-family:'Open Sans',Arial,sans-serif;font-style:italic;color:#042238;line-height:150%;margin:0 0 10px;">Your landlord uses this Rental Management System to manage their rental property. You'll receive notifications from them through this platform.</p>
    <p style="font-size:13px;font-family:'Open Sans',Arial,sans-serif;color:#8a9ab0;margin:0;">Rental Management System &copy; ${new Date().getFullYear()}</p>
  </div>
</div>
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

/* ── Admin-initiated password reset (sends a secure reset link on behalf of admin) ── */
export const getAdminPasswordResetTemplate = (user, resetUrl) => `
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Password Reset</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  <tr><td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:32px 40px;">
    <h1 style="color:#fff;margin:0;font-size:24px;">Password Reset Required</h1>
    <p style="color:#ddd6fe;margin:6px 0 0;font-size:14px;">Action requested by platform administrator · Link expires in 60 minutes</p>
  </td></tr>
  <tr><td style="padding:32px 40px;">
    <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hi <strong>${user.name}</strong>,</p>
    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      A platform administrator has initiated a password reset for your account.
      Please click the button below to set a new password.
    </p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${resetUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:600;">Set New Password</a>
    </div>
    <table width="100%" style="background:#faf5ff;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #e9d5ff;">
      <tr><td>
        <p style="color:#6d28d9;font-size:13px;margin:0;font-weight:600;">Security Notice</p>
        <p style="color:#7c3aed;font-size:13px;margin:6px 0 0;">
          If you did not expect this, contact your platform administrator immediately.
          Do not share this link with anyone.
        </p>
      </td></tr>
    </table>
    <p style="color:#9ca3af;font-size:13px;margin:0;">Account: <strong>${user.email}</strong></p>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
    <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;">RentalSaaS — Rental Management Platform</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`.trim();
