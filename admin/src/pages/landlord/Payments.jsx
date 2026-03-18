import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, ChevronDown, FileText, X } from 'lucide-react';
import Layout from '../../components/Layout';
import { backendUrl, API } from '../../config/constants';

const NAVY = '#042238';
const TEAL = '#069ED9';
const FONT = '"Inter", sans-serif';

/* ── Recurring arrows SVG (Monthly Charge icon) ── */
const MonthlyIcon = () => (
  <svg width="60" height="46" viewBox="0 0 60 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g fill={NAVY}>
      <path d="M50.2 18.7C50.8 18.1 51.7 18.2 52.2 18.9L52.2 18.9 59.1 29.3C59.5 29.9 59.4 30.7 58.8 31.1 58.2 31.5 57.4 31.3 57.1 30.7L57.1 30.7 52.6 24.1C52.3 34 45 43 35.2 45.4 27.6 47.2 19.7 44.9 14.3 39.5 13.8 39 13.8 38.2 14.2 37.7 14.7 37.2 15.5 37.2 16 37.7 20.9 42.5 27.8 44.6 34.6 42.9 43.8 40.7 50.4 32 50.1 22.8L44.1 30C43.7 30.6 42.9 30.6 42.4 30.2 41.9 29.8 41.8 29 42.2 28.4L42.2 28.4 50 19C50.1 18.9 50.1 18.8 50.2 18.8ZM24.8 1.3C33-0.7 41.3 2.1 46.8 8.3 47.2 8.8 47.2 9.6 46.7 10.1 46.2 10.6 45.4 10.5 44.9 10 40.1 4.5 32.6 2 25.4 3.7 15.1 6.2 8.2 16.4 9.6 26.8L15.9 19.2C16.3 18.6 17.1 18.6 17.6 19 18.1 19.5 18.2 20.3 17.8 20.8L17.8 20.8 9.8 30.5C9.3 31.1 8.3 31 7.8 30.3L7.8 30.3 0.9 19.9C0.5 19.3 0.6 18.5 1.2 18.1 1.8 17.8 2.6 17.9 2.9 18.5L2.9 18.5 6.9 24.5C6.7 13.7 14.2 3.8 24.8 1.3Z" />
    </g>
  </svg>
);

/* ── Dollar coin SVG (One-Time Charge icon) ── */
const OneTimeIcon = () => (
  <svg viewBox="0 0 48 48" width="48" height="48" fill={NAVY} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M24 .667C36.887.667 47.333 11.114 47.333 24c0 12.888-10.445 23.333-23.333 23.333C11.114 47.333.667 36.887.667 24 .667 11.116 11.116.667 24 .667zm0 2.029C12.236 2.696 2.696 12.236 2.696 24c0 11.766 9.539 21.304 21.304 21.304 11.768 0 21.304-9.536 21.304-21.304 0-11.765-9.538-21.304-21.304-21.304zm0 7.101c.56 0 1.014.454 1.014 1.015v2.113a6.09 6.09 0 015.073 6.003 1.014 1.014 0 11-2.029 0 4.06 4.06 0 00-3.043-3.93v8.072a6.09 6.09 0 010 12.005v2.113a1.014 1.014 0 01-2.03 0v-2.113a6.088 6.088 0 01-5.072-6.003 1.014 1.014 0 112.029 0 4.059 4.059 0 003.043 3.93V24.93a6.088 6.088 0 010-12.005v-2.113c0-.56.455-1.015 1.015-1.015zm1.015 15.345v7.86a4.059 4.059 0 000-7.86zm-2.03-10.144a4.06 4.06 0 000 7.86z" />
  </svg>
);

