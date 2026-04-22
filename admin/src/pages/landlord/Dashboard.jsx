import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Building2, Calendar, FileText, Bell,
  ChevronLeft, ChevronRight, UserPlus, CreditCard, Wrench,
} from 'lucide-react';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

/* ── Mini Calendar ─────────────────────────────────────────── */
const MiniCalendar = ({ current, onPrev, onNext, rentDueDays = new Set(), leaseExpiryDays = new Set(), selectedDate = null, onSelectDate }) => {
  const today = new Date();
  const year      = current.getFullYear();
  const month     = current.getMonth();
  const monthName = current.toLocaleString('default', { month: 'long' });

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const all = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const isToday    = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) => d === selectedDate;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-900">{monthName} {year}</span>
        <div className="flex gap-1">
          <button onClick={onPrev} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"><ChevronLeft size={14} /></button>
          <button onClick={onNext} className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"><ChevronRight size={14} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
          <div key={d} className="text-[10px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {all.map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <button
              onClick={() => d && onSelectDate && onSelectDate(isSelected(d) ? null : d)}
              disabled={!d}
              className={`text-xs rounded-full w-7 h-7 flex items-center justify-center transition-colors
                ${!d ? 'cursor-default' :
                  isSelected(d)
                    ? 'bg-blue-500 text-white font-bold cursor-pointer'
                    : isToday(d)
                    ? 'bg-blue-600 text-white font-bold cursor-pointer'
                    : 'text-gray-600 hover:bg-gray-100 cursor-pointer'}`}
            >
              {d || ''}
            </button>
            <div className="h-2 flex gap-0.5 items-center mt-0.5">
              {d !== null && rentDueDays.has(d) && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              )}
              {d !== null && leaseExpiryDays.has(d) && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Frequency → interval in months ────────────────────────── */
const FREQ_MONTHS = {
  'One-Time': 0, '1 Month': 1, '2 Months': 2, '3 Months': 3,
  '4 Months': 4, '5 Months': 5, '6 Months': 6,
  '18 Months': 18, '24 Months': 24, '1 Year': 12,
};

/* Returns the actual calendar day for paymentDay in given year/month.
   paymentDay 31 = last day of month. */
const actualPayDay = (paymentDay, yr, mo) => {
  if (paymentDay === 31) return new Date(yr, mo + 1, 0).getDate();
  return Math.min(paymentDay, new Date(yr, mo + 1, 0).getDate());
};

/* ── Build calendar events from lease data ──────────────────── */
const buildEvents = (leases, calYear, calMonth) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events = [];

  leases.forEach((lease) => {
    if (!lease.house || !lease.startDate || !lease.paymentDay) return;
    const houseName = [lease.house.name, lease.house.city].filter(Boolean).join(' ');
    const houseId   = lease.house._id;
    const start     = new Date(lease.startDate);
    start.setHours(0, 0, 0, 0); // normalize UTC string to local midnight
    const end       = lease.endDate ? new Date(lease.endDate) : null;
    if (end) end.setHours(23, 59, 59, 999); // inclusive end-of-day
    const interval  = FREQ_MONTHS[lease.frequency] ?? 1;
    const payDay    = lease.paymentDay;

    // ── Rent Due ────────────────────────────────────────────────
    const day = actualPayDay(payDay, calYear, calMonth);

    if (interval === 0) {
      // One-Time: only shows in the start month
      if (start.getFullYear() === calYear && start.getMonth() === calMonth) {
        const eventDate = new Date(calYear, calMonth, day);
        if ((!end || eventDate <= end) && eventDate >= start)
          events.push({ type: 'rent', day, date: eventDate, houseName, houseId, isOverdue: eventDate < today });
      }
    } else {
      // Periodic: first due = paymentDay of start month (advance one period if pay day already passed before startDate)
      let dueYr = start.getFullYear();
      let dueMo = start.getMonth();
      const firstDueDay = actualPayDay(payDay, dueYr, dueMo);
      if (new Date(dueYr, dueMo, firstDueDay) < start) {
        dueMo += interval;
        dueYr += Math.floor(dueMo / 12);
        dueMo %= 12;
      }
      // Does the calendar month land exactly on a period boundary?
      const firstTotalMo = dueYr * 12 + dueMo;
      const calTotalMo   = calYear * 12 + calMonth;
      const diff = calTotalMo - firstTotalMo;
      if (diff >= 0 && diff % interval === 0) {
        const eventDate = new Date(calYear, calMonth, day);
        if ((!end || eventDate <= end) && eventDate >= start)
          events.push({ type: 'rent', day, date: eventDate, houseName, houseId, isOverdue: eventDate < today });
      }
    }

    // ── Lease Expiry ────────────────────────────────────────────
    if (end && end.getFullYear() === calYear && end.getMonth() === calMonth) {
      const day = end.getDate();
      events.push({ type: 'lease', day, date: new Date(calYear, calMonth, day), houseName, houseId, isOverdue: false });
    }
  });

  return events.sort((a, b) => a.date - b.date);
};

