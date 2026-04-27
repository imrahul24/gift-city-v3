import React, { useState } from 'react';
import { fmtCr } from '../utils/formatters';

export default function TransactionRegistry({ plots, onSelectPlot }) {
  const [sortKey, setSortKey] = useState('sale_date');
  const [sortDir, setSortDir] = useState(-1);

  const sold = plots.filter(p => p.status==='Sold' && p.transaction)
    .sort((a,b) => {
      const va=a.transaction[sortKey]??a[sortKey], vb=b.transaction[sortKey]??b[sortKey];
      return sortDir*(typeof va==='string'?va.localeCompare(vb):va-vb);
    });

  const totalProfit = sold.reduce((s,p) => s+p.transaction.profit, 0);
  const avgPct      = sold.reduce((s,p) => s+p.transaction.profit_pct, 0)/sold.length;

  const handleSort = (k) => { if(sortKey===k) setSortDir(d=>-d); else{setSortKey(k);setSortDir(1);} };

  const Th = ({ label, k }) => (
    <th className="px-3 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest cursor-pointer whitespace-nowrap"
      style={{color:'var(--text3)',borderBottom:'1px solid var(--border)'}}
      onClick={() => handleSort(k)}>
      {label}{sortKey===k?(sortDir===1?' ↑':' ↓'):''}
    </th>
  );

  const card = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-5 space-y-4" style={{background:'var(--bg)'}}>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Transactions', val:sold.length,           color:'var(--accent)'  },
          { label:'Total Profit', val:`₹${fmtCr(totalProfit)}`, color:'var(--accent2)' },
          { label:'Avg Return',   val:`${avgPct.toFixed(1)}%`,  color:'var(--gold)'    },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 md:p-4" style={card}>
            <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:'var(--text3)'}}>{s.label}</div>
            <div className="font-display font-extrabold text-xl md:text-2xl leading-none" style={{color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[600px]">
            <thead style={{background:'var(--surface2)'}}>
              <tr>
                <Th label="Plot" k="id"/>
                <Th label="Zone" k="zone"/>
                <Th label="Buyer" k="buyer"/>
                <Th label="Sale Date" k="sale_date"/>
                <Th label="Sale Price" k="sale_price"/>
                <Th label="Profit" k="profit"/>
                <Th label="%" k="profit_pct"/>
              </tr>
            </thead>
            <tbody>
              {sold.map(p => (
                <tr key={p.id} onClick={() => onSelectPlot(p.id)}
                  className="cursor-pointer transition-colors" style={{borderBottom:'1px solid var(--border)'}}
                  onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td className="px-3 py-2.5 font-display font-bold text-xs" style={{color:'var(--accent)'}}>{p.id}</td>
                  <td className="px-3 py-2.5 max-w-[140px] truncate" style={{color:'var(--text2)'}}>{p.zone}</td>
                  <td className="px-3 py-2.5 font-medium" style={{color:'var(--text2)'}}>{p.transaction.buyer}</td>
                  <td className="px-3 py-2.5" style={{color:'var(--text3)'}}>{p.transaction.sale_date}</td>
                  <td className="px-3 py-2.5 font-bold" style={{color:'var(--text)'}}>₹{fmtCr(p.transaction.sale_price)}</td>
                  <td className="px-3 py-2.5 font-bold" style={{color:'var(--accent2)'}}>₹{fmtCr(p.transaction.profit)}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                      style={{background:'rgba(0,179,119,0.12)',color:'var(--accent2)',border:'1px solid rgba(0,179,119,0.25)'}}>
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