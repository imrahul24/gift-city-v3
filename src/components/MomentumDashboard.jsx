import React, { useState, useEffect, useMemo } from 'react';

// ── STATIC DATA (infrastructure & KPIs) ──
const KPI_DATA = [
  { label:'Land Inquiries (30D)', value:'347',   sub:'↑ 23% vs last month',  color:'var(--accent)',  icon:'📋' },
  { label:'Overall Infra Progress', value:'68%', sub:'↑ 4% since Jan 2026',  color:'var(--accent2)', icon:'🏗' },
  { label:'New Investors FY26',   value:'1,240', sub:'↑ 41% YoY',            color:'#6c63ff',        icon:'👥' },
  { label:'Avg Land Price Q1 \'26', value:'₹3.1K', sub:'↑ 18% YoY per sq.m', color:'var(--gold)',   icon:'📈' },
];

const INFRA = [
  { name:'Dholera International Airport', pct:62, desc:'Terminal construction underway · Runway grading complete',        color:'#6c63ff' },
  { name:'NH-751 Expressway (6-lane)',     pct:78, desc:'Ahmedabad–Dholera stretch nearing completion',                    color:'#0abde3' },
  { name:'Activation Area (TP 2A & 4A)',  pct:55, desc:'22.54 sq.km priority zone — roads + utilities laid',             color:'#e17055' },
  { name:'Ultra Mega Solar Park (5000 MW)',pct:40, desc:'Phase 1 operational · Phase 2 under construction',               color:'#ffd32a' },
  { name:'Water Treatment & STP Plants',  pct:85, desc:'WTPs near completion · Commissioning pending',                    color:'#00f5a0' },
  { name:'ABCD Building (Civic Centre)',  pct:90, desc:'Administrative hub · Fit-out stage in progress',                  color:'#fd79a8' },
];

const AIRPORT_TARGET = new Date('2027-12-01');

const FALLBACK_SIGNALS = [
  { tag:'INDUSTRY', color:'#6c63ff', text:'Tokyo Electron announces Dholera office to support semiconductor projects',      date:'Dec 2025' },
  { tag:'INVEST',   color:'#00f5a0', text:'Global 3–5 star hotel chains announce first luxury hotels in Dholera',           date:'Apr 2026' },
  { tag:'INFRA',    color:'#0abde3', text:'Tata + Airbus C-295 military aircraft plant confirmed in Dholera SIR',           date:'Mar 2026' },
  { tag:'POLICY',   color:'#ffd32a', text:'Gujarat govt fast-tracks land allotment for 12 new industrial units in Dholera', date:'Feb 2026' },
  { tag:'INDUSTRY', color:'#e17055', text:'Tata Semiconductor groundbreaking ceremony — ₹91,000 Cr investment',            date:'Jan 2026' },
  { tag:'INFRA',    color:'#a29bfe', text:'DMIC corridor Phase 2 allocation includes ₹18,500 Cr for Dholera utilities',    date:'Dec 2025' },
];

// ── Countdown component ──
function Countdown({ target }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const diff   = target - now;
  const days   = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const weeks  = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);

  return (
    <div className="grid grid-cols-4 gap-2 mt-3">
      {[
        { val: months, label:'Months' },
        { val: weeks,  label:'Weeks'  },
        { val: days,   label:'Days'   },
        { val: 2027,   label:'Target Yr', isYear: true },
      ].map(c => (
        <div key={c.label} className="text-center py-3 rounded-xl" style={{ background:'var(--surface2)', border:'1px solid var(--border)' }}>
          <div className="font-display font-extrabold text-2xl leading-none"
            style={{ color: c.isYear ? 'var(--accent2)' : 'var(--accent)' }}>{c.val}</div>
          <div className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color:'var(--text3)' }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Progress bar ──
function ProgressBar({ item, index }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(item.pct), index * 100 + 200);
    return () => clearTimeout(t);
  }, [item.pct, index]);

  return (
    <div className="py-3" style={{ borderBottom:'1px solid var(--border)' }}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold" style={{ color:'var(--text)' }}>{item.name}</span>
        <span className="text-sm font-extrabold font-display" style={{ color: item.color }}>{item.pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background:'var(--surface3)' }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width:`${width}%`, background:`linear-gradient(90deg, ${item.color}, ${item.color}bb)`, boxShadow:`0 0 8px ${item.color}60` }} />
      </div>
      <div className="text-[10px]" style={{ color:'var(--text3)' }}>{item.desc}</div>
    </div>
  );
}

