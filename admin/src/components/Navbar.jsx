import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Calendar, Bell, Lightbulb, ChevronDown, ChevronLeft, ChevronRight,
  User, HelpCircle, LogOut, X, List, Search, Building2, Home,
} from 'lucide-react';
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

/* ── Calendar Panel ─────────────────────────────────────────── */
const FILTER_ITEMS = ['Expense due', 'Lease expiry', 'Maintenance due', 'Reminder', 'Rent due'];

const CalendarPanel = ({ onClose }) => {
  const { user } = useAuth();
  const today   = new Date();
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [houses, setHouses]   = useState([]);

  // dropdown open states
  const [propsOpen,  setPropsOpen]  = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // search
  const [propSearch,   setPropSearch]   = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // selections
  const [selectedProps,   setSelectedProps]   = useState(new Set(['org']));
  const [selectedFilters, setSelectedFilters] = useState(new Set());

  const propsRef  = useRef(null);
  const filterRef = useRef(null);

  // fetch houses for landlord
  useEffect(() => {
    if (user?.role === 'landlord') {
      axios.get(`${backendUrl}${API.houses}`).then(r => setHouses(r.data.data || [])).catch(() => {});
    }
  }, [user]);

  // close dropdowns on outside click
  useEffect(() => {
    const h = (e) => {
      if (propsRef.current  && !propsRef.current.contains(e.target))  setPropsOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // calendar helpers
  const year      = current.getFullYear();
  const month     = current.getMonth();
  const monthName = current.toLocaleString('en-US', { month: 'long' });
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells   = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const padded  = [...cells, ...Array(cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)).fill(null)];
  const weeks   = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // prop items
  const propItems = [
    { id: 'org', label: 'Organisation', icon: 'building' },
    ...houses.map(h => ({ id: h._id, label: h.name, icon: 'home' })),
  ];
  const filteredProps   = propItems.filter(p => p.label.toLowerCase().includes(propSearch.toLowerCase()));
  const filteredFilters = FILTER_ITEMS.filter(f => f.toLowerCase().includes(filterSearch.toLowerCase()));

  const toggleProp = (id) => setSelectedProps(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleFilter = (f) => setSelectedFilters(prev => {
    const n = new Set(prev); n.has(f) ? n.delete(f) : n.add(f); return n;
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-screen w-[480px] bg-white shadow-2xl z-50 flex flex-col">

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

            {/* ── Properties ── */}
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
                  {/* Search */}
                  <div className="p-2.5 pb-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={propSearch}
                        onChange={e => setPropSearch(e.target.value)}
                        className="w-full border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        autoFocus
                      />
                      <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  {/* Select / Deselect all */}
                  <div className="flex justify-end px-3 pb-1">
                    {propItems.length > 0 && selectedProps.size === propItems.length ? (
                      <button onClick={() => setSelectedProps(new Set())} className="text-xs text-blue-600 hover:underline">
                        Deselect all
                      </button>
                    ) : (
                      <button onClick={() => setSelectedProps(new Set(propItems.map(p => p.id)))} className="text-xs text-blue-600 hover:underline">
                        Select all
                      </button>
                    )}
                  </div>
                  {/* Items */}
                  <div className="max-h-52 overflow-y-auto border-t border-gray-100">
                    {filteredProps.map(p => (
                      <div
                        key={p.id}
                        onClick={() => toggleProp(p.id)}
                        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <CircleCheck checked={selectedProps.has(p.id)} />
                        {p.icon === 'building'
                          ? <Building2 size={14} className="text-gray-500 flex-shrink-0" />
                          : <Home      size={14} className="text-gray-500 flex-shrink-0" />}
                        <span className="text-sm text-gray-700 truncate">{p.label}</span>
                      </div>
                    ))}
                    {filteredProps.length === 0 && (
                      <div className="py-3 text-xs text-center text-gray-400">No properties found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Filter ── */}
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
                  {/* Search */}
                  <div className="p-2.5 pb-1.5">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search"
                        value={filterSearch}
                        onChange={e => setFilterSearch(e.target.value)}
                        className="w-full border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        autoFocus
                      />
                      <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  {/* Select / Deselect all */}
                  <div className="flex justify-end px-3 pb-1">
                    {selectedFilters.size === FILTER_ITEMS.length ? (
                      <button onClick={() => setSelectedFilters(new Set())} className="text-xs text-blue-600 hover:underline">
                        Deselect all
                      </button>
                    ) : (
                      <button onClick={() => setSelectedFilters(new Set(FILTER_ITEMS))} className="text-xs text-blue-600 hover:underline">
                        Select all
                      </button>
                    )}
                  </div>
                  {/* Items */}
                  <div className="border-t border-gray-100">
                    {filteredFilters.map(f => (
                      <div
                        key={f}
                        onClick={() => toggleFilter(f)}
                        className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <CircleCheck checked={selectedFilters.has(f)} />
                        <span className="text-sm text-gray-700">{f}</span>
                      </div>
                    ))}
                    {filteredFilters.length === 0 && (
                      <div className="py-3 text-xs text-center text-gray-400">No results</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Calendar grid */}
          <div className="mx-4 mt-2 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-800">{monthName} {year}</span>
                <button className="p-0.5 text-gray-500"><ChevronDown size={14} /></button>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => setCurrent(new Date(year, month - 1, 1))} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors" aria-label="Previous month">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrent(new Date(year, month + 1, 1))} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 transition-colors" aria-label="Next month">
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
                  <div key={di} className="flex items-center justify-center py-0.5">
                    {d !== null ? (
                      <button className={`w-9 h-9 flex items-center justify-center text-sm rounded-full transition-colors
                        ${isToday(d) ? 'border-2 border-blue-500 text-blue-600 font-semibold' : 'text-blue-800 hover:bg-blue-50'}`}>
                        {d}
                      </button>
                    ) : (
                      <div className="w-9 h-9" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* No events */}
          <div className="flex items-center gap-2.5 px-5 py-5 text-gray-400">
            <List size={18} />
            <span className="text-sm">No events for the selected month</span>
          </div>

        </div>
      </div>
    </>
  );
};

/* ── Reminders Panel ────────────────────────────────────────── */
const REMINDER_TABS = [
  { id: 'all',       label: 'All',       count: 0,    badge: true  },
  { id: 'overdue',   label: 'OVERDUE',   count: 0,    badge: true  },
  { id: 'upcoming',  label: 'UPCOMING',  count: null, badge: false },
  { id: 'schedules', label: 'SCHEDULES', count: 0,    badge: true  },
];

const RemindersPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [search,    setSearch]    = useState('');

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-screen w-[480px] bg-white shadow-2xl z-50 flex flex-col">

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
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Find reminders"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

        <hr className="border-gray-200 flex-shrink-0" />

        {/* Tabs */}
        <div className="px-2 flex-shrink-0 border-b border-gray-100">
          <div className="flex">
            {REMINDER_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-3 text-xs font-semibold tracking-wide transition-colors
                  ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none
                    ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-sm" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content — empty state */}
        <div className="flex-1 overflow-y-auto" />

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex-shrink-0">
          <button className="text-sm text-blue-600 hover:underline font-medium">
            + New Reminder
          </button>
        </div>
      </div>
    </>
  );
};

/* ── Navbar ─────────────────────────────────────────────────── */
const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [calendarOpen,  setCalendarOpen]  = useState(false);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const dropdownRef = useRef(null);

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
      <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between flex-shrink-0 relative z-30">
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
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">0</span>
          </button>

          {/* Tips */}
          <button className="relative p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Quick start">
            <Lightbulb size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors" aria-label="user profile menu">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">{initials}</div>
              <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">{user?.name}</span>
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
                <a href="https://help.rentalsaas.com" target="_blank" rel="noopener noreferrer" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <HelpCircle size={18} className="text-gray-400 flex-shrink-0" />Help
                </a>
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
