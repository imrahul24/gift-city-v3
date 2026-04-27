import React, { useState } from 'react';
import { fmtCr } from '../utils/formatters';

export default function TransactionRegistry({ plots, onSelectPlot }) {
  const [sortKey, setSortKey] = useState('sale_date');
  const [sortDir, setSortDir] = useState(-1);

  const sold = plots.filter(p => p.status === 'Sold' && p.transaction)
    .sort((a, b) => {
      const va = a.transaction[sortKey] ?? a[sortKey];
      const vb = b.transaction[sortKey] ?? b[sortKey];
      return sortDir * (typeof va === 'string' ? va.localeCompare(vb) : va - vb);
    });

  const totalProfit  = sold.reduce((s, p) => s + p.transaction.profit, 0);
  const avgPct       = sold.reduce((s, p) => s + p.transaction.profit_pct, 0) / sold.length;

  const handleSort = (k) => { if (sortKey === k) setSortDir(d => -d); else { setSortKey(k); setSortDir(1); } };
  const Th = ({ label, k }) => (
    <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-white/25 cursor-pointer hover:text-white/50 transition-colors whitespace-nowrap border-b border-white/[0.05]"
      onClick={() => handleSort(k)}>
      {label}{sortKey === k ? (sortDir === 1 ? ' ↑' : ' ↓') : ''}
    </th>
  );

  return (
    <div className="h-full overflow-y-auto p-4 md:p-5 space-y-4" style={{ background: '#08090d' }}>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Transactions', val: sold.length, color: '#6c63ff' },
          { label: 'Total Profit', val: `₹${fmtCr(totalProfit)}`, color: '#00f5a0' },
          { label: 'Avg Return',   val: `${avgPct.toFixed(1)}%`, color: '#ffd32a' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 md:p-4 border border-white/[0.06]" style={{ background: '#13151e' }}>
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1">{s.label}</div>
            <div className="font-display font-extrabold text-xl md:text-2xl leading-none" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.06]" style={{ background: '#13151e' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead style={{ background: '#1a1d2a' }}>
              <tr>
                <Th label="Plot" k="id" />
                <Th label="Zones" k="zone" />
                <Th label="Buyer" k="buyer" />
                <Th label="Sale Date" k="sale_date" />
                <Th label="Sale Price" k="sale_price" />
                <Th label="Profit" k="profit" />
                <Th label="%" k="profit_pct" />
              </tr>
            </thead>
            <tbody>
              {sold.map(p => (
                <tr key={p.id} onClick={() => onSelectPlot(p.id)}
                  className="cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-white/[0.04]">
                  <td className="px-3 py-2.5 font-display font-bold text-accent text-xs">{p.id}</td>
                  <td className="px-3 py-2.5 text-white/40 max-w-[140px] truncate">{p.zone}</td>
                  <td className="px-3 py-2.5 text-white/60 font-medium">{p.transaction.buyer}</td>
                  <td className="px-3 py-2.5 text-white/40">{p.transaction.sale_date}</td>
                  <td className="px-3 py-2.5 font-bold text-white/80">₹{fmtCr(p.transaction.sale_price)}</td>
                  <td className="px-3 py-2.5 font-bold text-available">₹{fmtCr(p.transaction.profit)}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold text-available" style={{ background: 'rgba(0,245,160,0.1)', border: '1px solid rgba(0,245,160,0.25)' }}>
                      {p.transaction.profit_pct}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}