import React from 'react';
import { fmtCr, roiColor } from '../utils/formatters';

function MetricCard({ label, value, sub, color, delay }) {
  return (
    <div className="fade-in-up rounded-2xl p-5 relative overflow-hidden border border-white/[0.06] hover:border-white/[0.1] transition-colors"
      style={{ background: '#13151e', animationDelay: `${delay}ms` }}>
      <div className="absolute top-0 left-0 h-0.5 w-1/2" style={{ background: `linear-gradient(90deg,${color},transparent)` }} />
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">{label}</div>
      <div className="font-display font-extrabold leading-none mb-1" style={{ fontSize: 'clamp(20px,4vw,28px)', color }}>{value}</div>
      {sub && <div className="text-[11px] text-white/25 mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard({ plots, onSelectPlot }) {
  const sold  = plots.filter(p => p.status === 'Sold');
  const avail = plots.filter(p => p.status === 'Available');
  const resv  = plots.filter(p => p.status === 'Reserved');
  const totalProfit  = sold.reduce((s, p) => s + (p.transaction?.profit || 0), 0);
  const totalRevenue = sold.reduce((s, p) => s + p.total_price, 0);
  const portfolioVal = avail.reduce((s, p) => s + p.total_price, 0);
  const avgRoi = plots.reduce((s, p) => s + p.roi_score, 0) / plots.length;

  const zoneDemand = {};
  plots.forEach(p => {
    if (!zoneDemand[p.zone]) zoneDemand[p.zone] = { total: 0, sold: 0 };
    zoneDemand[p.zone].total++;
    if (p.status === 'Sold') zoneDemand[p.zone].sold++;
  });
  const trending = Object.entries(zoneDemand)
    .map(([z, d]) => ({ name: z, ratio: d.sold / d.total, ...d }))
    .sort((a, b) => b.ratio - a.ratio)[0];

  const topPlots = [...plots].sort((a, b) => b.roi_score - a.roi_score).slice(0, 10);
  const zoneList = Object.entries(zoneDemand).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="h-full overflow-y-auto" style={{ background: '#08090d' }}>
      <div className="p-4 md:p-5 space-y-4 max-w-[1400px] mx-auto">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard label="Total Revenue"   value={`₹${fmtCr(totalRevenue)}`} sub={`${sold.length} closed`}   color="#00f5a0" delay={50}  />
          <MetricCard label="Total Profit"    value={`₹${fmtCr(totalProfit)}`}  sub="Realized gains"            color="#6c63ff" delay={100} />
          <MetricCard label="Active Portfolio" value={`₹${fmtCr(portfolioVal)}`} sub={`${avail.length} plots`}  color="#ffd32a" delay={150} />
          <MetricCard label="Avg ROI Score"   value={avgRoi.toFixed(1)}          sub="All plots"                 color={roiColor(avgRoi)} delay={200} />
        </div>

        {/* Trending zone */}
        <div className="rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-white/[0.07]"
          style={{ background: 'linear-gradient(135deg,#13151e,#1a1d2a)', borderLeft: '3px solid #6c63ff' }}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">🔥 Market Insight</div>
            <div className="font-display font-extrabold text-lg md:text-xl text-white">{trending.name}</div>
            <div className="text-xs text-white/30 mt-1">{trending.sold} of {trending.total} sold · ₹{fmtCr(plots.filter(p=>p.zone===trending.name).reduce((s,p)=>s+p.total_price,0))} total</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-display font-extrabold text-4xl md:text-5xl text-accent2 leading-none">{Math.round(trending.ratio*100)}%</div>
            <div className="text-[9px] uppercase tracking-widest text-white/30 mt-1">Absorption</div>
          </div>
        </div>

        {/* Status pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Available', count: avail.length, color: '#00f5a0' },
            { label: 'Reserved',  count: resv.length,  color: '#ffd32a' },
            { label: 'Sold',      count: sold.length,  color: '#ff4757' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 md:p-4" style={{ background: '#13151e', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">{s.label}</div>
              <div className="font-display font-extrabold text-2xl md:text-3xl leading-none mb-3" style={{ color: s.color }}>{s.count}</div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full" style={{ width: `${(s.count/plots.length)*100}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Two-col layout */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Top plots */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.06]" style={{ background: '#13151e' }}>
            <div className="px-5 py-3.5 border-b border-white/[0.05] flex justify-between items-center">
              <span className="font-display font-bold text-sm">Top 10 High-Yield Plots</span>
              <span className="text-[10px] text-white/25 font-semibold">by ROI</span>
            </div>
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: '#1a1d2a' }}>
                    {['ID','Zone','Status','ROI','Value'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest text-white/25 border-b border-white/[0.05]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topPlots.map((p, i) => (
                    <tr key={p.id} onClick={() => onSelectPlot(p.id)} className="cursor-pointer hover:bg-white/[0.03] transition-colors border-b border-white/[0.04]">
                      <td className="px-4 py-2.5 font-display font-bold text-accent text-xs">{p.id}</td>
                      <td className="px-4 py-2.5 text-white/40 max-w-[120px] truncate text-[11px]">{p.zone}</td>
                      <td className="px-4 py-2.5"><span className={`pill-${p.status} px-2 py-0.5 rounded-full text-[10px] font-bold`}>{p.status}</span></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 rounded-full overflow-hidden bg-white/[0.06]">
                            <div className="h-full rounded-full" style={{ width: `${p.roi_score}%`, background: roiColor(p.roi_score) }} />
                          </div>
                          <span className="font-bold text-[11px]" style={{ color: roiColor(p.roi_score) }}>{p.roi_score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-white/70 text-[11px]">₹{fmtCr(p.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Zone distribution */}
          <div className="rounded-2xl overflow-hidden border border-white/[0.06]" style={{ background: '#13151e' }}>
            <div className="px-5 py-3.5 border-b border-white/[0.05] flex justify-between items-center">
              <span className="font-display font-bold text-sm">Zone Distribution</span>
              <span className="text-[10px] text-white/25 font-semibold">{plots.length} plots</span>
            </div>
            <div className="overflow-auto max-h-80">
              {zoneList.map(([zone, d]) => (
                <div key={zone} className="flex justify-between items-center px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <div>
                    <div className="text-sm font-medium text-white/70 leading-tight">{zone}</div>
                    <div className="text-[10px] text-white/25 mt-0.5">{d.sold} sold · {d.total - d.sold} active</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-bold text-accent">{d.total}</div>
                    <div className="text-[10px] text-white/25">{Math.round((d.sold/d.total)*100)}% abs.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}