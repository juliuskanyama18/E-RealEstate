import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Calendar, Bell, Lightbulb, ChevronDown, ChevronLeft, ChevronRight,
  User, HelpCircle, LogOut, X, List, Search, Building2, Home, FileText, Lock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { backendUrl, API } from '../config/constants';

/* ── Circle checkbox visual ─────────────────────────────────── */
const CircleCheck = ({ checked }) => (
  <div className="flex-shrink-0 w-4 h-4">
    {checked ? (
      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ) : (
      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
    )}
  </div>
);

/* ── Calendar event helpers (mirrors Dashboard logic) ───────── */
const CAL_FREQ_MONTHS = {
  'One-Time': 0, '1 Month': 1, '2 Months': 2, '3 Months': 3,
  '4 Months': 4, '5 Months': 5, '6 Months': 6,
  '18 Months': 18, '24 Months': 24, '1 Year': 12,
};
const calActualPayDay = (paymentDay, yr, mo) => {
  if (paymentDay === 31) return new Date(yr, mo + 1, 0).getDate();
  return Math.min(paymentDay, new Date(yr, mo + 1, 0).getDate());
};
const buildPanelEvents = (leases, calYear, calMonth) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const events = [];
  leases.forEach((lease) => {
    if (!lease.house || !lease.startDate || !lease.paymentDay) return;
    const houseName = [lease.house.name, lease.house.city].filter(Boolean).join(' ');
    const houseId   = lease.house._id;
    const start     = new Date(lease.startDate); start.setHours(0, 0, 0, 0);
    const end       = lease.endDate ? new Date(lease.endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);
    const interval  = CAL_FREQ_MONTHS[lease.frequency] ?? 1;
    const payDay    = lease.paymentDay;
    const day       = calActualPayDay(payDay, calYear, calMonth);
    if (interval === 0) {
      if (start.getFullYear() === calYear && start.getMonth() === calMonth) {
        const eventDate = new Date(calYear, calMonth, day);
        if ((!end || eventDate <= end) && eventDate >= start)
          events.push({ type: 'rent', day, date: eventDate, houseName, houseId, isOverdue: eventDate < today });
      }
    } else {
      let dueYr = start.getFullYear(), dueMo = start.getMonth();
      const firstDueDay = calActualPayDay(payDay, dueYr, dueMo);
      if (new Date(dueYr, dueMo, firstDueDay) < start) {
        dueMo += interval; dueYr += Math.floor(dueMo / 12); dueMo %= 12;
      }
      const diff = (calYear * 12 + calMonth) - (dueYr * 12 + dueMo);
      if (diff >= 0 && diff % interval === 0) {
        const eventDate = new Date(calYear, calMonth, day);
        if ((!end || eventDate <= end) && eventDate >= start)
          events.push({ type: 'rent', day, date: eventDate, houseName, houseId, isOverdue: eventDate < today });
      }
    }
    if (end && end.getFullYear() === calYear && end.getMonth() === calMonth) {
      const d = new Date(lease.endDate).getDate();
      events.push({ type: 'lease', day: d, date: new Date(calYear, calMonth, d), houseName, houseId, isOverdue: false });
    }
  });
  return events.sort((a, b) => a.date - b.date);
};

/* ── Calendar Panel ─────────────────────────────────────────── */
const FILTER_ITEMS = ['Expense due', 'Lease expiry', 'Maintenance due', 'Reminder', 'Rent due'];
const FILTER_TYPE_MAP = {
  'Rent due': 'rent', 'Lease expiry': 'lease',
  'Expense due': 'expense', 'Maintenance due': 'maintenance', 'Reminder': 'reminder',
};

