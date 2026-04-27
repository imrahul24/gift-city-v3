import React from 'react';
import { useTheme } from '../context/ThemeContext';

const NAV = [
  { id:'map',          icon:'🗺',  label:'Geographic Map',   desc:'Interactive plot view' },
  { id:'dashboard',    icon:'📊',  label:'Performance',      desc:'Analytics & KPIs' },
  { id:'list',         icon:'🏙',  label:'Plot Registry',    desc:'Browse all plots' },
  { id:'transactions', icon:'💸',  label:'Transactions',     desc:'Sales history' },
];

// All zone names derived from GeoJSON (developable zones only)
const ZONES = [
  'CBD City Center',
  'Industrial Knowledge & IT Phase',
  'Mixed Use - Commercial & Residential Phase',
  'Logistics Phase',
  'Tourism Phase',
  'Industrial Phase',
  'Infrastructure Phase',
  'Residential  Medium to High Density Phase',
  'Recreational & Sports Phase',
  'Public Facility Zone',
];

export default function Sidebar({ activeView, setActiveView, filters, setFilters, plots = [] }) {
  const { dark } = useTheme();
  const counts = {};
  plots.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });

  return (
    <aside className="h-full flex flex-col overflow-y-auto overflow-x-hidden w-64 transition-colors duration-300"
      style={{ background:'var(--bg2)', borderRight:'1px solid var(--border)' }}>

      {/* NAV */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2" style={{color:'var(--text3)'}}>Navigation</p>
        {NAV.map(item => (
          <button key={item.id} onClick={() => setActiveView(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-all duration-150 group"
            style={{
              background: activeView===item.id ? 'var(--surface2)' : 'transparent',
              border: activeView===item.id ? '1px solid var(--border2)' : '1px solid transparent',
            }}>
            <span className="text-base w-6 text-center flex-shrink-0 leading-none">{item.icon}</span>
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight transition-colors"
                style={{color: activeView===item.id ? 'var(--text)' : 'var(--text3)'}}>
                {item.label}
              </div>
              <div className="text-[10px] mt-0.5 leading-none" style={{color:'var(--text3)'}}>{item.desc}</div>
            </div>
            {activeView===item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:'var(--accent)'}} />
            )}
          </button>
        ))}
      </div>

      {/* LIVE INVENTORY */}
      <div className="mx-3 mb-3 rounded-xl p-3" style={{background:'var(--surface2)', border:'1px solid var(--border)'}}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{color:'var(--text3)'}}>Live Inventory</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label:'Available', count:counts.Available||0, color:'#00c47a', darkColor:'#00f5a0' },
            { label:'Reserved',  count:counts.Reserved||0,  color:'#b38900', darkColor:'#ffd32a' },
            { label:'Sold',      count:counts.Sold||0,      color:'#e03040', darkColor:'#ff4757' },
          ].map(s => (
            <div key={s.label} className="text-center py-1.5 rounded-lg"
              style={{ background:`${dark?s.darkColor:s.color}12` }}>
              <div className="font-display text-lg font-extrabold leading-none"
                style={{color: dark ? s.darkColor : s.color}}>{s.count}</div>
              <div className="text-[9px] font-semibold mt-0.5" style={{color:'var(--text3)'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className="px-3 pb-2 pt-3" style={{borderTop:'1px solid var(--border)'}}>
        <p className="text-[10px] font-bold uppercase tracking-widest px-1 mb-3" style={{color:'var(--text3)'}}>Filters</p>

        <div className="mb-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider px-1 mb-1.5" style={{color:'var(--text3)'}}>
            Availability
          </label>
          <select
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
            className="themed-select"
          >
            <option value="">All Listings</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-[10px] font-bold uppercase tracking-wider px-1 mb-1.5" style={{color:'var(--text3)'}}>
            Zone
          </label>
          <select
            value={filters.zone}
            onChange={e => setFilters({ ...filters, zone: e.target.value })}
            className="themed-select"
          >
            <option value="">All Zones</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <button onClick={() => setFilters({ status:'', zone:'' })}
          className="w-full py-2 rounded-xl text-xs font-bold transition-colors"
          style={{ background:'var(--surface2)', border:'1px solid var(--border2)', color:'var(--text3)' }}>
          ↺ Reset Filters
        </button>
      </div>

      {/* LEGEND */}
      <div className="mt-auto mx-3 mb-3 rounded-xl p-3" style={{border:'1px solid var(--border)'}}>
        <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{color:'var(--text3)'}}>Map Legend</p>
        {[
          { color:'#00c47a', darkColor:'#00f5a0', label:'Available' },
          { color:'#b38900', darkColor:'#ffd32a', label:'Reserved' },
          { color:'#e03040', darkColor:'#ff4757', label:'Sold' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2 py-1">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: dark ? l.darkColor : l.color, boxShadow:`0 0 6px ${dark?l.darkColor:l.color}80` }} />
            <span className="text-xs font-medium" style={{color:'var(--text2)'}}>{l.label}</span>
          </div>
        ))}
      </div>

      <div className="pb-3 px-4 text-[10px] font-semibold" style={{color:'var(--text3)'}}>
        © 2025 GIFT City Intelligence · v4.0
      </div>
    </aside>
  );
}