import React from 'react';
import { fmtCr, roiColor } from '../utils/formatters';

function scoreClass(v) { return v >= 65 ? 'score-high' : v >= 45 ? 'score-mid' : 'score-low'; }

export default function ComparisonModal({ plots, onClose }) {
  if (!plots.length) return null;

  const rows = [
    { label: 'Zone',         key: 'zone' },
    { label: 'Tier',         key: 'tier' },
    { label: 'Status',       key: 'status',       render: v => <span className={`pill-${v} px-2 py-0.5 rounded-full text-[10px] font-bold`}>{v}</span> },
    { label: 'Area (sqft)',  key: 'area_sqft',    render: v => v.toLocaleString('en-IN') },
    { label: 'Dimensions',   key: 'dimensions' },
    { label: 'Facing',       key: 'facing' },
    { label: 'Price / sqft', key: 'price_psf',    render: v => `₹${v.toLocaleString('en-IN')}` },
    { label: 'Total Value',  key: 'total_price',  render: v => `₹${fmtCr(v)}` },
    { label: 'ROI Score',    key: 'roi_score',    render: v => <span className={`score-circle w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold border-2 mx-auto ${scoreClass(v)}`}>{v}</span> },
    { label: 'Connectivity', key: 'connectivity_score', render: v => <span className={`score-circle w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold border-2 mx-auto ${scoreClass(v)}`}>{v}</span> },
    { label: 'Demand',       key: 'demand_level' },
  ];

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="scale-in rounded-2xl p-6 md:p-8 overflow-auto border border-white/10 max-w-[95vw] max-h-[90vh]"
        style={{ background: '#13151e', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', minWidth: 'min(600px,90vw)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display font-extrabold text-xl text-white">Plot Comparison</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all text-base">✕</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-3 pr-4 text-[10px] font-bold uppercase tracking-widest text-white/25 border-b border-white/[0.08] w-32">Metric</th>
                {plots.map(p => (
                  <th key={p.id} className="py-3 px-4 text-center border-b border-white/[0.08]">
                    <div className="font-display font-extrabold text-base text-accent">{p.id}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">{p.tier}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                  <td className="py-3 pr-4 text-[11px] font-bold text-white/30 uppercase tracking-wide border-b border-white/[0.04]">{row.label}</td>
                  {plots.map(p => (
                    <td key={p.id} className="py-3 px-4 text-center text-sm text-white/70 border-b border-white/[0.04]">
                      {row.render ? row.render(p[row.key]) : p[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}