const CalendarPanel = ({ onClose }) => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const today      = new Date();
  const [current,        setCurrent]        = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [houses,         setHouses]         = useState([]);
  const [leases,         setLeases]         = useState([]);
  const [selectedDate,   setSelectedDate]   = useState(null); // day number | null
  const [propsOpen,      setPropsOpen]      = useState(false);
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [propSearch,     setPropSearch]     = useState('');
  const [filterSearch,   setFilterSearch]   = useState('');
  const [selectedProps,  setSelectedProps]  = useState(new Set());
  const [selectedFilters,setSelectedFilters]= useState(new Set());
  const propsRef  = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'landlord') {
      axios.get(`${backendUrl}${API.houses}`).then(r => setHouses(r.data.data || [])).catch(() => {});
      axios.get(`${backendUrl}${API.leases}`).then(r => setLeases(r.data.data || [])).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const h = (e) => {
      if (propsRef.current  && !propsRef.current.contains(e.target))  setPropsOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const year        = current.getFullYear();
  const month       = current.getMonth();
  const monthName   = current.toLocaleString('en-US', { month: 'long' });
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells  = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const padded = [...cells, ...Array(cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)).fill(null)];
  const weeks  = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  const isToday    = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected = (d) => d === selectedDate;

  const propItems = [
    { id: 'org', label: 'Organisation', icon: 'building' },
    ...houses.map(h => ({ id: h._id, label: h.name, icon: 'home' })),
  ];
  const filteredProps   = propItems.filter(p => p.label.toLowerCase().includes(propSearch.toLowerCase()));
  const filteredFilters = FILTER_ITEMS.filter(f => f.toLowerCase().includes(filterSearch.toLowerCase()));

  const toggleProp   = (id) => setSelectedProps(prev   => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleFilter = (f)  => setSelectedFilters(prev => { const n = new Set(prev); n.has(f)  ? n.delete(f)  : n.add(f);  return n; });

  // ── Compute events ────────────────────────────────────────────
  const allEvents = buildPanelEvents(leases, year, month);

  // Property filter:
  //   nothing selected   → show all events
  //   'org' selected     → show only org-level events (no houseId)
  //   house IDs selected → show only those houses' events
  //   both               → show org events + selected houses' events
  const showOrg = selectedProps.has('org');
  const selectedHouseIds = new Set([...selectedProps].filter(id => id !== 'org'));
  const propFiltered = selectedProps.size === 0
    ? allEvents
    : allEvents.filter(ev => {
        const isOrgEvent = !ev.houseId;
        if (isOrgEvent) return showOrg;
        return selectedHouseIds.has(ev.houseId);
      });

  // Type filter
  const typeFiltered = selectedFilters.size === 0
    ? propFiltered
    : propFiltered.filter(ev => {
        const activeTypes = new Set([...selectedFilters].map(f => FILTER_TYPE_MAP[f]).filter(Boolean));
        return activeTypes.has(ev.type);
      });

  const rentDueDays     = new Set(typeFiltered.filter(e => e.type === 'rent').map(e => e.day));
  const leaseExpiryDays = new Set(typeFiltered.filter(e => e.type === 'lease').map(e => e.day));

  // Date selection filter
  const displayedEvents = selectedDate !== null
    ? typeFiltered.filter(ev => ev.day === selectedDate)
    : typeFiltered;

  // Group by day for list
  const grouped = {};
  displayedEvents.forEach(ev => { if (!grouped[ev.day]) grouped[ev.day] = []; grouped[ev.day].push(ev); });
  const sortedDays = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  const fmtDayHeader = (day) => {
    const d = new Date(year, month, day);
    return `${d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} ${day} ${d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}`;
  };

  const handleDayClick = (d) => {
    if (!d) return;
    setSelectedDate(prev => prev === d ? null : d);
  };

  const handleMonthChange = (newDate) => {
    setCurrent(newDate);
    setSelectedDate(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0">
          <div className="flex items-center gap-2 text-gray-800">
            <Calendar size={18} />
            <span className="text-sm font-semibold">Calendar</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        <hr className="border-gray-200 flex-shrink-0" />

        <div className="flex-1 overflow-y-auto">

          {/* Properties + Filter buttons */}
          <div className="flex gap-3 px-4 pt-4 pb-2">

            {/* Properties */}
            <div className="flex-1 relative" ref={propsRef}>
              <button
                onClick={() => { setPropsOpen(o => !o); setFilterOpen(false); }}
                className="w-full flex items-center justify-between border border-gray-300 rounded px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  Properties
                  {selectedProps.size > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {selectedProps.size}
                    </span>
                  )}
                </span>
                <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
              </button>
              {propsOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                  <div className="p-2.5 pb-1.5">
                    <div className="relative">
                      <input type="text" placeholder="Search" value={propSearch} onChange={e => setPropSearch(e.target.value)}
                        className="w-full border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400" autoFocus />
                      <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex justify-end px-3 pb-1">
                    {propItems.length > 0 && selectedProps.size === propItems.length
                      ? <button onClick={() => setSelectedProps(new Set())} className="text-xs text-blue-600 hover:underline">Deselect all</button>
                      : <button onClick={() => setSelectedProps(new Set(propItems.map(p => p.id)))} className="text-xs text-blue-600 hover:underline">Select all</button>
                    }
                  </div>
                  <div className="max-h-52 overflow-y-auto border-t border-gray-100">
                    {filteredProps.map(p => (
                      <div key={p.id} onClick={() => toggleProp(p.id)} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                        <CircleCheck checked={selectedProps.has(p.id)} />
                        {p.icon === 'building' ? <Building2 size={14} className="text-gray-500 flex-shrink-0" /> : <Home size={14} className="text-gray-500 flex-shrink-0" />}
                        <span className="text-sm text-gray-700 truncate">{p.label}</span>
                      </div>
                    ))}
                    {filteredProps.length === 0 && <div className="py-3 text-xs text-center text-gray-400">No properties found</div>}
                  </div>
                </div>
              )}
            </div>

            {/* Filter */}
            <div className="flex-1 relative" ref={filterRef}>
              <button
                onClick={() => { setFilterOpen(o => !o); setPropsOpen(false); }}
                className="w-full flex items-center justify-between border border-gray-300 rounded px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  Filter
                  {selectedFilters.size > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {selectedFilters.size}
                    </span>
                  )}
                </span>
                <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
              </button>
              {filterOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden">
                  <div className="p-2.5 pb-1.5">
                    <div className="relative">
                      <input type="text" placeholder="Search" value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
                        className="w-full border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400" autoFocus />
                      <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex justify-end px-3 pb-1">
                    {selectedFilters.size === FILTER_ITEMS.length
                      ? <button onClick={() => setSelectedFilters(new Set())} className="text-xs text-blue-600 hover:underline">Deselect all</button>
                      : <button onClick={() => setSelectedFilters(new Set(FILTER_ITEMS))} className="text-xs text-blue-600 hover:underline">Select all</button>
                    }
                  </div>
                  <div className="border-t border-gray-100">
                    {filteredFilters.map(f => (
                      <div key={f} onClick={() => toggleFilter(f)} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                        <CircleCheck checked={selectedFilters.has(f)} />
                        <span className="text-sm text-gray-700">{f}</span>
                      </div>
                    ))}
                    {filteredFilters.length === 0 && <div className="py-3 text-xs text-center text-gray-400">No results</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar grid */}
          <div className="mx-4 mt-2 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-800">{monthName} {year}</span>
              <div className="flex items-center gap-0.5">
                <button onClick={() => handleMonthChange(new Date(year, month - 1, 1))} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors" aria-label="Previous month">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => handleMonthChange(new Date(year, month + 1, 1))} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors" aria-label="Next month">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center mb-1">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-xs font-semibold text-blue-500 py-1">{d}</div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 text-center">
                {week.map((d, di) => (
                  <div key={di} className="flex flex-col items-center py-0.5">
                    {d !== null ? (
                      <>
                        <button
                          onClick={() => handleDayClick(d)}
                          className={`w-9 h-9 flex items-center justify-center text-sm rounded-full transition-colors
                            ${isSelected(d)
                              ? 'bg-blue-500 text-white font-semibold'
                              : isToday(d)
                              ? 'border-2 border-blue-500 text-blue-600 font-semibold'
                              : 'text-blue-800 hover:bg-blue-50'}`}
                        >
                          {d}
                        </button>
                        <div className="h-2 flex gap-0.5 items-center mt-0.5">
                          {rentDueDays.has(d)     && <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />}
                          {leaseExpiryDays.has(d) && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />}
                        </div>
                      </>
                    ) : (
                      <div className="w-9 h-9" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Events list */}
          <div className="px-4 py-4">
            {selectedDate !== null && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {fmtDayHeader(selectedDate)}
                </span>
                <button onClick={() => setSelectedDate(null)} className="text-xs text-blue-600 hover:underline">
                  Show all
                </button>
              </div>
            )}

            {sortedDays.length === 0 ? (
              <div className="flex items-center gap-2.5 py-2 text-gray-400">
                <List size={18} />
                <span className="text-sm">
                  {selectedDate !== null ? 'No events on this date' : 'No events for the selected month'}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedDays.map(day => {
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
                          <div
                            key={idx}
                            onClick={() => { navigate(`/houses/${ev.houseId}`); onClose(); }}
                            className="flex items-center border border-gray-100 rounded-lg overflow-hidden hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer"
                          >
                            <div className={`w-1 self-stretch flex-shrink-0 ${ev.type === 'rent' ? 'bg-green-500' : 'bg-orange-400'}`} />
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${ev.type === 'rent' ? 'bg-green-100' : 'bg-orange-100'}`}>
                              {ev.type === 'rent'
                                ? <Building2 size={13} className="text-green-600" />
                                : <FileText  size={13} className="text-orange-500" />}
                            </div>
                            <div className="flex-1 min-w-0 py-2 pl-2">
                              <p className="text-xs font-bold text-gray-800">{ev.type === 'rent' ? 'RENT DUE' : 'LEASE EXPIRY'}</p>
                              <p className="text-[10px] text-gray-400 truncate">{ev.houseName}</p>
                            </div>
                            {ev.isOverdue && (
                              <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded mx-1.5 flex-shrink-0">OVERDUE</span>
                            )}
                            <ChevronRight size={14} className="text-gray-300 mr-2 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

/* ── Reminders Panel ────────────────────────────────────────── */
const REMINDER_CATS = [
  'Electrical Safety Check', 'Gas Safety Check', 'Insurance Policy Renewal',
  'Property Inspection', 'Other', 'Energy Performance Check',
];

const RemindersPanel = ({ onClose }) => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [houses,    setHouses]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search,    setSearch]    = useState('');
  const [addOpen,   setAddOpen]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({ houseId: '', dateTime: '', category: 'Electrical Safety Check', notes: '' });

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}${API.reminders}`);
      setReminders(data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => {
    if (user?.role === 'landlord') {
      fetchReminders();
      axios.get(`${backendUrl}${API.houses}`).then(r => setHouses(r.data.data || [])).catch(() => {});
    }
  }, [user]);

  const tabFiltered = reminders.filter(r => {
    if (activeTab === 'overdue')  return r.status === 'overdue';
    if (activeTab === 'upcoming') return r.status === 'upcoming';
    if (activeTab === 'schedules') return false;
    return true;
  }).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.category || '').toLowerCase().includes(q)
      || (r.house?.name || '').toLowerCase().includes(q)
      || (r.notes || '').toLowerCase().includes(q);
  });

  const grouped = {};
  tabFiltered.forEach(r => {
    const d = new Date(r.dateTime);
    const key = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
    if (!grouped[key]) grouped[key] = { ts: d.getTime(), items: [] };
    grouped[key].items.push(r);
  });
  const sortedDayKeys = Object.keys(grouped).sort((a, b) => grouped[a].ts - grouped[b].ts);

  const overdueCount = reminders.filter(r => r.status === 'overdue').length;

  const handleMarkComplete = async (r) => {
    try {
      await axios.put(`${backendUrl}${API.reminders}/${r._id}`, { status: 'complete' });
      fetchReminders();
    } catch { toast.error('Failed to update'); }
  };

  const handleSave = async () => {
    if (!form.dateTime) return toast.error('Date & Time is required');
    try {
      setSaving(true);
      await axios.post(`${backendUrl}${API.reminders}`, {
        houseId: form.houseId || null,
        dateTime: form.dateTime,
        category: form.category,
        notes: form.notes,
      });
      toast.success('Reminder added');
      setAddOpen(false);
      setForm({ houseId: '', dateTime: '', category: 'Electrical Safety Check', notes: '' });
      fetchReminders();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: 'all',       label: 'All',       count: reminders.length, badge: true  },
    { id: 'overdue',   label: 'OVERDUE',   count: overdueCount,     badge: true  },
    { id: 'upcoming',  label: 'UPCOMING',  count: null,             badge: false },
    { id: 'schedules', label: 'SCHEDULES', count: 0,                badge: true  },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col">

        {/* Header */}
        <div className="px-5 pt-3.5 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-800">
              <Bell size={18} />
              <span className="text-sm font-semibold">Reminders</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Find reminders" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
        </div>

        <hr className="border-gray-200 flex-shrink-0" />

        {/* Tabs */}
        <div className="px-2 flex-shrink-0 border-b border-gray-100">
          <div className="flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-3 text-xs font-semibold tracking-wide transition-colors
                  ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none
                    ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-sm" />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading ? (
            <div className="py-10 text-center text-gray-400 text-sm">Loading...</div>
          ) : sortedDayKeys.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">No reminders</div>
          ) : (
            <div className="space-y-5">
              {sortedDayKeys.map(dayKey => (
                <div key={dayKey}>
                  <p className="text-[11px] font-semibold text-gray-400 mb-2 tracking-wide">{dayKey}</p>
                  <div className="space-y-2">
                    {grouped[dayKey].items.map((r) => (
                      <div key={r._id} className="flex items-center border border-gray-100 rounded-lg overflow-hidden hover:border-blue-100 transition-colors">
                        <div className={`w-1 self-stretch flex-shrink-0 ${r.status === 'overdue' ? 'bg-red-500' : r.status === 'complete' ? 'bg-green-400' : 'bg-orange-400'}`} />
                        <button
                          onClick={() => handleMarkComplete(r)}
                          title="Mark complete"
                          className={`ml-3 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${r.status === 'complete' ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-blue-400'}`}
                        >
                          {r.status === 'complete' && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-1 min-w-0 py-2.5 pl-2.5">
                          <p className="text-xs font-bold text-gray-800 truncate">{r.house?.name?.toUpperCase() || 'ORGANISATION'}</p>
                          <p className="text-[11px] text-gray-500 truncate">{r.category}</p>
                        </div>
                        {r.house?._id && (
                          <button onClick={() => { navigate(`/houses/${r.house._id}`); onClose(); }}
                            className="p-2 text-gray-300 hover:text-gray-500 transition-colors">
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex-shrink-0">
          <button onClick={() => setAddOpen(true)} className="text-sm text-blue-600 hover:underline font-medium">
            + New Reminder
          </button>
        </div>
      </div>

      {/* Add Reminder Modal */}
      {addOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setAddOpen(false)} />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900">Add reminder</h2>
                <button onClick={() => setAddOpen(false)} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* Property / Organisation */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Property / Organisation</label>
                  <select value={form.houseId} onChange={e => setForm(p => ({ ...p, houseId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                    <option value="">Organisation</option>
                    {houses.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                  </select>
                </div>
                {/* Date & Time + Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Date &amp; Time</label>
                    <input type="datetime-local" value={form.dateTime} onChange={e => setForm(p => ({ ...p, dateTime: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white">
                      {REMINDER_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {/* Notes */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes</label>
                  <textarea rows={3} placeholder="Enter notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                </div>
                {/* Recurring — PRO */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700">Is this a recurring reminder?</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">PRO</span>
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 opacity-50 cursor-not-allowed select-none">
                      <input type="radio" name="recurring" disabled /><span className="text-sm text-gray-600">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 select-none">
                      <input type="radio" name="recurring" defaultChecked /><span className="text-sm text-gray-600">No</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Lock size={11} /><span>Upgrade to PRO to unlock</span>
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm text-blue-600 hover:underline">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

/* ── Navbar ─────────────────────────────────────────────────── */
const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [calendarOpen,   setCalendarOpen]   = useState(false);
  const [remindersOpen,  setRemindersOpen]  = useState(false);
  const [overdueCount,   setOverdueCount]   = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'landlord') {
      axios.get(`${backendUrl}${API.reminders}`)
        .then(r => setOverdueCount((r.data.data || []).filter(x => x.status === 'overdue').length))
        .catch(() => {});
    }
  }, [user]);

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-30" style={{ height: 64 }}>
        <button onClick={onMenuClick} className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors" aria-label="open drawer">
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-1">
          {/* Calendar */}
          <button
            onClick={() => { setCalendarOpen(o => !o); setRemindersOpen(false); }}
            className={`p-2 rounded-md transition-colors ${calendarOpen ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Calendar"
          >
            <Calendar size={20} />
          </button>

          {/* Bell */}
          <button
            onClick={() => { setRemindersOpen(o => !o); setCalendarOpen(false); }}
            className={`relative p-2 rounded-md transition-colors ${remindersOpen ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
            aria-label="Reminders"
          >
            <Bell size={20} />
            {overdueCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">{overdueCount}</span>
            )}
          </button>

          {/* Quick start disabled */}

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label="user profile menu">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">{initials}</div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">{user?.name}</span>
              <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 select-none">{initials}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <button onClick={() => { setProfileOpen(false); navigate('/account'); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  <User size={18} className="text-gray-400 flex-shrink-0" />Account settings
                </button>
                {/* Help link disabled */}
                <hr className="border-gray-100" />
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  <LogOut size={18} className="text-gray-400 flex-shrink-0" />Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {calendarOpen  && <CalendarPanel  onClose={() => setCalendarOpen(false)}  />}
      {remindersOpen && <RemindersPanel onClose={() => setRemindersOpen(false)} />}
    </>
  );
};

export default Navbar;
