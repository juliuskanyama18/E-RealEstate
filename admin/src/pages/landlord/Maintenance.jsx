import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Plus, ChevronDown, Search, ChevronRight, X, Home, Layers, CalendarDays, Flag, Eye, Upload } from 'lucide-react';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const PRIORITIES    = ['Low', 'Medium', 'High', 'Urgent'];
const COMPLETED_IN  = [
  { label: 'Last 60 days',  value: '60' },
  { label: 'Last 90 days',  value: '90' },
  { label: 'Last 12 months',value: '365' },
  { label: 'Last 2 years',  value: '730' },
  { label: 'All time',      value: 'All' },
];
const COLUMNS = ['NEW', 'IN PROGRESS', 'COMPLETED'];
const COLUMN_COLORS = {
  'NEW':         'bg-blue-50 border-blue-200 text-blue-700',
  'IN PROGRESS': 'bg-yellow-50 border-yellow-200 text-yellow-700',
  'COMPLETED':   'bg-green-50 border-green-200 text-green-700',
};
const PRIORITY_CHIP = {
  Low:    'bg-gray-100 text-gray-600',
  Medium: 'bg-yellow-100 text-yellow-700',
  High:   'bg-orange-100 text-orange-700',
  Urgent: 'bg-red-100 text-red-700',
};

/* ── circle checkbox ─────────────────────────────────────── */
const CircleCheck = ({ checked, onChange }) => (
  <button type="button" onClick={onChange}
    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
    {checked && <span className="w-2 h-2 rounded-full bg-white" />}
  </button>
);

