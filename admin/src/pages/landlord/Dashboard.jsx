import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Home, Users, Building2, Calendar,
  Clock, FileText, Bell, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

/* ── Mini Calendar ─────────────────────────────────────────── */
const MiniCalendar = () => {
  const today = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = current.getFullYear();
  const month = current.getMonth();
  const monthName = current.toLocaleString('default', { month: 'long' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const all = [...blanks, ...days];

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-900">{monthName} {year}</span>
        <div className="flex gap-1">
          <button onClick={prev} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"><ChevronLeft size={14} /></button>
          <button onClick={next} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
          <div key={d} className="text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {all.map((d, i) => (
          <div key={i} className={`text-xs py-1 rounded-full w-7 h-7 flex items-center justify-center mx-auto cursor-default
            ${d === null ? '' : isToday(d)
              ? 'bg-blue-600 text-white font-bold'
              : 'text-gray-600 hover:bg-gray-100'}`}>
            {d || ''}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Date Chip (outlined, like photo) ──────────────────────── */
const DateChip = ({ value, onChange }) => {
  const formatted = value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div className="relative">
      <div className="border border-gray-300 rounded px-3 py-1 text-xs text-gray-600 bg-white whitespace-nowrap cursor-pointer hover:border-gray-400 transition-colors select-none">
        {formatted}
      </div>
      <input
        type="date"
        value={value.toISOString().split('T')[0]}
        onChange={(e) => { if (e.target.value) onChange(new Date(e.target.value + 'T12:00:00')); }}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
      />
    </div>
  );
};

/* ── Cashflow Chart ────────────────────────────────────────── */
const CF_W        = 560;
const CF_H        = 230;
const CF_BAR_AREA = 185;
const CF_BASELINE = 123;
const CF_BAR_SLOT = CF_W / 12;
const CF_BAR_W    = 27;
const CF_BAR_X0   = (CF_BAR_SLOT - CF_BAR_W) / 2;
const CF_MONTHS_L = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const CF_GRID_Y   = Array.from({ length: 13 }, (_, i) => Math.round((CF_BAR_AREA / 12) * i));

const CashflowChart = ({ income, expenses }) => {
  const yr = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0–11
  const [fromDate, setFromDate] = useState(new Date(yr, 0, 1));
  const [toDate,   setToDate]   = useState(new Date(yr, 11, 31));
  const net = income - expenses;

  // Scale: top of bar area = chartMax TZS. Give some headroom above the bar.
  const chartMax = Math.max(income, expenses, 1) * 1.4;
  const toBarH = (val, maxH) =>
    val > 0 ? Math.max(Math.round((val / chartMax) * maxH), 4) : 0;

  // Only current month has real data; all other months are 0 (no history yet)
  const incBars = Array.from({ length: 12 }, (_, i) =>
    i === currentMonth ? toBarH(income, CF_BASELINE) : 0
  );
  const expBars = Array.from({ length: 12 }, (_, i) =>
    i === currentMonth ? toBarH(expenses, CF_H - CF_BASELINE - 30) : 0
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">Cashflow</p>
        <div className="flex items-center gap-2">
          <DateChip value={fromDate} onChange={setFromDate} />
          <DateChip value={toDate}   onChange={setToDate}   />
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex items-start gap-8 mb-3">
        {[
          { label: 'INCOME',   value: income,   color: 'bg-blue-500' },
          { label: 'EXPENSES', value: expenses, color: 'bg-blue-200' },
          { label: 'NET',      value: net,      color: 'bg-slate-700' },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <p className="text-base font-bold text-gray-900">TZS {value.toLocaleString()}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
              <span className="text-[10px] font-semibold text-gray-400 tracking-widest">{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${CF_W} ${CF_H}`}
        className="w-full"
        style={{ height: 195, display: 'block' }}
        role="application"
        aria-label="Cashflow chart"
      >
        <rect width={CF_W} height={CF_H} fill="transparent" />

        {/* Grid lines */}
        {CF_GRID_Y.map((y, i) => (
          <line key={i} x1={0} x2={CF_W} y1={y} y2={y} stroke="#F5F6F8" strokeWidth={1} />
        ))}

        {/* Income bars — grow upward from baseline */}
        {incBars.map((h, i) => (
          <g key={i} transform={`translate(${CF_BAR_X0 + i * CF_BAR_SLOT}, ${CF_BASELINE - h})`}>
            <rect
              width={CF_BAR_W} height={h} rx={0} strokeWidth={0}
              fill={i === currentMonth && h > 0 ? '#3B82F6' : '#eeeeee'}
            />
          </g>
        ))}

        {/* Expense bars — grow downward from baseline */}
        {expBars.map((h, i) => (
          <g key={i} transform={`translate(${CF_BAR_X0 + i * CF_BAR_SLOT}, ${CF_BASELINE})`}>
            <rect
              width={CF_BAR_W} height={h} rx={0} strokeWidth={0}
              fill={i === currentMonth && h > 0 ? '#93C5FD' : '#f5f5f5'}
            />
          </g>
        ))}

        {/* Month labels */}
        <g transform={`translate(0, ${CF_BAR_AREA + 10})`}>
          {CF_MONTHS_L.map((m, i) => (
            <g key={m} transform={`translate(${i * CF_BAR_SLOT + CF_BAR_SLOT / 2}, 0)`}>
              <line x1={0} x2={0} y1={0} y2={4} stroke="rgb(119,119,119)" strokeWidth={1} />
              <text
                dominantBaseline="text-before-edge"
                textAnchor="middle"
                y={7}
                style={{
                  fontFamily: 'sans-serif',
                  fontSize: '11px',
                  fill: i === currentMonth ? '#3B82F6' : 'rgb(134,156,189)',
                  fontWeight: i === currentMonth ? 'bold' : 'normal',
                }}
              >
                {m}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

/* ── House Icon (Rent Received) ────────────────────────────── */
const HouseIcon = ({ size = 18, className = '' }) => (
  <svg className={className} focusable="false" aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h6v-6h2v6h6v-8h3zM17 18h-2v-6H9v6H7v-7.81l5-4.5 5 4.5z"/>
    <path d="M10 10h4c0-1.1-.9-2-2-2s-2 .9-2 2"/>
  </svg>
);

/* ── Alarm Clock Icon (Rent Overdue) ───────────────────────── */
const AlarmClockIcon = ({ size = 18, className = '' }) => (
  <svg className={className} focusable="false" aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="m22 5.7-4.6-3.9-1.3 1.5 4.6 3.9zM7.9 3.4 6.6 1.9 2 5.7l1.3 1.5zM12.5 8H11v6l4.7 2.9.8-1.2-4-2.4zM12 4c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9m0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7"/>
  </svg>
);

/* ── Payment Tile ──────────────────────────────────────────── */
const PaymentTile = ({ title, amount, icon: Icon, iconBg, iconColor, sub }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
    <span className="text-sm font-semibold text-gray-700">{title}</span>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-xl font-bold text-gray-900">TZS {amount.toLocaleString()}</p>
    </div>
    <p className="text-xs text-gray-400">{sub}</p>
  </div>
);

/* ── Stat Pill ─────────────────────────────────────────────── */
const StatPill = ({ label, value, color }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

/* ── Dashboard ─────────────────────────────────────────────── */
const LandlordDashboard = () => {
  const { user } = useAuth();
  const [houses, setHouses] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [housesRes, tenantsRes] = await Promise.all([
          axios.get(`${backendUrl}${API.houses}`),
          axios.get(`${backendUrl}${API.tenants}`),
        ]);
        setHouses(housesRes.data.data || []);
        setTenants(tenantsRes.data.data || []);
      } catch {
        // handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derived metrics
  const today = new Date().getDate();
  const totalProperties = houses.length;
  const vacantHouses = houses.filter((h) => !h.isOccupied).length;
  const occupiedHouses = houses.filter((h) => h.isOccupied).length;
  const totalTenants = tenants.length;
  const occupancyRate = totalProperties ? Math.round((occupiedHouses / totalProperties) * 100) : 0;

  const paidTenants = tenants.filter((t) => (t.balance || 0) >= 0);
  const overdueTenants = tenants.filter((t) => (t.balance || 0) < 0);
  const upcomingTenants = tenants.filter((t) => {
    const due = t.rentDueDate;
    if (!due) return false;
    const diff = due - today;
    return diff >= 0 && diff <= 7;
  });

  const rentReceived = paidTenants.reduce((s, t) => s + (t.rentAmount || 0), 0);
  const upcomingAmount = upcomingTenants.reduce((s, t) => s + (t.rentAmount || 0), 0);
  const overdueAmount = overdueTenants.reduce((s, t) => s + Math.abs(t.balance || 0), 0);
  const totalMonthlyRent = tenants.reduce((s, t) => s + (t.rentAmount || 0), 0);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <Layout>
      <main className="flex-1 p-6 space-y-5">

        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hello {firstName},</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Row 1: Payment analytics tiles ─────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PaymentTile
                title="Rent Received"
                amount={rentReceived}
                icon={HouseIcon}
                iconBg="bg-green-100"
                iconColor="text-green-600"
                sub={`${paidTenants.length} tenant${paidTenants.length !== 1 ? 's' : ''} paid this month`}
              />
              <PaymentTile
                title="Upcoming Payments"
                amount={upcomingAmount}
                icon={Calendar}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                sub={`${upcomingTenants.length} payment${upcomingTenants.length !== 1 ? 's' : ''} due within 7 days`}
              />
              <PaymentTile
                title="Rent Overdue"
                amount={overdueAmount}
                icon={AlarmClockIcon}
                iconBg="bg-red-100"
                iconColor="text-red-500"
                sub={`${overdueTenants.length} tenant${overdueTenants.length !== 1 ? 's' : ''} overdue`}
              />
            </div>

            {/* ── Row 2: Main + Sidebar ───────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* Left (3/5) */}
              <div className="lg:col-span-3 space-y-4">

                {/* Cashflow chart */}
                <CashflowChart income={rentReceived} expenses={0} />

                {/* Properties & Tenants */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-700">Properties</p>
                    <Link to="/houses" className="text-xs text-blue-600 hover:underline">View all</Link>
                  </div>
                  <StatPill label="Total Properties" value={totalProperties} color="bg-blue-500" />
                  <StatPill label="Total Tenants" value={totalTenants} color="bg-green-500" />
                  <StatPill label="Occupied Houses" value={occupiedHouses} color="bg-purple-500" />
                  <StatPill label="Vacant Houses" value={vacantHouses} color="bg-orange-400" />
                  <div className="mt-4 pt-3 border-t border-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>Occupancy rate</span>
                      <span className="font-semibold text-gray-900">{occupancyRate}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all duration-500"
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right (2/5) */}
              <div className="lg:col-span-2 space-y-4">

                {/* Mini Calendar */}
                <MiniCalendar />

                {/* Reminders */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">Reminders</p>
                    <button className="text-xs text-blue-600 hover:underline">Add</button>
                  </div>
                  {overdueTenants.length === 0 && upcomingTenants.length === 0 ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <Bell size={28} className="text-gray-200 mb-2" />
                      <p className="text-xs text-gray-400">No reminders yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {overdueTenants.slice(0, 3).map((t) => (
                        <div key={t._id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50">
                          <Clock size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-red-700 truncate">{t.name}</p>
                            <p className="text-[10px] text-red-400">Rent overdue · TZS {Math.abs(t.balance || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                      {upcomingTenants.slice(0, 3).map((t) => (
                        <div key={t._id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50">
                          <Calendar size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-blue-700 truncate">{t.name}</p>
                            <p className="text-[10px] text-blue-400">Due day {t.rentDueDate} · TZS {(t.rentAmount || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Row 3: Documents ────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Documents</p>
                <button className="text-xs text-blue-600 hover:underline">Upload</button>
              </div>
              <div className="flex flex-col items-center py-6 text-center">
                <FileText size={32} className="text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No documents uploaded yet.</p>
                <p className="text-xs text-gray-300 mt-1">Lease agreements, inspection reports, and more.</p>
              </div>
            </div>
          </>
        )}
      </main>
    </Layout>
  );
};

export default LandlordDashboard;
