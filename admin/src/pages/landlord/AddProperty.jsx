import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';
import { backendUrl, API } from '../../config/constants';

/* ── Type constants ─────────────────────────────────────────── */
const SINGLE_UNIT_TYPES = ['SINGLE_FAMILY', 'TOWNHOUSE', 'CONDO'];
const MULTI_UNIT_TYPES  = ['MULTI_FAMILY', 'APARTMENT'];

const TZ_REGIONS = [
  'Arusha','Coast (Pwani)','Dar es Salaam','Dodoma','Geita','Iringa','Kagera',
  'Katavi','Kigoma','Kilimanjaro','Lindi','Manyara','Mara','Mbeya','Morogoro',
  'Mtwara','Mwanza','Njombe','Pemba North','Pemba South','Rukwa','Ruvuma',
  'Shinyanga','Simiyu','Singida','Songwe','Tabora','Tanga',
  'Unguja North','Unguja South','Zanzibar City',
];

const OTHER_SUBTYPES = [
  { value: 'COMMERCIAL',        label: 'Commercial' },
  { value: 'GARAGE',            label: 'Garage' },
  { value: 'MANUFACTURED',      label: 'Manufactured' },
  { value: 'MIXED_USE',         label: 'Mixed-Use' },
  { value: 'MOBILE_HOME_RV_PARK', label: 'Mobile Home / RV Park' },
  { value: 'OFFICE',            label: 'Office' },
  { value: 'PARKING',           label: 'Parking' },
  { value: 'STORAGE',           label: 'Storage' },
  { value: 'OTHER',             label: 'Other (specify)' },
];

/* ── SVG chevron (custom select arrow) ─────────────────────── */
const Chevron = () => (
  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" width="10" height="6" fill="#042238" viewBox="0 0 10 6">
    <path d="M9.792 0H.208a.233.233 0 00-.181.076.113.113 0 00.003.15l4.792 5.702A.234.234 0 005 6c.073 0 .14-.027.178-.072L9.97.226a.113.113 0 00.003-.15A.233.233 0 009.792 0z" fill="#042238" fillRule="evenodd"/>
  </svg>
);