/* ── Calendar Events List ───────────────────────────────────── */
const CalendarEvents = ({ events, calYear, calMonth, selectedDate = null, onClearDate, hideOpenLink = false }) => {
  const fmtDayHeader = (day) => {
    const d = new Date(calYear, calMonth, day);
    const weekday   = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const monthShort = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    return `${weekday} ${day} ${monthShort}`;
  };

  const displayedEvents = selectedDate !== null
    ? events.filter(ev => ev.day === selectedDate)
    : events;

  const grouped = {};
  displayedEvents.forEach((ev) => {
    if (!grouped[ev.day]) grouped[ev.day] = [];
    grouped[ev.day].push(ev);
  });
  const sortedDays = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-700">
          {selectedDate !== null ? fmtDayHeader(selectedDate) : 'Upcoming Events'}
        </p>
        {selectedDate !== null && onClearDate && (
          <button onClick={onClearDate} className="text-xs text-blue-600 hover:underline">Show all</button>
        )}
      </div>

      {sortedDays.length === 0 ? (
        <div className="flex items-center gap-2 py-3">
          <Bell size={18} className="text-gray-300 flex-shrink-0" />
          <span className="text-sm text-gray-400">
            {selectedDate !== null ? 'No events on this date' : 'No events for the selected month'}
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDays.map((day) => {
            const dayEvs = grouped[day];
            return (
              <div key={day}>
                {selectedDate === null && (
                  <p className="text-[11px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    {fmtDayHeader(day)} ({dayEvs.length})
                  </p>
                )}
                <div className="space-y-1.5">
                  {dayEvs.map((ev, idx) => (
                    <Link
                      key={idx}
                      to={`/houses/${ev.houseId}`}
                      className="flex items-center border border-gray-100 rounded-lg overflow-hidden hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className={`w-1 self-stretch flex-shrink-0 ${ev.type === 'rent' ? 'bg-green-500' : 'bg-orange-400'}`} />
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${ev.type === 'rent' ? 'bg-green-100' : 'bg-orange-100'}`}>
                        {ev.type === 'rent'
                          ? <Building2 size={13} className="text-green-600" />
                          : <FileText size={13} className="text-orange-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0 py-2 pl-2">
                        <p className="text-xs font-bold text-gray-800">{ev.type === 'rent' ? 'RENT DUE' : 'LEASE EXPIRY'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{ev.houseName}</p>
                      </div>
                      {ev.isOverdue && (
                        <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded mx-1.5 flex-shrink-0">OVERDUE</span>
                      )}
                      <ChevronRight size={14} className="text-gray-300 mr-2 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          {!hideOpenLink && (
            <div className="pt-1 text-center">
              <button onClick={() => setCalDrawerOpen(true)} className="text-xs text-blue-600 hover:underline bg-transparent border-none cursor-pointer p-0">Open calendar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Date Chip ──────────────────────────────────────────────── */
const DateChip = ({ value, onChange }) => (
  <div className="relative">
    <div className="border border-gray-300 rounded px-3 py-1 text-xs text-gray-600 bg-white whitespace-nowrap cursor-pointer hover:border-gray-400 transition-colors select-none">
      {value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
    </div>
    <input
      type="date"
      value={value.toISOString().split('T')[0]}
      onChange={(e) => { if (e.target.value) onChange(new Date(e.target.value + 'T12:00:00')); }}
      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
    />
  </div>
);

/* ── Cashflow Chart (uses real monthly data) ────────────────── */
const CF_W        = 560;
const CF_H        = 230;
const CF_BAR_AREA = 185;
const CF_BASELINE = 123;
const CF_BAR_SLOT = CF_W / 12;
const CF_BAR_W    = 27;
const CF_BAR_X0   = (CF_BAR_SLOT - CF_BAR_W) / 2;
const CF_MONTHS_L = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const CF_GRID_Y   = Array.from({ length: 13 }, (_, i) => Math.round((CF_BAR_AREA / 12) * i));

const CashflowChart = ({ monthlyIncome }) => {
  const yr = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [fromDate, setFromDate] = useState(new Date(yr, 0, 1));
  const [toDate,   setToDate]   = useState(new Date(yr, 11, 31));

  const income   = monthlyIncome.reduce((s, v) => s + v, 0);
  const expenses = 0;
  const net      = income - expenses;

  const chartMax = Math.max(...monthlyIncome, 1) * 1.4;
  const toBarH   = (val) => val > 0 ? Math.max(Math.round((val / chartMax) * CF_BASELINE), 4) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">Cashflow</p>
        <div className="flex items-center gap-2">
          <DateChip value={fromDate} onChange={setFromDate} />
          <DateChip value={toDate}   onChange={setToDate}   />
        </div>
      </div>

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

      <svg
        viewBox={`0 0 ${CF_W} ${CF_H}`}
        className="w-full"
        style={{ height: 195, display: 'block' }}
        aria-label="Cashflow chart"
      >
        <rect width={CF_W} height={CF_H} fill="transparent" />
        {CF_GRID_Y.map((y, i) => (
          <line key={i} x1={0} x2={CF_W} y1={y} y2={y} stroke="#F5F6F8" strokeWidth={1} />
        ))}
        {monthlyIncome.map((val, i) => {
          const h = toBarH(val);
          return (
            <g key={i} transform={`translate(${CF_BAR_X0 + i * CF_BAR_SLOT}, ${CF_BASELINE - h})`}>
              <rect
                width={CF_BAR_W} height={h} rx={2} strokeWidth={0}
                fill={h > 0 ? (i === currentMonth ? '#3B82F6' : '#93C5FD') : '#eeeeee'}
              />
            </g>
          );
        })}
        <g transform={`translate(0, ${CF_BAR_AREA + 10})`}>
          {CF_MONTHS_L.map((m, i) => (
            <g key={m} transform={`translate(${i * CF_BAR_SLOT + CF_BAR_SLOT / 2}, 0)`}>
              <line x1={0} x2={0} y1={0} y2={4} stroke="rgb(119,119,119)" strokeWidth={1} />
              <text
                dominantBaseline="text-before-edge"
                textAnchor="middle"
                y={7}
                style={{
                  fontFamily: 'sans-serif', fontSize: '11px',
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

/* ── House Icon ─────────────────────────────────────────────── */
const HouseIcon = ({ size = 18, className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h6v-6h2v6h6v-8h3zM17 18h-2v-6H9v6H7v-7.81l5-4.5 5 4.5z"/>
    <path d="M10 10h4c0-1.1-.9-2-2-2s-2 .9-2 2"/>
  </svg>
);

/* ── Alarm Clock Icon ───────────────────────────────────────── */
const AlarmClockIcon = ({ size = 18, className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="m22 5.7-4.6-3.9-1.3 1.5 4.6 3.9zM7.9 3.4 6.6 1.9 2 5.7l1.3 1.5zM12.5 8H11v6l4.7 2.9.8-1.2-4-2.4zM12 4c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9m0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7"/>
  </svg>
);

/* ── Payment Tile ───────────────────────────────────────────── */
const PaymentTile = ({ title, amount, icon: Icon, iconBg, iconColor, sub, due, lastMonth }) => {
  const hasDue = due !== undefined;
  const pct    = hasDue && due > 0 ? Math.min(100, Math.round((amount / due) * 100)) : 0;
  const fmt    = (n) => `TZS ${Number(n || 0).toLocaleString()}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between h-full" style={{ minHeight: 130 }}>
      {/* Top: title */}
      <span className="text-sm font-semibold text-gray-700">{title}</span>

      {/* Middle: icon + amount + optional due + optional progress bar */}
      <div className="my-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="text-xl font-bold text-gray-900">{fmt(amount)}</p>
          </div>
          {hasDue && (
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-700">{fmt(due)}</p>
              <p className="text-[10px] text-gray-400 whitespace-nowrap">Due this month</p>
            </div>
          )}
        </div>
        {hasDue && (
          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      {/* Bottom: sub text — always pinned to bottom */}
      {hasDue ? (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600">{fmt(amount)} / {fmt(due)}</span>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">
            Last month: <span className="font-semibold text-gray-500">{fmt(lastMonth)}</span>
          </span>
        </div>
      ) : (
        <p className="text-xs text-gray-400">{sub}</p>
      )}
    </div>
  );
};

/* ── Maintenance Tool Icon ──────────────────────────────────── */
const MaintenanceToolIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="#042238" aria-hidden="true">
    <path d="M14.595 11.36l3.21 3.234.265-.066a4.731 4.731 0 014.138 1.085l.224.211a4.813 4.813 0 011.015 5.255.9.9 0 01-1.334.402l-.11-.088-1.816-1.69h-.672v.666l1.708 1.783a.914.914 0 01-.172 1.403l-.127.066a4.735 4.735 0 01-5.219-1.022 4.807 4.807 0 01-1.287-4.393l.065-.268-3.21-3.234 1.277-1.286 3.61 3.636c.26.262.336.657.193.998a2.985 2.985 0 00.63 3.26 2.93 2.93 0 001.64.835l.096.01-.757-.79a.912.912 0 01-.242-.492l-.01-.14v-1.94c0-.457.334-.835.77-.9l.133-.01h1.927c.181 0 .358.055.507.157l.106.084.848.789-.017-.152a2.972 2.972 0 00-.666-1.475l-.163-.178a2.935 2.935 0 00-3.238-.634.898.898 0 01-.888-.105l-.103-.09-3.608-3.635 1.277-1.286zM21.136.163a.899.899 0 011.154.103l1.445 1.456c.318.32.354.825.085 1.188l-2.472 3.33a.9.9 0 01-1.362.1l-.502-.506-9.011 9.074 1.404 1.415a.914.914 0 010 1.286.899.899 0 01-1.153.105l-.125-.105-.383-.387-5.69 5.734a2.334 2.334 0 01-3.193.121l-.128-.12a2.375 2.375 0 01-.001-3.344l5.692-5.736-.382-.384a.914.914 0 010-1.286.899.899 0 011.153-.105l.125.105 1.404 1.415 9.01-9.074-.604-.608a.914.914 0 01.03-1.316l.093-.075zM8.172 15.166l-5.69 5.733a.547.547 0 00.001.773c.21.212.553.212.765-.002l5.69-5.733-.766-.771zM8.119 1.409a4.809 4.809 0 011.287 4.394l-.067.267 3.21 3.232-1.277 1.286-3.608-3.632a.914.914 0 01-.193-.998 2.986 2.986 0 00-.63-3.262 2.887 2.887 0 00-1.605-.835l-.163-.02.727.827a.912.912 0 01.218.471l.01.133v1.94a.908.908 0 01-.77.9l-.134.01H3.198a.899.899 0 01-.508-.158l-.107-.085-.758-.71.015.13c.08.526.304 1.03.666 1.457l.164.179a2.926 2.926 0 003.237.614.898.898 0 01.887.104l.103.09 3.61 3.627-1.277 1.287-3.21-3.225-.267.067a4.71 4.71 0 01-4.138-1.068l-.223-.21A4.757 4.757 0 01.377 3a.9.9 0 011.335-.402l.111.089 1.729 1.613h.669v-.685L2.648 1.829a.914.914 0 01.2-1.377l.124-.064C4.739-.365 6.735.017 8.119 1.409zm13.426.68l-1.903 1.332.883.888 1.379-1.859-.359-.36z" />
  </svg>
);

/* ── Maintenance Dashboard Card ─────────────────────────────── */
const QUICK_TASKS = [
  'New', 'Air Filters', 'Landscaping', 'Check Exterior', 'HVAC Checkup',
  'Caulking', 'Flush Water Heater', 'Inspect Roof', 'Pest Control',
  'Check Windows/Doors', 'Clean Gutters', 'Test Smoke Detectors',
  'Check Chimney', 'Reverse Fans', 'Aerate Lawn',
];

const MAINT_STATUS = {
  open:        { label: 'Open',        cls: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', cls: 'bg-yellow-400 text-white' },
  resolved:    { label: 'Resolved',    cls: 'bg-green-100 text-green-700' },
  closed:      { label: 'Closed',      cls: 'bg-gray-100 text-gray-500' },
};

const fmtDate = (d) => {
  const dt = new Date(d);
  return `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}/${String(dt.getFullYear()).slice(2)}`;
};

const MaintenanceDashboardCard = ({ requests }) => {
  const active     = requests.filter((r) => ['open', 'in_progress'].includes(r.status));
  const totalActive = requests.filter((r) => r.status === 'open' || r.status === 'in_progress').length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5">

        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <MaintenanceToolIcon />
          <h2 className="text-sm font-bold text-[#042238]">
            Open Maintenance:{' '}
            <span className="text-blue-600">{totalActive}</span>
          </h2>
        </div>

        {/* Quick-add chips */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 mb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {QUICK_TASKS.map((task) => (
            <Link
              key={task}
              to="/maintenance"
              className="flex-shrink-0 text-xs font-medium text-[#042238] bg-white border border-gray-200 rounded px-2.5 py-1 hover:bg-gray-50 hover:border-gray-300 transition-colors whitespace-nowrap"
            >
              + {task}
            </Link>
          ))}
        </div>

        {/* Request list */}
        {active.length === 0 ? (
          <div className="py-5 text-center">
            <p className="text-sm text-gray-400">No open maintenance requests.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {active.slice(0, 3).map((m) => {
              const badge     = MAINT_STATUS[m.status] || MAINT_STATUS.open;
              const requester = m.submittedBy === 'tenant' && m.tenant?.name ? m.tenant.name : null;
              const location  = [m.house?.name, m.house?.address].filter(Boolean).join(', ');
              return (
                <Link
                  key={m._id}
                  to={`/maintenance/${m._id}`}
                  className="block border border-gray-100 rounded-lg p-3 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[11px] text-gray-400">{fmtDate(m.createdAt)}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex-shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#042238] mb-0.5">{m.title}</p>
                  <p className="text-xs text-gray-500">
                    {requester ? (
                      <>Requested by <b className="text-[#042238]">{requester}</b> in <b className="text-[#042238]">{location}</b></>
                    ) : (
                      <>At <b className="text-[#042238]">{location}</b></>
                    )}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="border-t border-gray-100 py-3 text-center">
        <Link
          to="/maintenance"
          className="text-xs font-bold text-[#069ED9] uppercase tracking-widest hover:underline"
        >
          View All Maintenance
        </Link>
      </div>
    </div>
  );
};

/* ── Stat Pill ──────────────────────────────────────────────── */
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
  const [houses,           setHouses]           = useState([]);
  const [tenants,          setTenants]          = useState([]);
  const [leases,           setLeases]           = useState([]);
  const [maintenance,      setMaintenance]      = useState([]);
  const [monthlyIncome,    setMonthlyIncome]    = useState(Array(12).fill(0));
  const [paidThisMonth,    setPaidThisMonth]    = useState(0);
  const [loading,          setLoading]          = useState(true);
  const [calCurrent,       setCalCurrent]       = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedCalDate,  setSelectedCalDate]  = useState(null);
  const [calDrawerOpen,    setCalDrawerOpen]    = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [housesRes, tenantsRes, leasesRes, maintRes, cashRes] = await Promise.allSettled([
          axios.get(`${backendUrl}${API.houses}`),
          axios.get(`${backendUrl}${API.tenants}`),
          axios.get(`${backendUrl}${API.leases}`),
          axios.get(`${backendUrl}${API.maintenance}`),
          axios.get(`${backendUrl}${API.cashflow}`),
        ]);
        if (housesRes.status === 'fulfilled')  setHouses(housesRes.value.data.data || []);
        if (tenantsRes.status === 'fulfilled') setTenants(tenantsRes.value.data.data || []);
        if (leasesRes.status === 'fulfilled')  setLeases(leasesRes.value.data.data || []);
        if (maintRes.status === 'fulfilled')   setMaintenance(maintRes.value.data.data || []);
        if (cashRes.status === 'fulfilled') {
          setMonthlyIncome(cashRes.value.data.data || Array(12).fill(0));
          setPaidThisMonth(cashRes.value.data.paidThisMonth || 0);
        }
      } catch {
        // handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Derived metrics ──────────────────────────────────────────
  const today           = new Date();
  const todayDate       = today.getDate();
  const currentMonthIdx = today.getMonth();
  const totalProperties = houses.length;
  const vacantHouses    = houses.filter((h) => !h.isOccupied).length;
  const occupiedHouses  = houses.filter((h) => h.isOccupied).length;
  const totalTenants    = tenants.length;
  const occupancyRate   = totalProperties ? Math.round((occupiedHouses / totalProperties) * 100) : 0;
  const collectionRate  = totalTenants ? Math.round((paidThisMonth / totalTenants) * 100) : 0;

  // "Rent Received" = actual money received this month from paid RentRecords
  const rentReceived   = monthlyIncome[currentMonthIdx] || 0;
  const rentLastMonth  = monthlyIncome[currentMonthIdx > 0 ? currentMonthIdx - 1 : 11] || 0;
  const totalDueThisMonth = tenants.filter(t => t.isActive !== false).reduce((s, t) => s + (t.rentAmount || 0), 0);

  const upcomingTenants = tenants.filter((t) => {
    const due = t.rentDueDate;
    if (!due) return false;
    const diff = due - todayDate;
    return diff >= 0 && diff <= 7;
  });

  const upcomingAmount = upcomingTenants.reduce((s, t) => s + (t.rentAmount || 0), 0);

  // Overdue: houses where payment day passed this month and no paid RentRecord exists
  const overdueHouses = houses.filter((h) => h.rentStatus === 'overdue');
  const overdueAmount  = overdueHouses.reduce((s, h) => s + (h.lease?.rentAmount || h.rentAmount || 0), 0);
  const overdueCount   = overdueHouses.length;

  const firstName = user?.name?.split(' ')[0] || 'there';

  // ── Calendar event data ──────────────────────────────────────
  const calYear  = calCurrent.getFullYear();
  const calMonth = calCurrent.getMonth();
  const calEvents        = buildEvents(leases, calYear, calMonth);
  const rentDueDays      = new Set(calEvents.filter((e) => e.type === 'rent').map((e) => e.day));
  const leaseExpiryDays  = new Set(calEvents.filter((e) => e.type === 'lease').map((e) => e.day));

  // Quick action items
  const quickActions = [
    { label: 'Add Property',    icon: Building2,  to: '/houses/new',       iconBg: 'bg-blue-50',   iconColor: 'text-blue-600' },
    { label: 'Add Tenant',      icon: UserPlus,   to: '/tenants',          iconBg: 'bg-green-50',  iconColor: 'text-green-600' },
    { label: 'Record Payment',  icon: CreditCard, to: '/payments/record',  iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Maintenance',     icon: Wrench,     to: '/maintenance',      iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  ];

  return (
    <Layout>
      <main className="flex-1 min-h-screen bg-[#f5f6f8]">
        <div className="max-w-[1100px] mx-auto px-6 py-7 space-y-5">

          {/* ── Greeting ────────────────────────────────────────── */}
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
              {/* ── Quick Actions ────────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {quickActions.map(({ label, icon: Icon, to, iconBg, iconColor }) => (
                  <Link
                    key={label}
                    to={to}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2.5 hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg} group-hover:scale-105 transition-transform`}>
                      <Icon size={18} className={iconColor} />
                    </div>
                    <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
                  </Link>
                ))}
              </div>

              {/* ── Unified 10-col grid — tiles align exactly with cards below ── */}
              <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">

                {/* Row 1 — Payment tiles (3+3+4 = 10 cols) */}
                <div className="lg:col-span-3">
                  <PaymentTile
                    title="Rent Received"
                    amount={rentReceived}
                    icon={HouseIcon}
                    iconBg="bg-green-100"
                    iconColor="text-green-600"
                    sub={`${paidThisMonth} tenant${paidThisMonth !== 1 ? 's' : ''} paid this month`}
                    due={totalDueThisMonth}
                    lastMonth={rentLastMonth}
                  />
                </div>
                <div className="lg:col-span-3">
                  <PaymentTile
                    title="Upcoming Payments"
                    amount={upcomingAmount}
                    icon={Calendar}
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                    sub={`${upcomingTenants.length} payment${upcomingTenants.length !== 1 ? 's' : ''} due within 7 days`}
                  />
                </div>
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between h-full" style={{ minHeight: 130 }}>
                    <span className="text-sm font-semibold text-gray-700">Rent Overdue</span>
                    <div className="my-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <AlarmClockIcon size={18} className="text-red-500" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">TZS {overdueAmount.toLocaleString()}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {overdueCount === 0 ? 'No overdue tenants' : `${overdueCount} overdue`}
                    </span>
                  </div>
                </div>

                {/* Left column (6 cols) — Cashflow then Properties stacked */}
                <div className="lg:col-span-6 flex flex-col gap-4">
                  <CashflowChart monthlyIncome={monthlyIncome} />
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-gray-700">Properties</p>
                      <Link to="/houses" className="text-xs text-blue-600 hover:underline">View all</Link>
                    </div>
                    <StatPill label="Total Properties" value={totalProperties} color="bg-blue-500" />
                    <StatPill label="Total Tenants"    value={totalTenants}    color="bg-green-500" />
                    <StatPill label="Occupied Houses"  value={occupiedHouses}  color="bg-purple-500" />
                    <StatPill label="Vacant Houses"    value={vacantHouses}    color="bg-orange-400" />
                    <div className="mt-4 pt-3 border-t border-gray-50 space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                          <span>Occupancy rate</span>
                          <span className="font-semibold text-gray-900">{occupancyRate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-green-500 transition-all duration-500" style={{ width: `${occupancyRate}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                          <span>Rent collected this month</span>
                          <span className="font-semibold text-gray-900">{collectionRate}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${collectionRate}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {paidThisMonth} of {totalTenants} tenant{totalTenants !== 1 ? 's' : ''} paid
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column (4 cols) — Calendar+Events then Maintenance stacked */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                  <MiniCalendar
                    current={calCurrent}
                    onPrev={() => { setCalCurrent(new Date(calYear, calMonth - 1, 1)); setSelectedCalDate(null); }}
                    onNext={() => { setCalCurrent(new Date(calYear, calMonth + 1, 1)); setSelectedCalDate(null); }}
                    rentDueDays={rentDueDays}
                    leaseExpiryDays={leaseExpiryDays}
                    selectedDate={selectedCalDate}
                    onSelectDate={setSelectedCalDate}
                  />
                  <CalendarEvents
                    events={calEvents}
                    calYear={calYear}
                    calMonth={calMonth}
                    selectedDate={selectedCalDate}
                    onClearDate={() => setSelectedCalDate(null)}
                  />
                  <MaintenanceDashboardCard requests={maintenance} />
                </div>

              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Calendar Side Drawer ─────────────────────────────── */}
      {calDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setCalDrawerOpen(false)}
          />
          <div className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0">
              <div className="flex items-center gap-2 text-gray-800">
                <Calendar size={18} />
                <span className="text-sm font-semibold">Calendar</span>
              </div>
              <button
                onClick={() => setCalDrawerOpen(false)}
                className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
            <hr className="border-gray-200 flex-shrink-0" />
            <div className="flex-1 overflow-y-auto">
              <div className="mx-4 mt-4 mb-2 bg-gray-50 rounded-xl p-4">
                <MiniCalendar
                  current={calCurrent}
                  onPrev={() => { setCalCurrent(new Date(calYear, calMonth - 1, 1)); setSelectedCalDate(null); }}
                  onNext={() => { setCalCurrent(new Date(calYear, calMonth + 1, 1)); setSelectedCalDate(null); }}
                  rentDueDays={rentDueDays}
                  leaseExpiryDays={leaseExpiryDays}
                  selectedDate={selectedCalDate}
                  onSelectDate={setSelectedCalDate}
                />
              </div>
              <div className="px-4 py-4">
                <CalendarEvents
                  events={calEvents}
                  calYear={calYear}
                  calMonth={calMonth}
                  selectedDate={selectedCalDate}
                  onClearDate={() => setSelectedCalDate(null)}
                  hideOpenLink
                />
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default LandlordDashboard;
