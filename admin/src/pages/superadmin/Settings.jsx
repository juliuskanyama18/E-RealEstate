import { useState } from 'react';
import { Bell, Clock, Globe, Shield, Info, CheckCircle2 } from 'lucide-react';
import Layout from '../../components/Layout';

/* ── Section wrapper ── */
const Section = ({ title, description, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

/* ── Config row (read-only display) ── */
const ConfigRow = ({ label, value, note, badge }) => (
  <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
    </div>
    <div className="flex-shrink-0 flex items-center gap-2">
      {badge && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
          {badge.label}
        </span>
      )}
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  </div>
);

/* ── Status indicator ── */
const StatusIndicator = ({ label, ok }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <p className="text-sm font-medium text-gray-700">{label}</p>
    <div className={`flex items-center gap-1.5 text-xs font-semibold ${ok ? 'text-green-600' : 'text-red-500'}`}>
      <div className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
      {ok ? 'Operational' : 'Down'}
    </div>
  </div>
);

const Settings = () => {
  const [reminderDays] = useState(3);

  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-gray-50">
        <div className="max-w-[1100px] mx-auto px-6 py-6 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">System configuration and operational status</p>
        </div>

        {/* Info notice */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-700 leading-relaxed">
            These settings reflect the current backend configuration. To change values like SMTP credentials or
            reminder timing, update the corresponding environment variables and restart the server.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Rent reminders */}
          <Section
            title="Rent Reminders"
            description="Automated email notifications sent to tenants before rent is due"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Bell size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Reminder Schedule</p>
                <p className="text-xs text-gray-400">Sent automatically every morning at 09:00</p>
              </div>
            </div>
            <ConfigRow
              label="Days Before Due"
              value={`${reminderDays} days`}
              note="How far in advance tenants are notified"
              badge={{ label: 'Active', color: 'bg-green-100 text-green-700' }}
            />
            <ConfigRow
              label="Schedule"
              value="Daily at 09:00"
              note="Cron: 0 9 * * *"
            />
            <ConfigRow
              label="Timezone"
              value="Africa/Nairobi"
              note="EAT (UTC+3)"
            />
          </Section>

          {/* System status */}
          <Section
            title="System Status"
            description="Current operational status of platform components"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">All Systems Operational</p>
                <p className="text-xs text-gray-400">No incidents reported</p>
              </div>
            </div>
            <StatusIndicator label="API Server"          ok={true} />
            <StatusIndicator label="Database (MongoDB)"  ok={true} />
            <StatusIndicator label="Email (SMTP)"        ok={true} />
            <StatusIndicator label="Rent Reminder Cron"  ok={true} />
          </Section>

          {/* Authentication */}
          <Section
            title="Authentication"
            description="JWT token configuration and role access"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Shield size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">JWT Auth</p>
                <p className="text-xs text-gray-400">Role-based access control</p>
              </div>
            </div>
            <ConfigRow label="Superadmin Token Expiry" value="1 day"   note="Short-lived for security" />
            <ConfigRow label="Landlord Token Expiry"   value="7 days"  note="Standard session duration" />
            <ConfigRow label="Tenant Token Expiry"     value="7 days"  note="Standard session duration" />
            <ConfigRow label="Invite Token Expiry"     value="7 days"  note="Set-password invitation links" />
            <ConfigRow label="Password Reset Expiry"   value="10 min"  note="Forgot-password reset links" />
          </Section>

          {/* Platform config */}
          <Section
            title="Platform Configuration"
            description="General platform identity and settings"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Globe size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Rental Management System</p>
                <p className="text-xs text-gray-400">Tanzania</p>
              </div>
            </div>
            <ConfigRow label="Platform Name"    value="Rental Management" />
            <ConfigRow label="Currency"         value="TZS (Tanzanian Shilling)" note="Used across all billing displays" />
            <ConfigRow label="Default Language" value="English" />
            <ConfigRow
              label="Tenant Self-Register"
              value="Disabled"
              note="Tenants are added by landlords only"
              badge={{ label: 'By Design', color: 'bg-gray-100 text-gray-500' }}
            />
            <ConfigRow
              label="Landlord Self-Register"
              value="Enabled"
              note="Via /register public page"
              badge={{ label: 'Active', color: 'bg-green-100 text-green-700' }}
            />
          </Section>

        </div>

        {/* Rent reminder timing note */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Clock size={18} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">Changing Reminder Timing</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                The rent reminder is currently set to send <strong className="text-gray-700">{reminderDays} days</strong> before
                the tenant's due date. To change this, update the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">targetDay</code> calculation
                in <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono text-gray-700">backend/utils/cronJob.js</code> and restart the server.
              </p>
            </div>
          </div>
        </div>

        </div>
      </main>
    </Layout>
  );
};

export default Settings;
