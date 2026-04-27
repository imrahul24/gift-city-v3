import React, { useState } from 'react';
import { fmtCr, roiColor } from '../utils/formatters';

function scoreClass(v) {
  return v >= 65 ? 'score-high' : v >= 45 ? 'score-mid' : 'score-low';
}

export default function PlotRegistry({ plots, onSelectPlot, compareIds, onToggleCompare }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState(1);

  const filtered = plots
    .filter(p => [p.id, p.zone, p.status].some(v => v.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      return sortDir * (typeof va === 'string' ? va.localeCompare(vb) : va - vb);
    });

  const handleSort = (k) => { if (sortKey === k) setSortDir(d => -d); else { setSortKey(k); setSortDir(1); } };
  const Th = ({ label, k }) => (
    <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-white/25 cursor-pointer hover:text-white/50 transition-colors whitespace-nowrap border-b border-white/[0.05]"
      onClick={() => handleSort(k)}>
      {label}{sortKey === k ? (sortDir === 1 ? ' ↑' : ' ↓') : ''}
    </th>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: '#08090d' }}>
      {/* Search bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]" style={{ background: '#0f1117' }}>
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-sm">🔍</span>
          <input type="text" placeholder="Search ID, zone, status…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white/80 placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-accent transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
        <span className="text-xs text-white/25 font-semibold whitespace-nowrap">{filtered.length} plots</span>
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead style={{ background: '#1a1d2a', position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <Th label="ID" k="id" />
              <Th label="Zone" k="zone" />
              <Th label="Area" k="area_sqft" />
              <Th label="PSF" k="price_psf" />
              <Th label="Total" k="total_price" />
              <Th label="Status" k="status" />
              <Th label="ROI" k="roi_score" />
              <Th label="Conn" k="connectivity_score" />
              <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-white/25 border-b border-white/[0.05]">Cmp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => onSelectPlot(p.id)}
                className="cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]">
                <td className="px-3 py-2.5 font-display font-bold text-accent text-xs">{p.id}</td>
                <td className="px-3 py-2.5 text-white/40 max-w-[140px] truncate">{p.zone}</td>
                <td className="px-3 py-2.5 text-white/60">{p.area_sqft.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2.5 text-white/60">₹{p.price_psf.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2.5 font-bold text-white/80">₹{fmtCr(p.total_price)}</td>
                <td className="px-3 py-2.5">
                  <span className={`pill-${p.status} px-2 py-0.5 rounded-full text-[10px] font-bold`}>{p.status}</span>
                </td>
                <td className="px-3 py-2.5">
                  <div className={`score-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 ${scoreClass(p.roi_score)}`}>{p.roi_score}</div>
                </td>
                <td className="px-3 py-2.5">
                  <div className={`score-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 ${scoreClass(p.connectivity_score)}`}>{p.connectivity_score}</div>
                </td>
                <td className="px-3 py-2.5" onClick={e => { e.stopPropagation(); onToggleCompare(p.id); }}>
                  <input type="checkbox" readOnly checked={compareIds.includes(p.id)}
                    className="w-4 h-4 cursor-pointer rounded" style={{ accentColor: 'var(--accent)' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}