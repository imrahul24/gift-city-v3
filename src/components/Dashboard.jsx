import React from 'react';
import { fmtCr, roiColor } from '../utils/formatters';

export default function Dashboard({ plots, onSelectPlot }) {
  const sold  = plots.filter(p => p.status === 'Sold');
  const avail = plots.filter(p => p.status === 'Available');
  const resv  = plots.filter(p => p.status === 'Reserved');
  const totalProfit  = sold.reduce((s,p) => s+(p.transaction?.profit||0), 0);
  const totalRevenue = sold.reduce((s,p) => s+p.total_price, 0);
  const portfolioVal = avail.reduce((s,p) => s+p.total_price, 0);
  const avgRoi = plots.reduce((s,p) => s+p.roi_score, 0) / plots.length;

  const zoneDemand = {};
  plots.forEach(p => {
    if (!zoneDemand[p.zone]) zoneDemand[p.zone] = { total:0, sold:0 };
    zoneDemand[p.zone].total++;
    if (p.status==='Sold') zoneDemand[p.zone].sold++;
  });
  const trending = Object.entries(zoneDemand)
    .map(([z,d]) => ({ name:z, ratio:d.sold/d.total, ...d }))
    .sort((a,b) => b.ratio-a.ratio)[0];

  const topPlots = [...plots].sort((a,b) => b.roi_score-a.roi_score).slice(0,10);
  const zoneList = Object.entries(zoneDemand).sort((a,b) => b[1].total-a[1].total);

  const card = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16 };

  return (
    <div className="h-full overflow-y-auto" style={{ background:'var(--bg)' }}>
      <div className="p-4 md:p-5 space-y-4 max-w-[1400px] mx-auto">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label:'Total Revenue',    val:`₹${fmtCr(totalRevenue)}`, sub:`${sold.length} closed`,  color:'var(--accent2)', delay:'0.05s' },
            { label:'Total Profit',     val:`₹${fmtCr(totalProfit)}`,  sub:'Realized gains',         color:'var(--accent)',  delay:'0.1s'  },
            { label:'Active Portfolio', val:`₹${fmtCr(portfolioVal)}`, sub:`${avail.length} plots`,  color:'var(--gold)',    delay:'0.15s' },
            { label:'Avg ROI Score',    val:avgRoi.toFixed(1),          sub:'All plots',              color:roiColor(avgRoi), delay:'0.2s'  },
          ].map(m => (
            <div key={m.label} className="fade-in-up rounded-2xl p-5 relative overflow-hidden"
              style={{ ...card, animationDelay:m.delay }}>
              <div className="absolute top-0 left-0 h-0.5 w-1/2" style={{background:`linear-gradient(90deg,${m.color},transparent)`}} />
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:'var(--text3)'}}>{m.label}</div>
              <div className="font-display font-extrabold leading-none mb-1" style={{fontSize:'clamp(20px,4vw,28px)',color:m.color}}>{m.val}</div>
              <div className="text-[11px] mt-1" style={{color:'var(--text3)'}}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Trending zone */}
        <div className="rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
          style={{ background:'var(--surface)', border:'1px solid var(--border)', borderLeft:'3px solid var(--accent)' }}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'var(--accent)'}}>🔥 Market Insight</div>
            <div className="font-display font-extrabold text-lg md:text-xl" style={{color:'var(--text)'}}>{trending.name}</div>
            <div className="text-xs mt-1" style={{color:'var(--text3)'}}>{trending.sold} of {trending.total} sold</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-display font-extrabold text-4xl md:text-5xl leading-none" style={{color:'var(--accent2)'}}>{Math.round(trending.ratio*100)}%</div>
            <div className="text-[9px] uppercase tracking-widest mt-1" style={{color:'var(--text3)'}}>Absorption</div>
          </div>
        </div>

        {/* Status pills */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:'Available', count:avail.length, color:'var(--accent2)' },
            { label:'Reserved',  count:resv.length,  color:'var(--gold)'    },
            { label:'Sold',      count:sold.length,  color:'var(--red)'     },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 md:p-4" style={card}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:'var(--text3)'}}>{s.label}</div>
              <div className="font-display font-extrabold text-2xl md:text-3xl leading-none mb-3" style={{color:s.color}}>{s.count}</div>
              <div className="h-1 rounded-full overflow-hidden" style={{background:'var(--surface3)'}}>
                <div className="h-full rounded-full" style={{width:`${(s.count/plots.length)*100}%`,background:s.color}} />
              </div>
            </div>
          ))}
        </div>

        {/* Two col */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="px-5 py-3.5 flex justify-between items-center" style={{borderBottom:'1px solid var(--border)'}}>
              <span className="font-display font-bold text-sm" style={{color:'var(--text)'}}>Top 10 High-Yield Plots</span>
              <span className="text-[10px] font-semibold" style={{color:'var(--text3)'}}>by ROI</span>
            </div>
            <div className="overflow-auto max-h-80">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{background:'var(--surface2)'}}>
                    {['ID','Zone','Status','ROI','Value'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] font-bold uppercase tracking-widest" style={{color:'var(--text3)',borderBottom:'1px solid var(--border)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topPlots.map(p => (
                    <tr key={p.id} onClick={() => onSelectPlot(p.id)}
                      className="cursor-pointer transition-colors" style={{borderBottom:'1px solid var(--border)'}}
                      onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td className="px-4 py-2.5 font-display font-bold text-xs" style={{color:'var(--accent)'}}>{p.id}</td>
                      <td className="px-4 py-2.5 text-[11px] max-w-[120px] truncate" style={{color:'var(--text2)'}}>{p.zone}</td>
                      <td className="px-4 py-2.5"><span className={`pill-${p.status} px-2 py-0.5 rounded-full text-[10px] font-bold`}>{p.status}</span></td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 rounded-full overflow-hidden" style={{background:'var(--surface3)'}}>
                            <div className="h-full rounded-full" style={{width:`${p.roi_score}%`,background:roiColor(p.roi_score)}} />
                          </div>
                          <span className="font-bold text-[11px]" style={{color:roiColor(p.roi_score)}}>{p.roi_score}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-[11px]" style={{color:'var(--text2)'}}>₹{fmtCr(p.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="px-5 py-3.5 flex justify-between items-center" style={{borderBottom:'1px solid var(--border)'}}>
              <span className="font-display font-bold text-sm" style={{color:'var(--text)'}}>Zone Distribution</span>
              <span className="text-[10px] font-semibold" style={{color:'var(--text3)'}}>{plots.length} plots</span>
            </div>
            <div className="overflow-auto max-h-80">
              {zoneList.map(([zone,d]) => (
                <div key={zone} className="flex justify-between items-center px-5 py-3 transition-colors"
                  style={{borderBottom:'1px solid var(--border)'}}
                  onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <div>
                    <div className="text-sm font-medium leading-tight" style={{color:'var(--text2)'}}>{zone}</div>
                    <div className="text-[10px] mt-0.5" style={{color:'var(--text3)'}}>{d.sold} sold · {d.total-d.sold} active</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-bold" style={{color:'var(--accent)'}}>{d.total}</div>
                    <div className="text-[10px]" style={{color:'var(--text3)'}}>{Math.round((d.sold/d.total)*100)}% abs.</div>
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