import { useState } from 'react';
import { MoreVertical, Plus, Search, Briefcase } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

/* ─── tiny helpers ─────────────────────────────────────────── */
const EmptyState = ({ message }) => (
  <div className="py-12 text-center text-sm text-gray-400">{message}</div>
);

const TableWrapper = ({ columns, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          {columns.map(c => (
            <th key={c} className="py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

/* ─── sub-tab button ────────────────────────────────────────── */
const SubTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

/* ─── toggle group (Expenses / Recurring expenses) ────────── */
const ToggleGroup = ({ options, active, onChange }) => (
  <div className="flex rounded-md border border-gray-200 overflow-hidden">
    {options.map(opt => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
          active === opt ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

/* ─── Overview tab ──────────────────────────────────────────── */
const OverviewTab = () => {
  const [sub, setSub] = useState('Payments');
  const [expenseMode, setExpenseMode] = useState('Expenses');

  return (
    <div>
      {/* sub-tab row */}
      <div className="flex gap-2 mb-5">
        <SubTab label="Payments" active={sub === 'Payments'} onClick={() => setSub('Payments')} />
        <SubTab label="Expenses" active={sub === 'Expenses'} onClick={() => setSub('Expenses')} />
      </div>

      {sub === 'Payments' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-gray-400" />
              <input placeholder="Search payments…" className="bg-transparent text-sm outline-none flex-1 placeholder-gray-400" />
            </div>
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={14} /> New
            </button>
          </div>
          <TableWrapper columns={['Date', 'Category', 'Notes', 'Amount', '']}>
            <tr>
              <td colSpan={5}><EmptyState message="No data to show" /></td>
            </tr>
          </TableWrapper>
        </div>
      )}

      {sub === 'Expenses' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[160px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Search size={14} className="text-gray-400" />
              <input placeholder="Search expenses…" className="bg-transparent text-sm outline-none flex-1 placeholder-gray-400" />
            </div>
            <ToggleGroup
              options={['Expenses', 'Recurring expenses']}
              active={expenseMode}
              onChange={setExpenseMode}
            />
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={14} /> New
            </button>
          </div>
          <TableWrapper columns={['Date', 'Category', 'Description', 'Status', 'Amount', '']}>
            <tr>
              <td colSpan={6}><EmptyState message="No data to show" /></td>
            </tr>
          </TableWrapper>
        </div>
      )}
    </div>
  );
};

/* ─── Documents tab ─────────────────────────────────────────── */
const DocumentsTab = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
    <EmptyState message="No documents uploaded" />
  </div>
);

/* ─── Reminders tab ─────────────────────────────────────────── */
const RemindersTab = () => {
  const [reminderMode, setReminderMode] = useState('Reminders');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">Reminders</h4>
        <div className="flex items-center gap-2 flex-wrap">
          <ToggleGroup
            options={['Reminders', 'Recurring reminders']}
            active={reminderMode}
            onChange={setReminderMode}
          />
          <div className="flex items-center gap-2 flex-1 min-w-[100px] bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
            <Search size={13} className="text-gray-400" />
            <input placeholder="Filter…" className="bg-transparent text-xs outline-none flex-1 placeholder-gray-400" />
          </div>
          <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors">
            <Plus size={13} /> New
          </button>
        </div>
      </div>
      <EmptyState message="No reminders" />
    </div>
  );
};

/* ─── Other tab ─────────────────────────────────────────────── */
const OtherTab = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <h4 className="text-sm font-semibold text-gray-800">Notes</h4>
      <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors">
        <Plus size={13} /> New
      </button>
    </div>
    <EmptyState message="No notes" />
  </div>
);

/* ─── Main page ─────────────────────────────────────────────── */
const TABS = ['Overview', 'Documents', 'Reminders', 'Other'];

const Organisation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');

  const displayName = user?.name || 'My Organisation';
  const displayCity = user?.city || user?.address || 'No address set';

  return (
    <Layout>
      <main className="flex-1 p-6 overflow-y-auto">

        {/* ── Profile header ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
          <div className="flex items-start justify-between gap-4">
            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Briefcase size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
                <p className="text-sm text-gray-500">{displayCity}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                <MoreVertical size={18} />
              </button>
              <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <Plus size={15} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* ── Top-level tabs ───────────────────────────────── */}
        <div className="flex gap-0 border-b border-gray-200 mb-5">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Tab content ─────────────────────────────────── */}
        {activeTab === 'Overview'             && <OverviewTab />}
        {activeTab === 'Documents'            && <DocumentsTab />}
        {activeTab === 'Reminders'            && <RemindersTab />}
        {activeTab === 'Other'                && <OtherTab />}

      </main>
    </Layout>
  );
};

export default Organisation;