/* ── radio button ────────────────────────────────────────── */
const RadioBtn = ({ checked, onChange }) => (
  <button type="button" onClick={onChange}
    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'border-blue-600' : 'border-gray-300'}`}>
    {checked && <span className="w-2 h-2 rounded-full bg-blue-600" />}
  </button>
);

/* ── Properties dropdown ─────────────────────────────────── */
const PropertiesDropdown = ({ houses, selected, onSelect, open, onToggle }) => {
  const ref = useRef(null);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onToggle(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onToggle]);

  const filtered = houses.filter(h =>
    `${h.address} ${h.city} ${h.name}`.toLowerCase().includes(search.toLowerCase())
  );
  const allSelected = houses.length > 0 && selected.size === houses.length;

  const toggleAll = () => {
    if (allSelected) onSelect(new Set());
    else onSelect(new Set(houses.map(h => h._id)));
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => onToggle(!open)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors">
        Properties
        {selected.size > 0 && <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">{selected.size}</span>}
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-30">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">Properties</span>
              <button onClick={toggleAll} className="text-xs text-blue-600 hover:underline font-medium">
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
              <Search size={13} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="text-xs outline-none flex-1 bg-transparent placeholder-gray-400" />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No properties found</p>
            ) : filtered.map(h => {
              const checked = selected.has(h._id);
              return (
                <button key={h._id} onClick={() => {
                  const n = new Set(selected);
                  checked ? n.delete(h._id) : n.add(h._id);
                  onSelect(n);
                }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  <CircleCheck checked={checked} onChange={() => {}} />
                  <span className="truncate">{h.address || h.name}<span className="text-gray-400 ml-1 text-xs">{h.city}</span></span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Filter dropdown ─────────────────────────────────────── */
const FilterDropdown = ({ selectedPriorities, onPriorities, completedIn, onCompletedIn, open, onToggle }) => {
  const ref = useRef(null);
  const [search, setSearch] = useState('');
  const [priOpen, setPriOpen] = useState(true);
  const [compOpen, setCompOpen] = useState(true);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onToggle(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onToggle]);

  const totalActive = selectedPriorities.size + (completedIn !== '60' ? 0 : 0);
  const filteredPri = PRIORITIES.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const allPri = selectedPriorities.size === PRIORITIES.length;

  const clearAll = () => { onPriorities(new Set()); onCompletedIn('60'); };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => onToggle(!open)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors">
        Filter
        {selectedPriorities.size > 0 && <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">{selectedPriorities.size}</span>}
        <ChevronDown size={15} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-30">
          {/* header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-800">Filter</span>
              <button onClick={clearAll} className="text-xs text-blue-600 hover:underline font-medium">Clear all</button>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
              <Search size={13} className="text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="text-xs outline-none flex-1 bg-transparent placeholder-gray-400" />
            </div>
          </div>

          {/* Priorities accordion */}
          <div className="border-b border-gray-100">
            <button onClick={() => setPriOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <div className="flex items-center justify-between flex-1 mr-2">
                <span>Priorities</span>
                <button onClick={e => { e.stopPropagation(); onPriorities(allPri ? new Set() : new Set(PRIORITIES)); }}
                  className="text-xs text-blue-600 hover:underline font-medium">
                  {allPri ? 'Deselect all' : 'Select all'}
                </button>
              </div>
              <ChevronRight size={14} className={`transition-transform text-gray-400 ${priOpen ? 'rotate-90' : ''}`} />
            </button>
            {priOpen && (
              <div className="pb-1">
                {filteredPri.map(p => (
                  <button key={p} onClick={() => {
                    const n = new Set(selectedPriorities);
                    n.has(p) ? n.delete(p) : n.add(p);
                    onPriorities(n);
                  }} className="w-full flex items-center gap-3 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    <CircleCheck checked={selectedPriorities.has(p)} onChange={() => {}} />
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Completed in accordion */}
          <div>
            <button onClick={() => setCompOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span>Completed in</span>
              <ChevronRight size={14} className={`transition-transform text-gray-400 ${compOpen ? 'rotate-90' : ''}`} />
            </button>
            {compOpen && (
              <div className="pb-2">
                {COMPLETED_IN.map(opt => (
                  <button key={opt.value} onClick={() => onCompletedIn(opt.value)}
                    className="w-full flex items-center gap-3 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    <RadioBtn checked={completedIn === opt.value} onChange={() => {}} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── New Request Modal ───────────────────────────────────── */
const FormRow = ({ icon, label, htmlFor, children }) => (
  <div className="grid grid-cols-[120px_1fr] items-start gap-3 py-2">
    <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm text-gray-600 pt-1.5">
      <span className="text-gray-400">{icon}</span>
      {label}
    </label>
    <div>{children}</div>
  </div>
);

const inputCls = "w-full border-0 border-b border-gray-200 text-sm py-1 focus:outline-none focus:border-blue-500 bg-transparent";
const selectCls = "w-full border-0 border-b border-gray-200 text-sm py-1 focus:outline-none focus:border-blue-500 bg-transparent";

const emptyReq = { title: '', property: '', status: 'New', dueDate: '', priority: 'Medium', viewableBy: 'Landlord only', description: '' };

const NewRequestModal = ({ onClose, onSave, houses }) => {
  const [form, setForm] = useState(emptyReq);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* close */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <X size={18} />
        </button>

        {/* title input */}
        <div className="px-6 pt-6 pb-3 border-b border-gray-100">
          <input
            value={form.title}
            onChange={e => f('title', e.target.value)}
            placeholder="Enter title"
            maxLength={50}
            className="w-full text-lg font-semibold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
          />
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <form id="maintenanceRequestForm" onSubmit={e => { e.preventDefault(); onSave(form); }}>
            <FormRow icon={<Home size={15} />} label="Property" htmlFor="prop">
              <select id="prop" value={form.property} onChange={e => f('property', e.target.value)} className={selectCls}>
                <option value="">Select property</option>
                {houses.map(h => (
                  <option key={h._id} value={h._id}>{h.address || h.name}{h.city ? `, ${h.city}` : ''}</option>
                ))}
              </select>
            </FormRow>

            <FormRow icon={<Layers size={15} />} label="Status" htmlFor="status">
              <select id="status" value={form.status} onChange={e => f('status', e.target.value)} className={selectCls}>
                {['New', 'In Progress', 'Completed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </FormRow>

            <FormRow icon={<CalendarDays size={15} />} label="Due date" htmlFor="dueDate">
              <input type="date" id="dueDate" value={form.dueDate} onChange={e => f('dueDate', e.target.value)} className={inputCls} />
            </FormRow>

            <FormRow icon={<Flag size={15} />} label="Priority" htmlFor="priority">
              <div className="flex items-center gap-2">
                <select id="priority" value={form.priority} onChange={e => f('priority', e.target.value)} className={selectCls}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_CHIP[form.priority]}`}>{form.priority}</span>
              </div>
            </FormRow>

            <FormRow icon={<Eye size={15} />} label="Viewable by" htmlFor="viewableBy">
              <select id="viewableBy" value={form.viewableBy} onChange={e => f('viewableBy', e.target.value)} className={selectCls}>
                {['Landlord only', 'Landlord and tenant', 'Everyone'].map(v => <option key={v}>{v}</option>)}
              </select>
            </FormRow>

            {/* description tab */}
            <div className="mt-4 border-b border-blue-600 mb-1">
              <span className="text-sm font-medium text-blue-600 pb-1 inline-block">Description</span>
            </div>
            <textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={e => f('description', e.target.value)}
              placeholder="Enter description..."
              maxLength={4000}
              className="w-full text-sm text-gray-700 placeholder-gray-300 focus:outline-none resize-none border-b border-gray-100 py-2 bg-transparent"
            />

            {/* images upload */}
            <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Images</p>
            <div className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
              <Upload size={16} />
              <span className="text-xs">Browse or drag and drop files</span>
            </div>
          </form>
        </div>

        {/* footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          <button type="submit" form="maintenanceRequestForm" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">Save</button>
          <button type="button" onClick={onClose} className="text-sm text-blue-600 hover:underline font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
};

/* ── Kanban column ───────────────────────────────────────── */
const KanbanColumn = ({ title, cards }) => (
  <div className="flex-1 min-w-0">
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-wide mb-3 ${COLUMN_COLORS[title]}`}>
      {title} <span>{cards.length}</span>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[220px] p-3 flex flex-col gap-2">
      {cards.length === 0 ? (
        title === 'IN PROGRESS' ? (
          <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
            <div className="w-20 h-16 mb-3 flex items-end justify-center gap-1">
              <div className="w-6 h-10 bg-gray-200 rounded-sm" />
              <div className="w-8 h-14 bg-gray-300 rounded-sm" />
              <div className="w-6 h-8 bg-gray-200 rounded-sm" />
            </div>
            <span className="text-xs text-gray-400">You have no maintenance requests</span>
          </div>
        ) : <div className="flex-1" />
      ) : cards.map(card => (
        <div key={card.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-800">{card.title}</p>
          {card.property && <p className="text-xs text-gray-400 mt-1">{card.property}</p>}
          {card.dueDate && <p className="text-xs text-gray-400 mt-1">Due: {card.dueDate}</p>}
          {card.priority && (
            <span className={`mt-1.5 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${PRIORITY_CHIP[card.priority]}`}>{card.priority}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

/* ── Main page ───────────────────────────────────────────── */
const Maintenance = () => {
  const [houses, setHouses]     = useState([]);
  const [cards, setCards]       = useState({ 'NEW': [], 'IN PROGRESS': [], 'COMPLETED': [] });
  const [propOpen, setPropOpen]     = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedProps, setSelectedProps]         = useState(new Set());
  const [selectedPriorities, setSelectedPriorities] = useState(new Set());
  const [completedIn, setCompletedIn]             = useState('60');
  const [modal, setModal]       = useState(false);

  useEffect(() => {
    axios.get(`${backendUrl}${API.houses}`)
      .then(r => setHouses(r.data.data || []))
      .catch(() => {});
  }, []);

  const handleSave = (form) => {
    const house = houses.find(h => h._id === form.property);
    const col = form.status === 'In Progress' ? 'IN PROGRESS' : form.status === 'Completed' ? 'COMPLETED' : 'NEW';
    const newCard = {
      id: Date.now(),
      title: form.title,
      property: house ? (house.address || house.name) : '',
      dueDate: form.dueDate,
      priority: form.priority,
      description: form.description,
    };
    setCards(c => ({ ...c, [col]: [newCard, ...c[col]] }));
    setModal(false);
  };

  return (
    <Layout>
      <main className="flex-1 p-6 overflow-y-auto">

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <div className="flex items-center gap-2">
            <PropertiesDropdown
              houses={houses}
              selected={selectedProps}
              onSelect={setSelectedProps}
              open={propOpen}
              onToggle={(v) => { setPropOpen(v); setFilterOpen(false); }}
            />
            <FilterDropdown
              selectedPriorities={selectedPriorities}
              onPriorities={setSelectedPriorities}
              completedIn={completedIn}
              onCompletedIn={setCompletedIn}
              open={filterOpen}
              onToggle={(v) => { setFilterOpen(v); setPropOpen(false); }}
            />
            <button onClick={() => setModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
              <Plus size={15} /> New request
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-start">
          {COLUMNS.map(col => <KanbanColumn key={col} title={col} cards={cards[col]} />)}
        </div>

      </main>

      {modal && (
        <NewRequestModal
          onClose={() => setModal(false)}
          onSave={handleSave}
          houses={houses}
        />
      )}
    </Layout>
  );
};

export default Maintenance;
