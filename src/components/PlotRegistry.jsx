import React, { useState } from 'react';
import { fmtCr, roiColor } from '../utils/formatters';

function scoreClass(v) { return v>=65?'score-high':v>=45?'score-mid':'score-low'; }

export default function PlotRegistry({ plots, onSelectPlot, compareIds, onToggleCompare }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState(1);

  const filtered = plots
    .filter(p => [p.id,p.zone,p.status].some(v => v.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b) => {
      const va=a[sortKey], vb=b[sortKey];
      return sortDir*(typeof va==='string'?va.localeCompare(vb):va-vb);
    });

  const handleSort = (k) => { if(sortKey===k) setSortDir(d=>-d); else{setSortKey(k);setSortDir(1);} };

  const Th = ({ label, k }) => (
    <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest cursor-pointer whitespace-nowrap"
      style={{color:'var(--text3)',borderBottom:'1px solid var(--border)',background:'var(--surface2)'}}
      onClick={() => handleSort(k)}>
      {label}{sortKey===k?(sortDir===1?' ↑':' ↓'):''}
    </th>
  );

  return (
    <div className="flex flex-col h-full" style={{background:'var(--bg)'}}>
      {/* Search */}
      <div className="flex items-center gap-3 px-4 py-3" style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)'}}>
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{color:'var(--text3)'}}>🔍</span>
          <input type="text" placeholder="Search ID, zone, status…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm font-medium"
            style={{background:'var(--input-bg)',color:'var(--input-text)',border:'1px solid var(--border2)',outline:'none'}} />
        </div>
        <span className="text-xs font-semibold whitespace-nowrap" style={{color:'var(--text3)'}}>{filtered.length} plots</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs min-w-[700px]">
          <thead style={{position:'sticky',top:0,zIndex:1}}>
            <tr>
              <Th label="ID" k="id"/>
              <Th label="Zone" k="zone"/>
              <Th label="Area" k="area_sqft"/>
              <Th label="PSF" k="price_psf"/>
              <Th label="Total" k="total_price"/>
              <Th label="Status" k="status"/>
              <Th label="ROI" k="roi_score"/>
              <Th label="Conn" k="connectivity_score"/>
              <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest"
                style={{color:'var(--text3)',borderBottom:'1px solid var(--border)',background:'var(--surface2)'}}>Cmp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => onSelectPlot(p.id)}
                className="cursor-pointer transition-colors" style={{borderBottom:'1px solid var(--border)'}}
                onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td className="px-3 py-2.5 font-display font-bold text-xs" style={{color:'var(--accent)'}}>{p.id}</td>
                <td className="px-3 py-2.5 max-w-[140px] truncate" style={{color:'var(--text2)'}}>{p.zone}</td>
                <td className="px-3 py-2.5" style={{color:'var(--text2)'}}>{p.area_sqft.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2.5" style={{color:'var(--text2)'}}>₹{p.price_psf.toLocaleString('en-IN')}</td>
                <td className="px-3 py-2.5 font-bold" style={{color:'var(--text)'}}>₹{fmtCr(p.total_price)}</td>
                <td className="px-3 py-2.5"><span className={`pill-${p.status} px-2 py-0.5 rounded-full text-[10px] font-bold`}>{p.status}</span></td>
                <td className="px-3 py-2.5">
                  <div className={`score-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 ${scoreClass(p.roi_score)}`}>{p.roi_score}</div>
                </td>
                <td className="px-3 py-2.5">
                  <div className={`score-circle w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2 ${scoreClass(p.connectivity_score)}`}>{p.connectivity_score}</div>
                </td>
                <td className="px-3 py-2.5" onClick={e => {e.stopPropagation();onToggleCompare(p.id);}}>
                  <input type="checkbox" readOnly checked={compareIds.includes(p.id)}
                    className="w-4 h-4 cursor-pointer rounded" style={{accentColor:'var(--accent)'}} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}