// ── Signal tag ──
function SignalTag({ tag, color }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
      style={{ background:`${color}18`, color, border:`1px solid ${color}40` }}>
      {tag}
    </span>
  );
}

export default function MomentumDashboard() {
  const [signals,     setSignals]     = useState(FALLBACK_SIGNALS);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError,   setNewsError]   = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch AI-generated news from our Vercel edge function
  useEffect(() => {
    fetch('/api/dholera-news')
      .then(r => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then(data => {
        if (data?.signals?.length > 0) {
          setSignals(data.signals);
          setLastUpdated(data.updatedAt || new Date().toISOString());
        }
        setNewsLoading(false);
      })
      .catch(() => {
        // Silently fall back to static data
        setNewsError(true);
        setNewsLoading(false);
      });
  }, []);

  return (
    <div className="h-full overflow-y-auto" style={{ background:'var(--bg)' }}>
      <div className="max-w-[1300px] mx-auto p-4 md:p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl" style={{ color:'var(--text)' }}>
              Dholera Momentum Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color:'var(--text3)' }}>
              Infrastructure progress · Investment signals · Key milestone countdowns
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background:'var(--surface)', border:'1px solid var(--accent2)', color:'var(--accent2)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'var(--accent2)' }} />
            <span className="text-xs font-bold">Tracking Live</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {KPI_DATA.map((k, i) => (
            <div key={k.label} className="fade-in-up rounded-2xl p-4 relative overflow-hidden"
              style={{ background:'var(--surface)', border:'1px solid var(--border)', animationDelay:`${i*0.05}s` }}>
              <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background:`linear-gradient(90deg,${k.color},transparent)` }} />
              <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color:'var(--text3)' }}>{k.label}</div>
              <div className="font-display font-extrabold leading-none mb-1"
                style={{ fontSize:'clamp(24px,4vw,36px)', color:k.color }}>{k.value}</div>
              <div className="text-[10px] font-medium" style={{ color:'var(--text3)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Main 2-col layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* ── Left: Infra tracker (2/3 width) ── */}
          <div className="xl:col-span-2 space-y-5">
            <div className="rounded-2xl p-5" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'var(--text3)' }}>
                  Infrastructure Completion Tracker
                </div>
                <div className="text-[10px]" style={{ color:'var(--text3)' }}>DICDL / NICDC · Apr 2026</div>
              </div>
              {INFRA.map((item, i) => (
                <ProgressBar key={item.name} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* ── Right: Countdown + Signals (1/3 width) ── */}
          <div className="space-y-5">

            {/* Airport countdown */}
            <div className="rounded-2xl p-5" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
              <div className="flex justify-between items-start">
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'var(--text3)' }}>
                  Airport Inauguration Countdown
                </div>
                <div className="text-[10px]" style={{ color:'var(--text3)' }}>Est. Dec 2027</div>
              </div>
              <Countdown target={AIRPORT_TARGET} />
            </div>

            {/* Investment signals */}
            <div className="rounded-2xl overflow-hidden" style={{ background:'var(--surface)', border:'1px solid var(--border)' }}>
              <div className="px-5 py-3 flex justify-between items-center" style={{ borderBottom:'1px solid var(--border)' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'var(--text3)' }}>
                  Latest Investment Signals
                </div>
                <div className="flex items-center gap-2">
                  {newsLoading && (
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1 h-1 rounded-full animate-bounce"
                          style={{ background:'var(--accent)', animationDelay:`${i*0.15}s` }} />
                      ))}
                    </div>
                  )}
                  {!newsLoading && !newsError && lastUpdated && (
                    <span className="text-[9px]" style={{ color:'var(--accent2)' }}>● AI Updated</span>
                  )}
                  {!newsLoading && newsError && (
                    <span className="text-[9px]" style={{ color:'var(--text3)' }}>Static data</span>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {signals.map((s, i) => (
                  <div key={i} className="px-5 py-3 transition-colors"
                    style={{ borderBottom: i < signals.length-1 ? '1px solid var(--border)' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <SignalTag tag={s.tag} color={s.color} />
                      <span className="text-[10px]" style={{ color:'var(--text3)' }}>{s.date}</span>
                    </div>
                    <p className="text-xs font-medium leading-snug" style={{ color:'var(--text2)' }}>{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}