/* ── Create Charge Modal ── */
const CreateChargeModal = ({ onClose, houses }) => {
  const navigate = useNavigate();
  const [chargeType,    setChargeType]    = useState('MONTHLY');
  const [selectedLease, setSelectedLease] = useState('');

  const handleNext = () => {
    const house = houses.find(h => h._id === selectedLease);
    const state = { leaseId: selectedLease, leaseName: house ? `${house.name}${house.address ? ' — ' + house.address : ''}` : '' };
    onClose();
    if (chargeType === 'MONTHLY') {
      navigate('/payments/charges/monthly', { state });
    } else {
      navigate('/payments/charges/one-time', { state });
    }
  };

  const chargeOptions = [
    {
      value: 'MONTHLY',
      label: 'Monthly Charge',
      description: 'Charges are sent to your tenants on the same day each month. Great for rent, utilities, parking, etc.',
      icon: <MonthlyIcon />,
    },
    {
      value: 'ONE_TIME',
      label: 'One-Time Charge',
      description: 'The charge is sent to your tenants once. Great for fees, security deposits, or pro-rated rent.',
      icon: <OneTimeIcon />,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(4,34,56,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 8,
        width: '100%', maxWidth: 520,
        boxShadow: '0 8px 40px rgba(4,34,56,0.18)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 0',
        }}>
          <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 700, color: NAVY, margin: 0 }}>
            Create Charge
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#8a9ab0', padding: 4, borderRadius: 4,
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = NAVY}
            onMouseLeave={e => e.currentTarget.style.color = '#8a9ab0'}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>

          {/* Lease selector */}
          <div style={{ marginBottom: 6 }}>
            <label style={{
              display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700,
              color: NAVY, marginBottom: 8,
            }}>
              Select the lease you want to charge:
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedLease}
                onChange={e => setSelectedLease(e.target.value)}
                style={{
                  width: '100%', fontFamily: FONT, fontSize: 14, color: NAVY,
                  background: '#fff', border: '1px solid #c8d0db', borderRadius: 4,
                  padding: '9px 36px 9px 12px', appearance: 'none',
                  cursor: 'pointer', outline: 'none',
                }}>
                <option value="" disabled>Select a lease…</option>
                {houses.map(h => (
                  <option key={h._id} value={h._id}>
                    {h.name}{h.address ? ` — ${h.address}` : ''}
                  </option>
                ))}
              </select>
              <svg
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                width="10" height="6" viewBox="0 0 10 6" fill={NAVY}
              >
                <path d="M9.792 0H.208a.233.233 0 00-.181.076.113.113 0 00.003.15l4.792 5.702A.234.234 0 005 6c.073 0 .14-.027.178-.072L9.97.226a.113.113 0 00.003-.15A.233.233 0 009.792 0z" fillRule="evenodd" />
              </svg>
            </div>
          </div>

          <a
            href="#"
            onClick={e => e.preventDefault()}
            style={{
              fontFamily: FONT, fontSize: 13, color: TEAL,
              textDecoration: 'underline', display: 'inline-block', marginBottom: 20,
            }}
          >
            Haven't created the lease yet?
          </a>

          {/* Charge type */}
          <div>
            <label style={{
              display: 'block', fontFamily: FONT, fontSize: 13, fontWeight: 700,
              color: NAVY, marginBottom: 10,
            }}>
              What type of charge?
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chargeOptions.map(opt => (
                <label
                  key={opt.value}
                  onClick={() => setChargeType(opt.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    border: `2px solid ${chargeType === opt.value ? NAVY : '#e4e9f0'}`,
                    borderRadius: 6, padding: '16px 18px',
                    cursor: 'pointer', transition: 'border-color 0.15s',
                    background: chargeType === opt.value ? '#f7f9fc' : '#fff',
                  }}
                >
                  {/* Radio */}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${chargeType === opt.value ? NAVY : '#acb9c8'}`,
                    background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {chargeType === opt.value && (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: NAVY }} />
                    )}
                  </div>

                  {/* Icon */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 60 }}>
                    {opt.icon}
                  </div>

                  {/* Text */}
                  <div>
                    <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>
                      {opt.label}
                    </p>
                    <span style={{ fontFamily: FONT, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                      {opt.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 12,
          padding: '4px 24px 24px',
        }}>
          <button
            onClick={onClose}
            style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: NAVY, background: '#fff',
              border: `2px solid ${NAVY}`, borderRadius: 100,
              padding: '10px 32px', cursor: 'pointer', lineHeight: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f3f8'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNext}
            style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: '#fff', background: NAVY,
              border: `2px solid ${NAVY}`, borderRadius: 100,
              padding: '10px 40px', cursor: 'pointer', lineHeight: 1,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#033A6D'}
            onMouseLeave={e => e.currentTarget.style.background = NAVY}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const statCards = [
  { label: 'Past Due', key: 'pastDue' },
  { label: 'Unpaid',   key: 'unpaid'  },
  { label: 'Charges',  key: 'charges' },
  { label: 'Paid',     key: 'paid'    },
];

/* ── Hand + coin SVG ── */
const HandCoinIcon = () => (
  <svg width="80" height="72" viewBox="0 0 80 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="44" cy="8" r="7" stroke={NAVY} strokeWidth="2.2" fill="none" />
    <circle cx="44" cy="8" r="3.5" fill={TEAL} />
    <circle cx="56" cy="18" r="6" stroke={NAVY} strokeWidth="2.2" fill="none" />
    <circle cx="56" cy="18" r="2.8" fill={TEAL} />
    <path
      d="M10 44 C10 44 8 40 12 38 L28 30 C30 29 33 30 33 33 L33 36 C35 34 39 33 41 35 C43 33 47 33 48 36 C50 34 54 35 54 38 L54 50 C54 57 48 62 41 62 L24 62 C17 62 10 56 10 49 Z"
      stroke={NAVY} strokeWidth="2.2" fill="none" strokeLinejoin="round"
    />
    <path d="M33 36 L33 44" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M41 35 L41 44" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M48 36 L48 44" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="38" cy="26" r="5" stroke={NAVY} strokeWidth="2.2" fill="none" />
    <circle cx="38" cy="26" r="2.2" fill={TEAL} />
  </svg>
);

/* ── Filter icon SVGs (from TurboTenant HTML) ── */
const KeyFilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="M21 2l-9.6 9.6"/>
    <path d="M15.5 7.5l3 3L22 7l-3-3"/>
  </svg>
);

const LeaseFilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 22 25" fill="currentColor">
    <path fillRule="evenodd" d="m19.85 13.943 1.937 2.152a.733.733 0 0 1-.067 1.033l-6.909 6.221a.754.754 0 0 1-.356.18l-2.781.556a.714.714 0 0 1-.828-.92l.844-2.708a.754.754 0 0 1 .215-.335l6.91-6.221a.733.733 0 0 1 1.034.042ZM13.318 0c.21 0 .413.069.577.193l.094.08 4.39 4.344.013.012c.02.02.038.042.056.064l-.068-.076a.928.928 0 0 1 .26.503l.002.012.002.017.008.115v7.238a.932.932 0 0 1-.943.922.936.936 0 0 1-.936-.806l-.008-.116V6.185h-4.18a.936.936 0 0 1-.935-.805l-.007-.116V1.842h-9.09v19.873h6.374c.48 0 .878.351.936.805l.007.116a.93.93 0 0 1-.825.914l-.118.007H1.61a.936.936 0 0 1-.936-.805l-.007-.116V.921c0-.47.36-.857.825-.914L1.61 0h11.709Zm.86 20.552-.804.726-.191.613.633-.126.812-.733-.45-.48Zm3.258-2.932-1.855 1.67.449.48 1.838-1.655-.432-.495Zm-9.277-.248c.521 0 .943.412.943.921a.93.93 0 0 1-.824.914l-.119.007H4.537a.932.932 0 0 1-.943-.921c0-.47.36-.857.825-.914l.118-.007H8.16Zm11.035-1.335-.357.32.433.495.364-.327-.44-.488ZM8.16 14.477c.521 0 .943.412.943.92a.93.93 0 0 1-.824.915l-.119.007H4.537a.932.932 0 0 1-.943-.921c0-.47.36-.857.825-.914l.118-.008H8.16Zm4.391-4.343c.52 0 .943.412.943.92a.93.93 0 0 1-.825.915l-.118.007H4.537a.932.932 0 0 1-.943-.921c0-.47.36-.857.825-.914l.118-.007h8.014Zm0-2.896c.52 0 .943.413.943.921a.93.93 0 0 1-.825.915l-.118.007H4.537a.932.932 0 0 1-.943-.922c0-.47.36-.857.825-.914l.118-.007h8.014Zm-4.39-2.895c.52 0 .942.412.942.921a.93.93 0 0 1-.824.914l-.119.007H4.537a.932.932 0 0 1-.943-.92c0-.47.36-.858.825-.915l.118-.007H8.16ZM13.53 2.44v1.901h1.922L13.53 2.441Z" />
  </svg>
);

const CoinFilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 22 22" fill="currentColor">
    <path d="M11 .333C16.891.333 21.667 5.11 21.667 11c0 5.892-4.775 10.667-10.667 10.667C5.11 21.667.333 16.89.333 11 .333 5.11 5.11.333 11 .333zm0 1.447a9.22 9.22 0 000 18.44A9.22 9.22 0 0020.22 11 9.22 9.22 0 0011 1.78zM11 4.4c.369 0 .673.276.718.633l.005.09v.721a2.985 2.985 0 012.26 2.895.723.723 0 01-1.44.09l-.006-.09c0-.587-.33-1.097-.814-1.356v2.981a2.985 2.985 0 010 5.79v.72a.723.723 0 01-1.44.091l-.006-.09v-.721a2.984 2.984 0 01-2.26-2.895.723.723 0 111.446 0c0 .587.33 1.097.813 1.356v-2.981a2.984 2.984 0 010-5.79v-.72c0-.4.325-.724.724-.724zm.723 7.503v2.712a1.536 1.536 0 000-2.712zM9.463 8.74c0 .587.33 1.098.813 1.356V7.384a1.537 1.537 0 00-.813 1.356z" />
  </svg>
);

const CalendarFilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M5.054 0c.26 0 .47.21.47.47v.839h4.951V.471c0-.26.211-.471.471-.471h1.964c.26 0 .471.21.471.47v.839h2.148a.47.47 0 01.463.386L16 1.78v13.75c0 .26-.21.47-.47.47H.47a.47.47 0 01-.47-.47V1.78c0-.26.21-.47.47-.47l2.148-.001V.471C2.619.21 2.83 0 3.09 0h1.964zm10.004 5.524H.941v9.535H15.06l-.001-9.535zm-4.112.369c.26 0 .47.21.47.47v.839h2.804a.47.47 0 01.463.386l.008.085c0 .26-.211.47-.471.47h-2.804V9.82l2.804.001a.47.47 0 01.463.386l.008.085c0 .26-.211.47-.471.47h-2.804v1.677h2.804a.47.47 0 01.463.387l.008.084c0 .26-.211.471-.471.471h-2.804v.839a.47.47 0 01-.385.463l-.085.008a.47.47 0 01-.47-.471l-.001-.839H8.143v.839a.47.47 0 01-.386.463l-.084.008a.47.47 0 01-.471-.471v-.839H4.869v.839a.47.47 0 01-.385.463l-.085.008a.47.47 0 01-.47-.471l-.001-.839H1.78a.47.47 0 01-.463-.386l-.008-.085c0-.26.211-.47.471-.47l2.148-.001v-1.677H1.78a.47.47 0 01-.463-.386l-.008-.084c0-.26.211-.471.471-.471l2.148-.001V8.143H1.78a.47.47 0 01-.463-.386l-.008-.084c0-.26.211-.471.471-.471h2.148v-.839a.47.47 0 01.386-.463l.085-.007c.26 0 .47.21.47.47v.839h2.333v-.839a.47.47 0 01.386-.463l.085-.007c.26 0 .47.21.47.47v.839h2.332v-.839a.47.47 0 01.387-.463zm-3.744 4.869H4.869v1.677h2.333v-1.677zm3.273 0H8.143v1.677h2.332v-1.677zM7.202 8.143H4.869V9.82h2.333V8.143zm3.273 0H8.143V9.82h2.332V8.143zM2.618 2.25H.941v2.333h14.117V2.251l-1.677-.001v.84c0 .26-.21.47-.47.47h-1.965a.47.47 0 01-.47-.47l-.001-.84H5.524v.84c0 .26-.21.47-.47.47H3.09a.47.47 0 01-.471-.47l-.001-.84zM4.583.941H3.56V2.62h1.023V.94zm7.857 0h-1.023V2.62h1.023V.94z" fillRule="evenodd" />
  </svg>
);

/* ── No charges found icon (folder + magnifier) ── */
const NoChargesIcon = () => (
  <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Folder body */}
    <path d="M4 18C4 15.8 5.8 14 8 14H28L34 20H64C66.2 20 68 21.8 68 24V54C68 56.2 66.2 58 64 58H8C5.8 58 4 56.2 4 54V18Z"
      stroke={NAVY} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
    {/* Folder tab */}
    <path d="M4 18H28L34 14H8C5.8 14 4 15.8 4 18Z"
      fill="#e4e9f0" stroke={NAVY} strokeWidth="2.5" strokeLinejoin="round" />
    {/* Magnifier circle */}
    <circle cx="44" cy="40" r="10" stroke={TEAL} strokeWidth="2.5" fill="none" />
    {/* Magnifier handle */}
    <line x1="51" y1="48" x2="58" y2="56" stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/* ── Filter constants ── */
const CATEGORIES = ['Rent', 'Late Fee', 'Security Deposit', 'Utility Charge', 'NSF Fee', 'Other'];

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All Statuses' },
  { value: 'PAST_DUE', label: 'Past Due'     },
  { value: 'UNPAID',   label: 'Unpaid'       },
  { value: 'PAID',     label: 'Paid'         },
];

const DATE_OPTIONS = [
  { value: 'all',           label: 'All Time'     },
  { value: 'CURRENT_MONTH', label: 'This Month'   },
  { value: 'LAST_MONTH',    label: 'Last Month'   },
  { value: 'YTD',           label: 'Year to Date' },
  { value: 'LAST_YEAR',     label: 'Last Year'    },
  { value: 'CUSTOM',        label: 'Custom'       },
];

const STATUS_LABELS = { all: 'All Statuses', PAST_DUE: 'Past Due', UNPAID: 'Unpaid', PAID: 'Paid' };
const DATE_LABELS   = { all: 'All Time', CURRENT_MONTH: 'This Month', LAST_MONTH: 'Last Month', YTD: 'Year to Date', LAST_YEAR: 'Last Year', CUSTOM: 'Custom' };

/* ── Radio bullet ── */
const RadioDot = ({ active }) => (
  <div style={{
    width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
    border: `2px solid ${active ? NAVY : '#c8d0db'}`,
    background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: NAVY }} />}
  </div>
);

const Payments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* Initialise from URL so back/forward and direct links work */
  const [tab,    setTabState]    = useState(searchParams.get('view')   || 'overview');
  const [period, setPeriodState] = useState(searchParams.get('period') || 'month');

  const [actionsOpen,      setActionsOpen]      = useState(false);
  const [createChargeOpen, setCreateChargeOpen] = useState(false);
  const [houses,           setHouses]           = useState([]);
  const [records,          setRecords]          = useState([]);
  const [loadingRecords,   setLoadingRecords]   = useState(true);
  const dropdownRef  = useRef(null);
  const filterBarRef = useRef(null);

  /* Charge filters — status & dateRange live in the URL, rest stay local */
  const [chargeFilters, setChargeFilters] = useState({
    status:    searchParams.get('status')     || 'all',
    dateRange: searchParams.get('dateFilter') || 'CURRENT_MONTH',
    rentals:   [],
    leases:    [],
    categories:[],
  });
  const [openFilter,     setOpenFilter]     = useState(null);
  const [leaseSearch,    setLeaseSearch]    = useState('');
  const [chargesPerPage, setChargesPerPage] = useState(50);

  const now         = new Date();
  const month       = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const year        = String(now.getFullYear());
  const periodLabel = period === 'month' ? month : year;

  /* Helper — build the charges search params object */
  const chargesParams = (status, dateRange) => {
    const p = { view: 'charges', dateFilter: dateRange };
    if (status !== 'all') p.status = status;
    return p;
  };

  /* Tab switcher — updates URL */
  const setTab = (newTab) => {
    setTabState(newTab);
    if (newTab === 'overview') {
      setSearchParams({ view: 'overview', period });
    } else {
      setSearchParams(chargesParams(chargeFilters.status, chargeFilters.dateRange));
    }
  };

  /* Period switcher — updates URL */
  const setPeriod = (newPeriod) => {
    setPeriodState(newPeriod);
    setSearchParams({ view: 'overview', period: newPeriod });
  };

  /* Click stat card → charges tab with pre-applied filters */
  const handleStatCardClick = (key) => {
    const statusMap = { pastDue: 'PAST_DUE', unpaid: 'UNPAID', charges: 'all', paid: 'PAID' };
    const newStatus  = statusMap[key] ?? 'all';
    const newDate    = period === 'month' ? 'CURRENT_MONTH' : 'YTD';
    setChargeFilters(f => ({ ...f, status: newStatus, dateRange: newDate }));
    setTabState('charges');
    setSearchParams(chargesParams(newStatus, newDate));
  };

  /* Status filter change — updates URL */
  const setStatus = (newStatus) => {
    setChargeFilters(f => ({ ...f, status: newStatus }));
    setSearchParams(chargesParams(newStatus, chargeFilters.dateRange));
    setOpenFilter(null);
  };

  /* Date filter change — updates URL */
  const setDateRange = (newDate) => {
    setChargeFilters(f => ({ ...f, dateRange: newDate }));
    setSearchParams(chargesParams(chargeFilters.status, newDate));
    setOpenFilter(null);
  };

  const resetFilters = () => {
    setChargeFilters({ status: 'all', dateRange: 'CURRENT_MONTH', rentals: [], leases: [], categories: [] });
    setLeaseSearch('');
    setOpenFilter(null);
    setSearchParams({ view: 'charges', dateFilter: 'CURRENT_MONTH' });
  };

  /* fetch houses */
  useEffect(() => {
    axios.get(`${backendUrl}${API.houses}`)
      .then(r => setHouses(r.data.data || []))
      .catch(() => {});
  }, []);

  /* fetch rent records */
  useEffect(() => {
    setLoadingRecords(true);
    axios.get(`${backendUrl}${API.payments}`)
      .then(r => setRecords(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingRecords(false));
  }, []);

  /* close actions dropdown on outside click */
  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* close filter dropdowns on outside click */
  useEffect(() => {
    const handler = e => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const base = { fontFamily: FONT, fontSize: 14, color: NAVY, lineHeight: 1.5 };

  const dropdownItem = {
    display: 'block', width: '100%', textAlign: 'left',
    fontFamily: FONT, fontSize: 14, fontWeight: 500, color: NAVY,
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '10px 20px', lineHeight: 1.4,
  };

  /* Filter button style helper */
  const filterBtnStyle = (isActive) => ({
    fontFamily: FONT, fontSize: 13, fontWeight: 600,
    color: isActive ? '#fff' : NAVY,
    background: isActive ? NAVY : '#fff',
    border: `1px solid ${isActive ? NAVY : '#c8d0db'}`,
    borderRadius: 100, padding: '7px 13px', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
    lineHeight: 1, whiteSpace: 'nowrap', outline: 'none',
  });

  /* Filter dropdown panel style */
  const filterPanel = {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
    background: '#fff', border: '1px solid #e4e9f0',
    borderRadius: 6, boxShadow: '0 4px 16px rgba(4,34,56,0.12)',
    zIndex: 200, padding: '8px 0',
  };

  const filteredLeases = houses.filter(h =>
    !leaseSearch || h.name.toLowerCase().includes(leaseSearch.toLowerCase()) ||
    (h.address || '').toLowerCase().includes(leaseSearch.toLowerCase())
  );

  /* ── Currency formatter ── */
  const fmt = (n) => `TZS ${Number(n || 0).toLocaleString()}`;

  /* ── Date keys ── */
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate   = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey    = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const currentYearKey  = String(now.getFullYear());
  const lastYearKey     = String(now.getFullYear() - 1);

  /* ── Overview stats (scoped to selected period) ── */
  const periodRecords = records.filter(r => {
    if (period === 'month') return r.month === currentMonthKey;
    if (period === 'year')  return r.month?.startsWith(currentYearKey);
    return true;
  });
  const overviewStats = {
    paid:    periodRecords.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0),
    unpaid:  periodRecords.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0),
    pastDue: periodRecords.filter(r => r.status === 'overdue').reduce((s, r) => s + r.amount, 0),
    charges: periodRecords.reduce((s, r) => s + r.amount, 0),
  };
  const statValues = {
    pastDue: overviewStats.pastDue,
    unpaid:  overviewStats.unpaid,
    charges: overviewStats.charges,
    paid:    overviewStats.paid,
  };

  /* ── Filtered charges for the Charges tab ── */
  const filteredCharges = records.filter(r => {
    const dr = chargeFilters.dateRange;
    const inDate =
      dr === 'CURRENT_MONTH' ? r.month === currentMonthKey :
      dr === 'LAST_MONTH'    ? r.month === lastMonthKey    :
      dr === 'YTD'           ? r.month?.startsWith(currentYearKey) :
      dr === 'LAST_YEAR'     ? r.month?.startsWith(lastYearKey) : true;
    const st = chargeFilters.status;
    const inStatus =
      st === 'PAID'     ? r.status === 'paid'    :
      st === 'UNPAID'   ? r.status === 'pending' :
      st === 'PAST_DUE' ? r.status === 'overdue' : true;
    const inRental =
      chargeFilters.rentals.length === 0 ||
      chargeFilters.rentals.includes(r.house?._id);
    return inDate && inStatus && inRental;
  }).slice(0, chargesPerPage);

  return (
    <Layout>
      <div style={{ ...base, minHeight: '100vh', background: '#f5f6f8', paddingBottom: 50 }}>

        {/* ── Page header ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e4e9f0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 24, paddingBottom: 16 }}>
              <h1 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: NAVY, margin: 0, lineHeight: 1.2 }}>
                Payments
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                {/* Actions dropdown */}
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  <button
                    onClick={() => setActionsOpen(o => !o)}
                    style={{
                      fontFamily: FONT, fontSize: 13, fontWeight: 700,
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: NAVY, background: '#fff',
                      border: `2px solid ${NAVY}`, borderRadius: 100,
                      padding: '8px 18px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                      lineHeight: 1,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f3f8'}
                    onMouseLeave={e => e.currentTarget.style.background = actionsOpen ? '#f0f3f8' : '#fff'}
                  >
                    Actions
                    <ChevronDown
                      size={14} strokeWidth={2.5}
                      style={{ transform: actionsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                    />
                  </button>

                  {actionsOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                      background: '#fff', border: '1px solid #e4e9f0',
                      borderRadius: 6, boxShadow: '0 4px 16px rgba(4,34,56,0.12)',
                      minWidth: 180, zIndex: 100, overflow: 'hidden',
                    }}>
                      {[
                        { label: 'Record payment', path: '/payments/record' },
                        { label: 'Add credit',     path: null               },
                      ].map(item => (
                        <button
                          key={item.label}
                          style={dropdownItem}
                          onClick={() => { setActionsOpen(false); if (item.path) navigate(item.path); }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create Charge button */}
                <button
                  onClick={() => setCreateChargeOpen(true)}
                  style={{
                    fontFamily: FONT, fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: '#fff', background: NAVY,
                    border: `2px solid ${NAVY}`, borderRadius: 100,
                    padding: '8px 20px', cursor: 'pointer', lineHeight: 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#033A6D'}
                  onMouseLeave={e => e.currentTarget.style.background = NAVY}
                >
                  Create Charge
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex' }}>
              {[{ key: 'overview', label: 'Overview' }, { key: 'charges', label: 'Charges' }].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    fontFamily: FONT, fontSize: 13, fontWeight: 600,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    color: tab === t.key ? TEAL : '#8a9ab0',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '10px 16px 12px',
                    borderBottom: tab === t.key ? `3px solid ${TEAL}` : '3px solid transparent',
                    marginBottom: -1, lineHeight: 1,
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = NAVY; }}
                  onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = '#8a9ab0'; }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>

          {/* ── OVERVIEW tab ── */}
          {tab === 'overview' && (
            <>
              {/* Stats card */}
              <div style={{
                background: '#fff', border: '1px solid #e4e9f0', borderRadius: 6,
                padding: '24px 28px', marginBottom: 20,
                boxShadow: '0 1px 4px rgba(4,34,56,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h2 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>
                    {periodLabel}
                  </h2>
                  <div style={{ display: 'flex', borderRadius: 4, border: '1px solid #c8d0db', overflow: 'hidden' }}>
                    {[{ key: 'month', label: 'Month-to-date' }, { key: 'year', label: 'Year-to-date' }].map((p, i) => (
                      <button
                        key={p.key}
                        onClick={() => setPeriod(p.key)}
                        style={{
                          fontFamily: FONT, fontSize: 13, fontWeight: 600,
                          color: period === p.key ? '#fff' : '#6b7280',
                          background: period === p.key ? NAVY : '#fff',
                          border: 'none', borderLeft: i > 0 ? '1px solid #c8d0db' : 'none',
                          padding: '7px 16px', cursor: 'pointer', lineHeight: 1,
                          transition: 'background 0.15s, color 0.15s',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {statCards.map(card => (
                    <div
                      key={card.key}
                      onClick={() => handleStatCardClick(card.key)}
                      style={{
                        background: NAVY, borderRadius: 4, padding: '18px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer', transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <div>
                        <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: TEAL, marginBottom: 6 }}>
                          {card.label}
                        </div>
                        <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                          {fmt(statValues[card.key])}
                        </div>
                      </div>
                      <ChevronRight size={18} color="#4da6d0" strokeWidth={2} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rent roll card */}
              <div style={{
                background: '#fff', border: '1px solid #e4e9f0', borderRadius: 6,
                padding: '24px 28px', boxShadow: '0 1px 4px rgba(4,34,56,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, background: '#eef6fb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={20} color={TEAL} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: NAVY, margin: '0 0 4px' }}>
                      Rent roll report
                    </h3>
                    <p style={{ fontFamily: FONT, fontSize: 13, color: '#6b7280', margin: 0, maxWidth: 520, lineHeight: 1.5 }}>
                      A rent roll provides an itemized report of each unit's occupancy status and income.{' '}
                      <span style={{ color: TEAL, cursor: 'pointer', textDecoration: 'underline' }}>Learn more</span>
                    </p>
                  </div>
                </div>
                <button
                  style={{
                    fontFamily: FONT, fontSize: 13, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    color: '#fff', background: TEAL, border: 'none', borderRadius: 100,
                    padding: '10px 22px', cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: 1, flexShrink: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#0589bf'}
                  onMouseLeave={e => e.currentTarget.style.background = TEAL}
                >
                  Generate &amp; Export CSV
                </button>
              </div>
            </>
          )}

          {/* ── CHARGES tab ── */}
          {tab === 'charges' && (
            <div style={{
              background: '#fff', border: '1px solid #e4e9f0', borderRadius: 6,
              boxShadow: '0 1px 4px rgba(4,34,56,0.06)',
            }}>
              {/* Section title */}
              <div style={{ padding: '20px 24px 16px' }}>
                <h2 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: NAVY, margin: 0 }}>
                  Sent Charges
                </h2>
              </div>

              {/* Filter bar */}
              <div style={{ padding: '0 24px 16px' }} ref={filterBarRef}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

                  {/* Rentals dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setOpenFilter(openFilter === 'rentals' ? null : 'rentals')}
                      style={filterBtnStyle(chargeFilters.rentals.length > 0)}
                    >
                      <KeyFilterIcon />
                      {chargeFilters.rentals.length > 0
                        ? `${chargeFilters.rentals.length} Rental${chargeFilters.rentals.length > 1 ? 's' : ''}`
                        : 'Rentals'}
                    </button>

                    {openFilter === 'rentals' && (
                      <div style={{ ...filterPanel, minWidth: 260 }}>
                        {houses.length === 0 ? (
                          <div style={{ padding: '16px', fontFamily: FONT, fontSize: 13, color: '#8a9ab0', textAlign: 'center' }}>
                            No properties found
                          </div>
                        ) : (
                          houses.map(h => (
                            <label
                              key={h._id}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <input
                                type="checkbox"
                                checked={chargeFilters.rentals.includes(h._id)}
                                onChange={e => setChargeFilters(f => ({
                                  ...f,
                                  rentals: e.target.checked
                                    ? [...f.rentals, h._id]
                                    : f.rentals.filter(id => id !== h._id),
                                }))}
                                style={{ accentColor: NAVY, width: 14, height: 14, cursor: 'pointer' }}
                              />
                              <span style={{ fontFamily: FONT, fontSize: 13, color: NAVY }}>
                                {h.address ? h.address : h.name}{h.city ? `, ${h.city}` : ''}
                              </span>
                            </label>
                          ))
                        )}

                        <div style={{ borderTop: '1px solid #e4e9f0', padding: '10px 16px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => setOpenFilter(null)}
                            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', background: NAVY, border: 'none', borderRadius: 100, padding: '9px 0', cursor: 'pointer', width: '100%' }}
                          >
                            Apply Filter
                          </button>
                          <button
                            onClick={() => { setChargeFilters(f => ({ ...f, rentals: [] })); setOpenFilter(null); }}
                            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEAL, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* All Leases dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setOpenFilter(openFilter === 'leases' ? null : 'leases'); setLeaseSearch(''); }}
                      style={filterBtnStyle(chargeFilters.leases.length > 0)}
                    >
                      <LeaseFilterIcon />
                      {chargeFilters.leases.length > 0
                        ? `${chargeFilters.leases.length} Lease${chargeFilters.leases.length > 1 ? 's' : ''}`
                        : 'All Leases'}
                    </button>

                    {openFilter === 'leases' && (
                      <div style={{ ...filterPanel, minWidth: 270 }}>
                        {/* Search */}
                        <div style={{ padding: '4px 12px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #c8d0db', borderRadius: 4, padding: '6px 10px', gap: 6 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a9ab0" strokeWidth="2">
                              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input
                              value={leaseSearch}
                              onChange={e => setLeaseSearch(e.target.value)}
                              placeholder="Search..."
                              autoFocus
                              style={{ border: 'none', outline: 'none', fontFamily: FONT, fontSize: 13, color: NAVY, width: '100%', background: 'transparent' }}
                            />
                          </div>
                        </div>

                        {/* All Leases radio */}
                        <div
                          onClick={() => setChargeFilters(f => ({ ...f, leases: [] }))}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <RadioDot active={chargeFilters.leases.length === 0} />
                          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY }}>All Leases</span>
                        </div>

                        {filteredLeases.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px', gap: 8 }}>
                            <div style={{ flex: 1, height: 1, background: '#e4e9f0' }} />
                            <span style={{ fontFamily: FONT, fontSize: 11, color: '#8a9ab0', fontWeight: 700, letterSpacing: '0.04em' }}>OR</span>
                            <div style={{ flex: 1, height: 1, background: '#e4e9f0' }} />
                          </div>
                        )}

                        {filteredLeases.map(h => (
                          <label
                            key={h._id}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <input
                              type="checkbox"
                              checked={chargeFilters.leases.includes(h._id)}
                              onChange={e => setChargeFilters(f => ({
                                ...f,
                                leases: e.target.checked
                                  ? [...f.leases, h._id]
                                  : f.leases.filter(id => id !== h._id),
                              }))}
                              style={{ accentColor: NAVY, width: 14, height: 14, cursor: 'pointer' }}
                            />
                            <span style={{ fontFamily: FONT, fontSize: 13, color: NAVY }}>
                              {h.name}{h.address ? ` — ${h.address}` : ''}
                            </span>
                          </label>
                        ))}

                        <div style={{ borderTop: '1px solid #e4e9f0', padding: '10px 16px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => setOpenFilter(null)}
                            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', background: NAVY, border: 'none', borderRadius: 100, padding: '9px 0', cursor: 'pointer', width: '100%' }}
                          >
                            Apply Filter
                          </button>
                          <button
                            onClick={() => { setChargeFilters(f => ({ ...f, leases: [] })); setOpenFilter(null); }}
                            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEAL, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* All Categories dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setOpenFilter(openFilter === 'categories' ? null : 'categories')}
                      style={filterBtnStyle(chargeFilters.categories.length > 0)}
                    >
                      <CoinFilterIcon />
                      {chargeFilters.categories.length > 0
                        ? chargeFilters.categories.length === 1
                          ? chargeFilters.categories[0]
                          : `${chargeFilters.categories.length} Categories`
                        : 'All Categories'}
                    </button>

                    {openFilter === 'categories' && (
                      <div style={{ ...filterPanel, minWidth: 220 }}>
                        {/* All Categories radio */}
                        <div
                          onClick={() => setChargeFilters(f => ({ ...f, categories: [] }))}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                          <RadioDot active={chargeFilters.categories.length === 0} />
                          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: NAVY }}>All Categories</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 16px', gap: 8 }}>
                          <div style={{ flex: 1, height: 1, background: '#e4e9f0' }} />
                          <span style={{ fontFamily: FONT, fontSize: 11, color: '#8a9ab0', fontWeight: 700, letterSpacing: '0.04em' }}>OR</span>
                          <div style={{ flex: 1, height: 1, background: '#e4e9f0' }} />
                        </div>

                        {CATEGORIES.map(cat => (
                          <label
                            key={cat}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <input
                              type="checkbox"
                              checked={chargeFilters.categories.includes(cat)}
                              onChange={e => setChargeFilters(f => ({
                                ...f,
                                categories: e.target.checked
                                  ? [...f.categories, cat]
                                  : f.categories.filter(c => c !== cat),
                              }))}
                              style={{ accentColor: NAVY, width: 14, height: 14, cursor: 'pointer' }}
                            />
                            <span style={{ fontFamily: FONT, fontSize: 13, color: NAVY }}>{cat}</span>
                          </label>
                        ))}

                        <div style={{ borderTop: '1px solid #e4e9f0', padding: '10px 16px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => setOpenFilter(null)}
                            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#fff', background: NAVY, border: 'none', borderRadius: 100, padding: '9px 0', cursor: 'pointer', width: '100%' }}
                          >
                            Apply Filter
                          </button>
                          <button
                            onClick={() => { setChargeFilters(f => ({ ...f, categories: [] })); setOpenFilter(null); }}
                            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: TEAL, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
                      style={filterBtnStyle(chargeFilters.status !== 'all')}
                    >
                      <CoinFilterIcon />
                      {STATUS_LABELS[chargeFilters.status]}
                    </button>

                    {openFilter === 'status' && (
                      <div style={{ ...filterPanel, minWidth: 180 }}>
                        {STATUS_OPTIONS.map(opt => (
                          <div
                            key={opt.value}
                            onClick={() => setStatus(opt.value)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <RadioDot active={chargeFilters.status === opt.value} />
                            <span style={{ fontFamily: FONT, fontSize: 13, color: NAVY }}>{opt.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date range dropdown */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setOpenFilter(openFilter === 'date' ? null : 'date')}
                      style={filterBtnStyle(chargeFilters.dateRange !== 'all')}
                    >
                      <CalendarFilterIcon />
                      {DATE_LABELS[chargeFilters.dateRange]}
                    </button>

                    {openFilter === 'date' && (
                      <div style={{ ...filterPanel, minWidth: 180 }}>
                        {DATE_OPTIONS.map(opt => (
                          <div
                            key={opt.value}
                            onClick={() => setDateRange(opt.value)}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f6f8'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <RadioDot active={chargeFilters.dateRange === opt.value} />
                            <span style={{ fontFamily: FONT, fontSize: 13, color: NAVY }}>{opt.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reset all */}
                  <button
                    onClick={resetFilters}
                    style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: NAVY, background: 'none', border: 'none', cursor: 'pointer', padding: '7px 4px', lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = TEAL}
                    onMouseLeave={e => e.currentTarget.style.color = NAVY}
                  >
                    RESET ALL
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #e4e9f0' }} />

              {loadingRecords ? (
                <div style={{ padding: '60px 28px', textAlign: 'center', color: '#8a9ab0', fontFamily: FONT, fontSize: 13 }}>
                  Loading…
                </div>
              ) : filteredCharges.length === 0 ? (
                /* Empty state */
                <div style={{ padding: '60px 28px 52px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                    <NoChargesIcon />
                  </div>
                  <h3 style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: NAVY, margin: '0 0 8px', lineHeight: 1.3 }}>
                    No charges found
                  </h3>
                  <p style={{ fontFamily: FONT, fontSize: 13, color: TEAL, margin: 0 }}>
                    Please adjust filters
                  </p>
                </div>
              ) : (
                /* Records table */
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONT, fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f5f6f8', borderBottom: '1px solid #e4e9f0' }}>
                        {['Tenant', 'Property', 'Month', 'Due Date', 'Paid Date', 'Amount', 'Status'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: NAVY, fontSize: 12, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCharges.map((r, i) => {
                        const statusColor =
                          r.status === 'paid'    ? { bg: '#ecfdf5', text: '#059669' } :
                          r.status === 'overdue' ? { bg: '#fff1f2', text: '#e11d48' } :
                                                   { bg: '#fffbeb', text: '#d97706' };
                        const statusLabel =
                          r.status === 'paid' ? 'Paid' : r.status === 'overdue' ? 'Overdue' : 'Pending';
                        return (
                          <tr key={r._id} style={{ borderBottom: '1px solid #e4e9f0', background: i % 2 === 0 ? '#fff' : '#fafbfc' }}>
                            <td style={{ padding: '12px 16px', color: NAVY, fontWeight: 600 }}>
                              {r.tenant?.name || '—'}
                              {r.tenant?.email && <div style={{ fontSize: 11, color: '#8a9ab0', fontWeight: 400 }}>{r.tenant.email}</div>}
                            </td>
                            <td style={{ padding: '12px 16px', color: NAVY }}>
                              {r.house?.name || '—'}
                              {r.house?.address && <div style={{ fontSize: 11, color: '#8a9ab0' }}>{r.house.address}</div>}
                            </td>
                            <td style={{ padding: '12px 16px', color: NAVY }}>{r.month || '—'}</td>
                            <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                              {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                              {r.paidDate ? new Date(r.paidDate).toLocaleDateString() : '—'}
                            </td>
                            <td style={{ padding: '12px 16px', color: NAVY, fontWeight: 700 }}>
                              {fmt(r.amount)}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: statusColor.bg, color: statusColor.text }}>
                                {statusLabel}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination footer */}
              <div style={{ borderTop: '1px solid #e4e9f0', padding: '12px 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: FONT, fontSize: 13, color: NAVY }}>Show</span>
                <div style={{ position: 'relative' }}>
                  <select
                    value={chargesPerPage}
                    onChange={e => setChargesPerPage(Number(e.target.value))}
                    style={{
                      fontFamily: FONT, fontSize: 13, color: NAVY,
                      border: '1px solid #c8d0db', borderRadius: 4,
                      padding: '5px 28px 5px 10px', appearance: 'none',
                      cursor: 'pointer', outline: 'none', background: '#fff',
                    }}
                  >
                    {[25, 50, 100, 500].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    width="10" height="6" viewBox="0 0 10 6" fill={NAVY}>
                    <path d="M9.792 0H.208a.233.233 0 00-.181.076.113.113 0 00.003.15l4.792 5.702A.234.234 0 005 6c.073 0 .14-.027.178-.072L9.97.226a.113.113 0 00.003-.15A.233.233 0 009.792 0z" fillRule="evenodd" />
                  </svg>
                </div>
                <span style={{ fontFamily: FONT, fontSize: 13, color: NAVY }}>charges per page</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {createChargeOpen && <CreateChargeModal onClose={() => setCreateChargeOpen(false)} houses={houses} />}
    </Layout>
  );
};

export default Payments;