/* ── Property type cards data ───────────────────────────────── */
const TYPES = [
  {
    value: 'SINGLE_FAMILY', label: 'Single-Family House', sub: 'Standalone residence',
    svg: (
      <svg width="40" height="33" viewBox="0 0 40 33" fill="none"><g fillRule="evenodd">
        <path fill="#7FE3FF" d="M29.543 4.977h3.939v4.978h-1.969l-1.97-1.991ZM10.832 20.905h4.924v7.964h-4.924ZM20.68 20.905h8.863v3.982H20.68Z"/>
        <path fill="#042238" d="m20.495.166 7.837 5.881V4.23c0-.431.319-.787.73-.84l.104-.006h5a.84.84 0 0 1 .833.846l-.001 6.821 4.662 3.5c.647.484.309 1.526-.495 1.526l-4.167-.001v15.231h4.167c.425 0 .775.323.827.74l.006.107a.84.84 0 0 1-.833.846H.835a.84.84 0 0 1-.833-.846.84.84 0 0 1 .833-.846L5 31.307V16.076H.835c-.804 0-1.142-1.04-.495-1.526L19.505.166a.823.823 0 0 1 .99 0Zm12.837 15.91H6.668v15.23h1.666v-2.538a.84.84 0 0 1 .834-.846H10v-7.615a.84.84 0 0 1 .834-.846h5a.84.84 0 0 1 .833.846l-.001 7.615h.834a.84.84 0 0 1 .833.846v2.538h15v-15.23ZM16.667 29.615H10v1.692h6.666v-1.692ZM15 21.153h-3.333v6.77H15v-6.77Zm14.166-1.692a.84.84 0 0 1 .833.846v5.077a.84.84 0 0 1-.833.846h-8.333a.84.84 0 0 1-.833-.846v-5.077a.84.84 0 0 1 .833-.846h8.333Zm-.833 1.692h-6.666v3.385h6.666v-3.385ZM20 1.898 3.364 14.385l2.455-.001h30.817L20 1.899Zm13.332 3.178H30V7.3L33.332 9.8V5.076Z"/>
      </g></svg>
    ),
  },
  {
    value: 'TOWNHOUSE', label: 'Townhouse', sub: 'Individual unit',
    svg: (
      <svg width="40" height="37" viewBox="0 0 40 37" fill="none"><g fillRule="evenodd">
        <path fill="#7FE3FF" d="M25.833 14.295c.92 0 1.667.754 1.667 1.682 0 .93-.746 1.682-1.667 1.682-.92 0-1.666-.753-1.666-1.682 0-.928.747-1.682 1.666-1.682ZM30 30.272v5.045h-3.333v-5.045ZM32 9h3v5h-3ZM8.167 11.632h-3v4l3-1ZM13.333 29.443v5.907H10v-5.907ZM13.333 18.81v3.454H10V18.81Z"/>
        <path fill="#042238" d="m18.884.21 11.949 10.61V8.409c0-.465.373-.841.834-.841H35c.46 0 .833.376.833.84v6.852l3.884 3.45c.346.306.38.838.075 1.186a.828.828 0 0 1-1.176.076L37.5 18.98v16.338h.834c.46 0 .834.377.834.841 0 .465-.373.841-.834.841H1.667a.837.837 0 0 1-.834-.84c0-.465.374-.842.834-.842H2.5V19.301l-1.233.758a.829.829 0 0 1-1.145-.28.845.845 0 0 1 .278-1.156l2.1-1.291v-.04l.067-.001 1.599-.982v-4.537c0-.464.374-.84.834-.84h3.333c.46 0 .834.376.834.84l-.001 1.466 10-6.143V2.701l-1.383-1.229a.846.846 0 0 1-.075-1.187.828.828 0 0 1 1.176-.075Zm1.949 3.971v31.137H25v-5.887c0-.429.318-.782.729-.834l.104-.007h5c.46 0 .834.377.834.841l-.001 5.887h4.167V17.501l-15-13.32Zm-1.667 4.883-15 9.214v17.04h4.167v-5.887c0-.429.318-.782.73-.834l.104-.007h5c.46 0 .833.377.833.841v5.887h4.166V9.064ZM30 30.272h-3.333v5.045H30v-5.045Zm-16.667 0H10v5.045h3.333v-5.045Zm.834-5.046c.46 0 .833.377.833.841 0 .465-.373.841-.833.841h-5a.837.837 0 0 1-.834-.84c0-.465.374-.842.834-.842Zm16.659 0a.84.84 0 1 1 0 1.682H25.84a.84.84 0 0 1 0-1.682Zm-16.66-7.568c.461 0 .834.377.834.841v4.205c0 .464-.373.84-.833.84h-5a.837.837 0 0 1-.834-.84v-4.205c0-.464.374-.84.834-.84Zm-.833 1.682H10v2.523h3.333V19.34Zm12.5-6.726c1.84 0 3.334 1.506 3.334 3.363 0 1.858-1.493 3.364-3.334 3.364-1.84 0-3.333-1.506-3.333-3.364 0-1.857 1.493-3.363 3.333-3.363Zm0 1.681c-.92 0-1.666.754-1.666 1.682 0 .93.746 1.682 1.666 1.682.92 0 1.667-.753 1.667-1.682 0-.928-.747-1.682-1.667-1.682ZM7.5 12.613H5.833v2.672L7.5 14.261v-1.648ZM34.167 9.25H32.5V12.3l1.666 1.479V9.25Z"/>
      </g></svg>
    ),
  },
  {
    value: 'CONDO', label: 'Condominium', sub: 'Individual unit',
    svg: (
      <svg viewBox="0 0 33 40" width="33" height="40" fill="none"><g fillRule="evenodd">
        <path fill="#7FE3FF" d="M7.5 39.167h5v-7.5h-5v7.5ZM5.833 15.833h5V12.5h-5v3.333Zm8.334 0h5V12.5h-5v3.333Zm8.333 0h5V12.5h-5v3.333ZM5.833 22.5h5v-3.333h-5V22.5Zm8.334 0h5v-3.333h-5V22.5Zm8.333 0h5v-3.333h-5V22.5Zm-1.667 16.667h5v-7.5h-5v7.5ZM27.5 7.5V4.167h3.333v6.07"/>
        <path fill="#042238" fillRule="nonzero" d="m16.695 0 .023.002a.837.837 0 0 1 .216.042l.043.016a.787.787 0 0 1 .135.069l9.554 6.033V4.167c0-.46.374-.834.834-.834h3.333c.46 0 .834.374.834.834l-.001 5.153 1.279.809a.833.833 0 0 1-.89 1.409l-.389-.247v27.042h.834a.833.833 0 0 1 0 1.667H.833a.833.833 0 1 1 0-1.667h.833V11.292l-.388.246a.833.833 0 1 1-.89-1.41l15.834-10 .03-.018.025-.013.021-.012-.012.007a.834.834 0 0 1 .066-.03l.024-.01.023-.008a.748.748 0 0 1 .217-.042L16.641 0h.054Zm-.029 1.819-13.333 8.42v28.094h3.333v-6.666c0-.46.374-.834.834-.834h5c.46 0 .833.373.833.834v6.666H20v-6.666c0-.46.373-.834.833-.834h5c.46 0 .834.373.834.834l-.001 6.666H30V10.239l-13.334-8.42Zm-5 30.681H8.334v5.833h3.334V32.5ZM25 32.5h-3.333v5.833H25V32.5Zm-11.667-5a.833.833 0 1 1 0 1.667H6.667a.833.833 0 0 1 0-1.667h6.666Zm13.334 0a.833.833 0 1 1 0 1.667H20a.833.833 0 0 1 0-1.667h6.667Zm-15.834-9.167c.46 0 .834.373.834.834V22.5c0 .46-.373.833-.834.833h-5A.833.833 0 0 1 5 22.5v-3.333c0-.46.373-.834.833-.834h5Zm8.334 0c.46 0 .833.373.833.834V22.5c0 .46-.373.833-.833.833h-5a.833.833 0 0 1-.834-.833v-3.333c0-.46.374-.834.834-.834h5Zm8.333 0c.46 0 .833.373.833.834V22.5c0 .46-.373.833-.833.833h-5a.833.833 0 0 1-.833-.833v-3.333c0-.46.373-.834.833-.834h5ZM10 20H6.667v1.667H10V20Zm8.333 0H15v1.667h3.333V20Zm8.334 0h-3.334v1.667h3.334V20Zm-15.834-8.333c.46 0 .834.373.834.833v3.333c0 .46-.373.834-.834.834h-5A.833.833 0 0 1 5 15.833V12.5c0-.46.373-.833.833-.833h5Zm8.334 0c.46 0 .833.373.833.833v3.333c0 .46-.373.834-.833.834h-5a.833.833 0 0 1-.834-.834V12.5c0-.46.374-.833.834-.833h5Zm8.333 0c.46 0 .833.373.833.833v3.333c0 .46-.373.834-.833.834h-5a.833.833 0 0 1-.833-.834V12.5c0-.46.373-.833.833-.833h5ZM10 13.333H6.667V15H10v-1.667Zm8.333 0H15V15h3.333v-1.667Zm8.334 0h-3.334V15h3.334v-1.667ZM30 5h-1.667v2.215L30 8.268V5Z"/>
      </g></svg>
    ),
  },
  {
    value: 'MULTI_FAMILY', label: 'Small Multi-Family', sub: '2-4 units at the property',
    svg: (
      <svg viewBox="0 0 40 33" width="40" height="33" fill="none"><g fillRule="nonzero">
        <path fill="#7FE3FF" d="M20 1.577V6.91l-1.305-.895-1.667-1.145-.361-.248V1.577H20Zm17.5 0V6.91l-1.305-.895-1.667-1.145-.361-.248V1.577H37.5ZM13.75 23.5v9.333h-5V23.5h5Zm17.5 0v9.333h-5V23.5h5ZM9.583 9.833v5H6.25v-5h3.333Zm6.667 0v5h-3.333v-5h3.333Zm10.833 0v5H23.75v-5h3.333Zm6.667 0v5h-3.333v-5h3.333Z"/>
        <path fill="#042238" d="m11.284 0 .024.002a.837.837 0 0 1 .107.014l.05.012a.655.655 0 0 1 .104.035l.059.028.071.04 4.134 2.646v-1.2c0-.46.373-.833.834-.833H20c.46 0 .833.373.833.833V4.89L28.269.132l.073-.042.061-.028a.886.886 0 0 1 .256-.06L28.69 0h.063l.025.002a.837.837 0 0 1 .256.06l.058.027.077.043 4.165 2.665v-1.22c0-.46.373-.833.834-.833H37.5c.46 0 .833.373.833.833v4.42l1.251.801c.356.228.48.68.307 1.052l-.054.1a.833.833 0 0 1-1.151.252l-.353-.226V32h.834a.833.833 0 0 1 0 1.667H.833a.833.833 0 1 1 0-1.667h.833V7.955l-.383.247a.833.833 0 0 1-.899-1.404L10.801.132l.038-.024.022-.012.008-.004.006-.003.056-.026a.874.874 0 0 1 .104-.035l.05-.011a.744.744 0 0 1 .107-.015L11.22 0h.063Zm19.133 24.333h-3.334V32h3.334v-7.667Zm-17.5 0H9.583V32h3.334v-7.667Zm-1.668-22.51L3.333 6.889V32h4.583v-8.5c0-.46.374-.833.834-.833h5c.46 0 .833.373.833.833V32h4.583V6.885a.844.844 0 0 1-.064-.037L11.25 1.823Zm17.469-.001-7.852 5.026-.033.017V32h4.583v-8.5c0-.46.374-.833.834-.833h5c.46 0 .833.373.833.833V32h4.583V6.909l-7.948-5.087Zm3.365 16.511a.833.833 0 0 1 0 1.667h-6.666a.833.833 0 1 1 0-1.667h6.666Zm-17.5 0a.833.833 0 0 1 0 1.667H7.917a.833.833 0 1 1 0-1.667h6.666ZM9.583 9c.46 0 .834.373.834.833v5c0 .46-.373.834-.834.834H6.25a.833.833 0 0 1-.833-.834v-5c0-.46.373-.833.833-.833h3.333Zm17.5 0c.46 0 .834.373.834.833v5c0 .46-.373.834-.834.834H23.75a.833.833 0 0 1-.833-.834v-5c0-.46.373-.833.833-.833h3.333Zm6.667 0c.46 0 .833.373.833.833v5c0 .46-.373.834-.833.834h-3.333a.833.833 0 0 1-.834-.834v-5c0-.46.373-.833.834-.833h3.333Zm-17.5 0c.46 0 .833.373.833.833v5c0 .46-.373.834-.833.834h-3.333a.833.833 0 0 1-.834-.834v-5c0-.46.374-.833.834-.833h3.333Zm16.667 1.667H31.25V14h1.667v-3.333Zm-24.167 0H7.083V14H8.75v-3.333Zm6.667 0H13.75V14h1.667v-3.333Zm10.833 0h-1.667V14h1.667v-3.333ZM36.667 2.41H35v1.453l1.666 1.066V2.41Zm-17.5 0H17.5v1.433l1.666 1.066v-2.5Z"/>
      </g></svg>
    ),
  },
  {
    value: 'APARTMENT', label: 'Apartment Building', sub: '5+ units at the property',
    svg: (
      <svg viewBox="0 0 31 40" width="31" height="40" fill="none"><g fillRule="evenodd">
        <path fill="#7FE3FF" d="M17.222 33.333v5h-3.444v-5ZM26.337 1.667l1.722 1.666H2.94l1.722-1.666Z"/>
        <path fill="#042238" d="M26.693 0c.229 0 .448.088.609.244l3.444 3.333a.923.923 0 0 1 .091.103l.015.022a.783.783 0 0 1 .147.49v34.975c0 .46-.386.833-.862.833H.863c-.476 0-.861-.373-.861-.833L0 4.193a.789.789 0 0 1 .146-.49l.017-.023a.806.806 0 0 1 .09-.103l-.043.045a.848.848 0 0 1 .017-.018l.026-.027L3.698.244A.876.876 0 0 1 4.307 0Zm2.583 5H1.724v33.333h10.331V32.5c0-.425.33-.775.754-.827l.108-.006h5.166c.476 0 .861.373.861.833v5.833h10.332V5ZM17.222 33.333h-3.444v5h3.444v-5Zm.861-10c.476 0 .861.373.861.834v5c0 .46-.385.833-.861.833h-5.166c-.476 0-.861-.373-.861-.833v-5c0-.46.385-.834.861-.834Zm8.61 0c.476 0 .861.373.861.834v5c0 .46-.385.833-.86.833h-5.167c-.475 0-.86-.373-.86-.833v-5c0-.46.385-.834.86-.834Zm-17.22 0c.475 0 .86.373.86.834v5c0 .46-.385.833-.86.833H4.307c-.476 0-.861-.373-.861-.833v-5c0-.46.385-.834.86-.834ZM17.222 25h-3.444v3.333h3.444V25Zm8.61 0h-3.444v3.333h3.444V25Zm-17.22 0H5.168v3.333h3.444V25Zm9.471-10c.476 0 .861.373.861.833v5c0 .46-.385.834-.861.834h-5.166c-.476 0-.861-.373-.861-.834v-5c0-.46.385-.833.861-.833Zm8.61 0c.476 0 .861.373.861.833v5c0 .46-.385.834-.86.834h-5.167c-.475 0-.86-.373-.86-.834v-5c0-.46.385-.833.86-.833Zm-17.22 0c.475 0 .86.373.86.833v5c0 .46-.385.834-.86.834H4.307c-.476 0-.861-.373-.861-.834v-5c0-.46.385-.833.86-.833Zm7.749 1.667h-3.444V20h3.444v-3.333Zm8.61 0h-3.444V20h3.444v-3.333Zm-17.22 0H5.168V20h3.444v-3.333Zm9.471-10c.476 0 .861.373.861.833v5c0 .46-.385.833-.861.833h-5.166c-.476 0-.861-.373-.861-.833v-5c0-.46.385-.833.861-.833Zm8.61 0c.476 0 .861.373.861.833v5c0 .46-.385.833-.86.833h-5.167c-.475 0-.86-.373-.86-.833v-5c0-.46.385-.833.86-.833Zm-17.22 0c.475 0 .86.373.86.833v5c0 .46-.385.833-.86.833H4.307c-.476 0-.861-.373-.861-.833v-5c0-.46.385-.833.86-.833Zm7.749 1.666h-3.444v3.334h3.444V8.333Zm8.61 0h-3.444v3.334h3.444V8.333Zm-17.22 0H5.168v3.334h3.444V8.333Zm17.725-6.666H4.662L2.94 3.333h25.119l-1.722-1.666Z"/>
      </g></svg>
    ),
  },
  {
    value: 'OTHER', label: 'Other Types', sub: 'Mixed-use, RV park, etc.',
    svg: (
      <svg viewBox="0 0 53 53" width="40" height="40" fill="none"><g fillRule="evenodd">
        <path fill="#7FE3FF" d="M16.667 21.333C25.135 21.333 32 28.198 32 36.667 32 45.135 25.135 52 16.667 52 8.198 52 1.333 45.135 1.333 36.667c0-8.469 6.865-15.334 15.334-15.334Zm-4 16a3.333 3.333 0 1 0 0 6.667 3.333 3.333 0 0 0 0-6.667Z"/>
        <path fill="#042238" d="M52.222 0c.614 0 1.111.497 1.111 1.111v6.667c0 .294-.117.577-.325.785l-1.897 1.895v2.875c0 .546-.393 1-.911 1.094l-.2.017h-2.876l-.457.458v2.876c0 .545-.393.999-.912 1.093l-.2.018H42.68l-.458.458v2.875c0 .546-.393 1-.911 1.093l-.2.018h-2.875l-6.416 6.418.251.573a16.53 16.53 0 0 1 1.246 5.611l.016.732c0 9.205-7.462 16.666-16.666 16.666C7.46 53.333 0 45.873 0 36.667 0 27.462 7.462 20 16.667 20c2.201 0 4.346.435 6.345 1.264l.57.25L44.77.324c.167-.166.38-.275.61-.311L45.557 0Zm-1.11 2.222h-5.099L24.595 23.646a1.111 1.111 0 0 1-1.109.277l-.19-.077a14.341 14.341 0 0 0-6.63-1.624c-7.977 0-14.444 6.467-14.444 14.445 0 7.979 6.466 14.444 14.445 14.444 7.976 0 14.444-6.466 14.444-14.444 0-2.331-.562-4.585-1.622-6.629a1.111 1.111 0 0 1 .2-1.297l7.303-7.304c.208-.209.491-.326.786-.326H40V18.89c0-.236.075-.464.212-.652l.113-.134 1.112-1.11c.208-.21.49-.326.785-.326h2.222v-2.223c0-.235.075-.463.212-.652l.114-.133 1.111-1.111c.208-.209.491-.326.786-.326h2.222V10c0-.236.075-.464.211-.652l.114-.134 1.897-1.898V2.222Zm-38.89 34.445a4.446 4.446 0 0 1 0 8.889 4.444 4.444 0 1 1 0-8.89Zm0 2.222a2.223 2.223 0 0 0 0 4.444 2.222 2.222 0 1 0 0-4.444Z"/>
      </g></svg>
    ),
  },
];

