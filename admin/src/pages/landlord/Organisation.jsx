import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, Upload } from 'lucide-react';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

/* ── Shared helpers ─────────────────────────────────────────── */
const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 outline-none ' +
  'focus:border-[#042238] focus:ring-1 focus:ring-[#04223820] transition-colors bg-white placeholder-gray-400';

const FormField = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
      {label}
    </label>
    {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
    {children}
  </div>
);

const SectionTitle = ({ title, description }) => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
    {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
  </div>
);

const SaveButton = ({ saving, onClick }) => (
  <div className="flex justify-end pt-4 border-t border-gray-100 mt-6">
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 bg-[#042238] hover:bg-[#063055] disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
    >
      {saving ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving…
        </>
      ) : 'Save Changes'}
    </button>
  </div>
);

/* ── Tab: Profile ───────────────────────────────────────────── */
const ProfileTab = ({ data, onSave }) => {
  const [form,   setForm]   = useState({
    businessName: data.businessName || '',
    phone:        data.phone        || '',
    address:      data.address      || '',
    city:         data.city         || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      businessName: data.businessName || '',
      phone:        data.phone        || '',
      address:      data.address      || '',
      city:         data.city         || '',
    });
  }, [data]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${backendUrl}${API.org}`, form);
      onSave(res.data.data);
      toast.success('Profile saved');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <SectionTitle
        title="Business Profile"
        description="Your business identity shown on tenant emails, payment receipts, and lease documents."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Business / Company Name" hint="Leave blank to use your account name">
          <input
            className={inputCls}
            value={form.businessName}
            onChange={set('businessName')}
            placeholder="e.g. Juma Properties Ltd"
          />
        </FormField>
        <FormField label="Contact Phone">
          <input
            className={inputCls}
            value={form.phone}
            onChange={set('phone')}
            placeholder="+255 712 000 000"
          />
        </FormField>
        <FormField label="Business Address">
          <input
            className={inputCls}
            value={form.address}
            onChange={set('address')}
            placeholder="Street address"
          />
        </FormField>
        <FormField label="City">
          <input
            className={inputCls}
            value={form.city}
            onChange={set('city')}
            placeholder="Dar es Salaam"
          />
        </FormField>
      </div>
      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
};

/* ── Tab: Payment Settings ──────────────────────────────────── */
const PaymentSettingsTab = ({ data, onSave }) => {
  const [form,   setForm]   = useState({
    defaultRentDueDate: data.defaultRentDueDate ?? '',
    gracePeriodDays:    data.gracePeriodDays    ?? 0,
    lateFeeType:        data.lateFeeType        || 'flat',
    lateFeeAmount:      data.lateFeeAmount      ?? 0,
    bankName:           data.bankName           || '',
    bankAccountNumber:  data.bankAccountNumber  || '',
    bankAccountName:    data.bankAccountName    || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      defaultRentDueDate: data.defaultRentDueDate ?? '',
      gracePeriodDays:    data.gracePeriodDays    ?? 0,
      lateFeeType:        data.lateFeeType        || 'flat',
      lateFeeAmount:      data.lateFeeAmount      ?? 0,
      bankName:           data.bankName           || '',
      bankAccountNumber:  data.bankAccountNumber  || '',
      bankAccountName:    data.bankAccountName    || '',
    });
  }, [data]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${backendUrl}${API.org}`, {
        ...form,
        defaultRentDueDate: form.defaultRentDueDate === '' ? undefined : Number(form.defaultRentDueDate),
        gracePeriodDays:    Number(form.gracePeriodDays),
        lateFeeAmount:      Number(form.lateFeeAmount),
      });
      onSave(res.data.data);
      toast.success('Payment settings saved');
    } catch {
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Rent Configuration */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <SectionTitle
          title="Rent Configuration"
          description="Default values applied when adding new tenants. Can be overridden per tenant."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Default Rent Due Date"
            hint="Day of the month rent is due (1–31)"
          >
            <input
              type="number" min={1} max={31}
              className={inputCls}
              value={form.defaultRentDueDate}
              onChange={set('defaultRentDueDate')}
              placeholder="e.g. 1"
            />
          </FormField>
          <FormField
            label="Grace Period (days)"
            hint="Days after due date before rent is marked overdue"
          >
            <input
              type="number" min={0}
              className={inputCls}
              value={form.gracePeriodDays}
              onChange={set('gracePeriodDays')}
              placeholder="0"
            />
          </FormField>
        </div>
      </div>

      {/* Late Fee */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <SectionTitle
          title="Late Fee"
          description="Charged automatically when a tenant's rent becomes overdue."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Late Fee Type">
            <div className="flex gap-3 mt-1">
              {[
                { value: 'flat',       label: 'Flat Amount (TZS)' },
                { value: 'percentage', label: 'Percentage (%)' },
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="lateFeeType"
                    value={value}
                    checked={form.lateFeeType === value}
                    onChange={set('lateFeeType')}
                    className="accent-[#042238]"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </FormField>
          <FormField label={form.lateFeeType === 'percentage' ? 'Late Fee (%)' : 'Late Fee Amount (TZS)'}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">
                {form.lateFeeType === 'percentage' ? '%' : 'TZS'}
              </span>
              <input
                type="number" min={0}
                className={`${inputCls} pl-12`}
                value={form.lateFeeAmount}
                onChange={set('lateFeeAmount')}
                placeholder="0"
              />
            </div>
          </FormField>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <SectionTitle
          title="Bank Details"
          description="Shown to tenants on payment receipts and charge notifications so they know where to pay."
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Bank Name">
            <input
              className={inputCls}
              value={form.bankName}
              onChange={set('bankName')}
              placeholder="e.g. CRDB Bank"
            />
          </FormField>
          <FormField label="Account Number">
            <input
              className={inputCls}
              value={form.bankAccountNumber}
              onChange={set('bankAccountNumber')}
              placeholder="0150123456789"
            />
          </FormField>
          <FormField label="Account Name">
            <input
              className={inputCls}
              value={form.bankAccountName}
              onChange={set('bankAccountName')}
              placeholder="Juma Properties Ltd"
            />
          </FormField>
        </div>
        <SaveButton saving={saving} onClick={handleSave} />
      </div>
    </div>
  );
};

/* ── Tab: Notifications ─────────────────────────────────────── */
const NotificationsTab = ({ data, onSave }) => {
  const [form,   setForm]   = useState({
    notifyDaysBefore:  data.notifyDaysBefore  ?? 3,
    notifyOverdue:     data.notifyOverdue     ?? true,
    notificationEmail: data.notificationEmail || data.email || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      notifyDaysBefore:  data.notifyDaysBefore  ?? 3,
      notifyOverdue:     data.notifyOverdue     ?? true,
      notificationEmail: data.notificationEmail || data.email || '',
    });
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`${backendUrl}${API.org}`, {
        notifyDaysBefore:  Number(form.notifyDaysBefore),
        notifyOverdue:     form.notifyOverdue,
        notificationEmail: form.notificationEmail,
      });
      onSave(res.data.data);
      toast.success('Notification settings saved');
    } catch {
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <SectionTitle
        title="Notification Preferences"
        description="Control when the system sends automated email reminders to tenants."
      />
      <div className="space-y-5">

        <FormField
          label="Reminder days before due date"
          hint="How many days before rent is due to send the first reminder email to tenants"
        >
          <div className="flex items-center gap-3">
            <input
              type="number" min={0} max={30}
              className={`${inputCls} max-w-[120px]`}
              value={form.notifyDaysBefore}
              onChange={(e) => setForm((f) => ({ ...f, notifyDaysBefore: e.target.value }))}
            />
            <span className="text-sm text-gray-500">day{form.notifyDaysBefore !== 1 ? 's' : ''} before due date</span>
          </div>
        </FormField>

        <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-800">Overdue alerts</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Send an email alert when a tenant's rent becomes overdue (after the grace period)
            </p>
          </div>
          <button
            onClick={() => setForm((f) => ({ ...f, notifyOverdue: !f.notifyOverdue }))}
            className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ml-4 mt-0.5 ${
              form.notifyOverdue ? 'bg-[#042238]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.notifyOverdue ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <FormField
          label="Notification email"
          hint="Copies of all tenant reminder emails are also sent here. Defaults to your account email."
        >
          <input
            type="email"
            className={inputCls}
            value={form.notificationEmail}
            onChange={(e) => setForm((f) => ({ ...f, notificationEmail: e.target.value }))}
            placeholder="notifications@example.com"
          />
        </FormField>
      </div>
      <SaveButton saving={saving} onClick={handleSave} />
    </div>
  );
};

/* ── Tab: Documents ─────────────────────────────────────────── */
const DocumentsTab = () => (
  <div className="space-y-5">
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <SectionTitle
        title="Lease Templates"
        description="Upload default lease agreement templates. These can be sent to new tenants when they are added."
      />

      {/* Upload zone */}
      <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-xl p-10 cursor-pointer hover:border-[#042238] hover:bg-[#04223808] transition-colors group">
        <div className="w-12 h-12 rounded-full bg-[#04223810] flex items-center justify-center group-hover:bg-[#04223820] transition-colors">
          <Upload size={22} className="text-[#042238]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Click to upload a document</p>
          <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX up to 10 MB</p>
        </div>
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" />
      </label>
    </div>

    {/* Documents list */}
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex flex-col items-center py-8 text-center">
        <FileText size={36} className="text-gray-200 mb-3" />
        <p className="text-sm font-medium text-gray-500">No documents uploaded yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Lease agreements, addendums, and inspection reports will appear here.
        </p>
      </div>
    </div>
  </div>
);

/* ── Main page ──────────────────────────────────────────────── */
const TABS = ['Profile', 'Payment Settings', 'Notifications', 'Documents'];

const Organisation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const [orgData,   setOrgData]   = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    axios.get(`${backendUrl}${API.org}`)
      .then((res) => setOrgData(res.data.data))
      .catch(() => toast.error('Could not load organisation settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (updated) => setOrgData(updated);

  // Derive display info from fetched data or auth user
  const displayName = orgData?.businessName || orgData?.name || user?.name || 'My Organisation';
  const initials    = displayName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const location    = [orgData?.address, orgData?.city].filter(Boolean).join(', ') || 'No address set';

  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-[#f5f6f8]">
        <div className="max-w-[1100px] mx-auto px-6 py-7">

          {/* ── Profile header card ──────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#042238] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">{initials}</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{displayName}</h2>
                <p className="text-sm text-gray-400">{location}</p>
              </div>
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────── */}
          <div className="flex gap-0 border-b border-gray-200 mb-6">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#042238] text-[#042238]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tab content ──────────────────────────────────── */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#042238] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'Profile'          && <ProfileTab          data={orgData || {}} onSave={handleSave} />}
              {activeTab === 'Payment Settings' && <PaymentSettingsTab  data={orgData || {}} onSave={handleSave} />}
              {activeTab === 'Notifications'    && <NotificationsTab    data={orgData || {}} onSave={handleSave} />}
              {activeTab === 'Documents'        && <DocumentsTab />}
            </>
          )}
        </div>
      </main>
    </Layout>
  );
};

export default Organisation;