/* ── Shared field classes ────────────────────────────────────── */
const INPUT  = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const LABEL  = 'block text-xs font-semibold text-gray-700 mb-1';
const SELECT = 'w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white pr-8';

/* ── Yes/No radio pair ──────────────────────────────────────── */
const YesNo = ({ name, value, onChange }) => (
  <div className="flex gap-3">
    {['true','false'].map(v => (
      <label key={v} className={`flex items-center gap-2 cursor-pointer px-5 py-2.5 rounded-lg border-2 text-sm font-medium transition-all select-none
        ${value === v ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
        <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} className="sr-only"/>
        {v === 'true' ? 'Yes' : 'No'}
      </label>
    ))}
  </div>
);

/* ── Main component ─────────────────────────────────────────── */
const AddProperty = () => {
  const navigate = useNavigate();

  /* step 1 */
  const [propertyType,    setPropertyType]    = useState('');
  const [roomRentals,     setRoomRentals]      = useState('');
  const [otherSubType,    setOtherSubType]     = useState('');
  const [otherSpecify,    setOtherSpecify]     = useState('');

  /* step 2 – address */
  const [address,    setAddress]    = useState('');
  const [unit,       setUnit]       = useState('');
  const [city,       setCity]       = useState('');
  const [region,     setRegion]     = useState('');
  const [zipCode,    setZipCode]    = useState('');
  const [isOccupied, setIsOccupied] = useState('');

  /* step 3 – details */
  const [name,          setName]          = useState('');
  const [rentAmount,    setRentAmount]    = useState('');
  const [deposit,       setDeposit]       = useState('');
  const [bedrooms,      setBedrooms]      = useState('');
  const [bathrooms,     setBathrooms]     = useState('');
  const [isStudio,      setIsStudio]      = useState(false);
  const [description,   setDescription]   = useState('');
  const [photo,         setPhoto]         = useState(null);
  const [dragOver,      setDragOver]      = useState(false);

  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);

  const isMultiUnit  = MULTI_UNIT_TYPES.includes(propertyType);
  const isSingleUnit = SINGLE_UNIT_TYPES.includes(propertyType);

  /* step 1 valid: type + room rentals + (if OTHER, sub-type must be picked) */
  const step1Valid = propertyType && roomRentals && (propertyType !== 'OTHER' || otherSubType);

  /* step 2 valid */
  const step2Valid = address && city && region &&
    (isMultiUnit || isOccupied !== '');   // single/other need occupied answered

  const goBack = () => {
    if (step === 3) { setStep(2); return; }
    if (step === 2) { setStep(1); return; }
    navigate('/houses');
  };

  const handleStep1 = (e) => { e.preventDefault(); if (step1Valid) setStep(2); };
  const handleStep2 = (e) => { e.preventDefault(); if (step2Valid) setStep(3); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        address,
        unit,
        city,
        region,
        zipCode,
        rentAmount,
        deposit,
        bedrooms: isStudio ? 0 : bedrooms,
        bathrooms,
        isStudio,
        description,
        propertyType,
        roomRentals: roomRentals === 'true',
        isOccupied: isOccupied === 'true',
        ...(propertyType === 'OTHER' && { otherSubType: otherSubType === 'OTHER' ? otherSpecify : otherSubType }),
      };
      await axios.post(`${backendUrl}${API.houses}`, payload);
      toast.success('Property added');
      navigate('/houses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add property');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <button type="button" onClick={goBack}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* ── STEP 1 ─────────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleStep1}>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Which best describes your property?</h2>
            <p className="text-sm text-gray-500 mb-6">Select the type that best fits your rental.</p>

            {/* Type cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {TYPES.map(({ value, label, sub, svg }) => (
                <label key={value}
                  className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center gap-2 transition-all select-none
                    ${propertyType === value ? 'border-blue-600 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <input type="radio" name="property_type" value={value} checked={propertyType === value}
                    onChange={() => { setPropertyType(value); setOtherSubType(''); setOtherSpecify(''); }} className="sr-only"/>
                  {svg}
                  <span className="text-xs font-semibold text-gray-800 leading-tight">{label}</span>
                  <span className="text-xs text-gray-400 leading-tight">{sub}</span>
                </label>
              ))}
            </div>

            {/* Other sub-type — appears immediately when OTHER selected */}
            {propertyType === 'OTHER' && (
              <div className="mb-6 bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div>
                  <label className={LABEL} htmlFor="other_building_type">Other Building Type</label>
                  <div className="relative">
                    <select id="other_building_type" required value={otherSubType}
                      onChange={e => { setOtherSubType(e.target.value); setOtherSpecify(''); }}
                      className={SELECT}>
                      <option value="">Select One</option>
                      {OTHER_SUBTYPES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <Chevron />
                  </div>
                </div>
                {otherSubType === 'OTHER' && (
                  <div>
                    <label className={LABEL} htmlFor="other_specify">Other Building Type</label>
                    <input id="other_specify" required value={otherSpecify}
                      onChange={e => setOtherSpecify(e.target.value)}
                      className={INPUT} placeholder="Describe the building type" />
                  </div>
                )}
              </div>
            )}

            {/* Room rentals */}
            <div className="mb-8">
              <div className="flex items-center gap-1.5 mb-3">
                <p className="text-sm font-semibold text-gray-800">Will you have room rentals?</p>
                <div className="relative group">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="cursor-pointer">
                    <circle cx="10" cy="10" r="9" stroke="#033A6D" strokeWidth="1.5" fill="none"/>
                    <text x="10" y="14.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#033A6D">i</text>
                  </svg>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
                    Room rentals are when you&apos;re renting out rooms separately within the property, each with their own lease.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"/>
                  </div>
                </div>
              </div>
              <YesNo name="roomRentals" value={roomRentals} onChange={setRoomRentals}/>
            </div>

            <button type="submit" disabled={!step1Valid}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              Continue
            </button>
          </form>
        )}

        {/* ── STEP 2 — Address ────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleStep2}>
            <h2 className="text-xl font-bold text-gray-900 mb-1">What&apos;s the address?</h2>
            {isMultiUnit && (
              <p className="text-sm text-gray-500 mb-6">You&apos;ll add unit details in the next step.</p>
            )}
            {!isMultiUnit && <div className="mb-6" />}

            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              {/* Street address */}
              <div>
                <label className={LABEL} htmlFor="addr">Street Address</label>
                <input id="addr" required value={address} onChange={e => setAddress(e.target.value)} className={INPUT} placeholder="123 Uhuru Street" autoComplete="off"/>
              </div>

              {/* Unit — only for single-unit types */}
              {isSingleUnit && (
                <div>
                  <label className={LABEL} htmlFor="unit">
                    Unit <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input id="unit" value={unit} onChange={e => setUnit(e.target.value)} className={INPUT} placeholder="Apt 4B"/>
                </div>
              )}

              {/* District */}
              <div>
                <label className={LABEL} htmlFor="city">District</label>
                <input id="city" required value={city} onChange={e => setCity(e.target.value)} className={INPUT} placeholder="Kinondoni"/>
              </div>

              {/* Region + Zip */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL} htmlFor="region">Region</label>
                  <div className="relative">
                    <select id="region" required value={region} onChange={e => setRegion(e.target.value)} className={SELECT}>
                      <option value=""></option>
                      {TZ_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <Chevron/>
                  </div>
                </div>
                <div>
                  <label className={LABEL} htmlFor="zip">Zip Code</label>
                  <input id="zip" type="number" pattern="[0-9]*" value={zipCode} onChange={e => setZipCode(e.target.value)} className={INPUT} placeholder="11101"/>
                </div>
              </div>

              {/* Occupied — only for single-unit / other types */}
              {!isMultiUnit && (
                <div>
                  <label className={`${LABEL} mb-3`}>Is this rental currently occupied?</label>
                  <YesNo name="occupied" value={isOccupied} onChange={setIsOccupied}/>
                </div>
              )}
            </div>

            <button type="submit" disabled={!step2Valid}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              Continue
            </button>
          </form>
        )}

        {/* ── STEP 3 — Details ────────────────────────────────── */}
        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Property details</h2>
            <p className="text-sm text-gray-500 mb-6">A few more details about your rental.</p>

            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
              {/* Property name */}
              <div>
                <label className={LABEL}>Property Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Sunrise Apartments"/>
              </div>

              {/* Beds + Baths */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Beds *</label>
                  <input required={!isStudio} type="number" min="0" value={isStudio ? '' : bedrooms}
                    disabled={isStudio}
                    onChange={e => setBedrooms(e.target.value)}
                    className={`${INPUT} ${isStudio ? 'opacity-40 cursor-not-allowed' : ''}`}
                    placeholder="e.g. 2"/>
                </div>
                <div>
                  <label className={LABEL}>Baths *</label>
                  <input required type="number" min="0" value={bathrooms} onChange={e => setBathrooms(e.target.value)} className={INPUT} placeholder="e.g. 1"/>
                </div>
              </div>

              {/* Studio checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
                <input type="checkbox" checked={isStudio} onChange={e => { setIsStudio(e.target.checked); if (e.target.checked) setBedrooms(''); }}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                <span className="text-sm text-gray-700">This is a studio</span>
              </label>

              {/* Target Rent + Target Deposit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className={LABEL} style={{marginBottom:0}}>Target Rent</label>
                    <div className="relative group">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="cursor-pointer flex-shrink-0">
                        <circle cx="10" cy="10" r="9" stroke="#033A6D" strokeWidth="1.5" fill="none"/>
                        <text x="10" y="14.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#033A6D">i</text>
                      </svg>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
                        The monthly rent amount you plan to charge tenants.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"/>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">TZS</span>
                    <input required type="number" min="0" value={rentAmount} onChange={e => setRentAmount(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="0"/>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <label className={LABEL} style={{marginBottom:0}}>Target Deposit</label>
                    <div className="relative group">
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="cursor-pointer flex-shrink-0">
                        <circle cx="10" cy="10" r="9" stroke="#033A6D" strokeWidth="1.5" fill="none"/>
                        <text x="10" y="14.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#033A6D">i</text>
                      </svg>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
                        The security deposit amount collected before move-in.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"/>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">TZS</span>
                    <input type="number" min="0" value={deposit} onChange={e => setDeposit(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg pl-12 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" placeholder="0"/>
                  </div>
                </div>
              </div>

              {/* Property Photo */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label className={LABEL} style={{marginBottom:0}}>Property Photo</label>
                  <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                  <div className="relative group">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="cursor-pointer flex-shrink-0">
                      <circle cx="10" cy="10" r="9" stroke="#033A6D" strokeWidth="1.5" fill="none"/>
                      <text x="10" y="14.5" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#033A6D">i</text>
                    </svg>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 shadow-lg">
                      Upload a photo of your property. Accepted: JPG, PNG, WEBP.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"/>
                    </div>
                  </div>
                </div>
                <label
                  className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors
                    ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setPhoto(f); }}
                >
                  <input type="file" accept="image/*" className="sr-only" onChange={e => { if (e.target.files[0]) setPhoto(e.target.files[0]); }}/>
                  {photo ? (
                    <span className="text-sm text-blue-600 font-medium">{photo.name}</span>
                  ) : (
                    <>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">Click or drag to upload</span>
                    </>
                  )}
                </label>
              </div>

              {/* Description */}
              <div>
                <label className={LABEL}>Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" placeholder="Optional notes..."/>
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full mt-6 bg-blue-900 hover:bg-blue-950 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm tracking-widest uppercase transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default AddProperty;
