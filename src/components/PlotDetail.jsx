import React, { useEffect, useRef, useState } from 'react';
import { fmtCr, roiColor } from '../utils/formatters';

/* ── Animated SVG score ring ── */
function ScoreRing({ value, color, label, delay = 0 }) {
  const [anim, setAnim] = useState(0);
  const size = 84, r = 34;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    setAnim(0);
    const t = setTimeout(() => {
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 900, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setAnim(ease * value);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  const dash = circ * (anim / 100);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={42} cy={42} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
          <circle cx={42} cy={42} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, dash)} ${Math.max(0, circ - dash)}`}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-extrabold text-xl leading-none" style={{ color, textShadow: `0 0 12px ${color}60` }}>
            {Math.round(anim)}
          </span>
        </div>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{label}</span>
    </div>
  );
}

/* ── Staggered detail field ── */
function Field({ label, value, color, delay, accent }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    setVis(false);
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay, value]);

  return (
    <div
      className="rounded-xl p-3 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${accent ? accent + '28' : 'rgba(255,255,255,0.07)'}`,
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {accent && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,${accent},transparent)` }} />}
      <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1">{label}</div>
      <div className="font-display font-bold text-sm leading-tight" style={{ color: color || '#f0f2ff' }}>{value}</div>
    </div>
  );
}

/* ── Animated price bar ── */
function PriceBar({ psf, visible }) {
  const [w, setW] = useState(0);
  const pct = Math.max(5, Math.min(100, Math.round(((psf - 3000) / 7000) * 100)));
  const col = pct > 70 ? '#6c63ff' : pct > 40 ? '#ffd32a' : '#00f5a0';

  useEffect(() => {
    setW(0);
    if (visible) { const t = setTimeout(() => setW(pct), 500); return () => clearTimeout(t); }
  }, [visible, pct]);

  return (
    <div className="rounded-xl p-3.5 mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', opacity: visible ? 1 : 0, transition: 'opacity 0.4s 0.45s ease' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/25">Price Tier Position</span>
        <span className="text-xs font-bold" style={{ color: col }}>₹{psf.toLocaleString('en-IN')} PSF</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${w}%`, background: `linear-gradient(90deg,${col},${col}99)`, boxShadow: `0 0 8px ${col}60` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[8px] text-white/20">₹3,400 Std</span>
        <span className="text-[8px] text-white/20">₹9,500 Premium</span>
      </div>
    </div>
  );
}

/* ── Transaction block ── */
function TxCard({ tx, visible }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
    if (visible) { const t = setTimeout(() => setOpen(true), 700); return () => clearTimeout(t); }
  }, [visible, tx]);

  const col = tx.profit_pct >= 25 ? '#00f5a0' : tx.profit_pct >= 15 ? '#ffd32a' : '#a8adc8';

  return (
    <div style={{ opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(14px)', transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
      <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 flex items-center gap-2 mb-3">
        <div className="flex-1 h-px bg-white/[0.05]" />Transaction Record<div className="flex-1 h-px bg-white/[0.05]" />
      </div>

      {/* Profit highlight */}
      <div className="rounded-xl p-4 mb-3 flex justify-between items-center"
        style={{ background: `${col}0e`, border: `1px solid ${col}28` }}>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1">Net Profit</div>
          <div className="font-display text-xl font-extrabold" style={{ color: col }}>₹{fmtCr(tx.profit)}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-extrabold leading-none" style={{ color: col }}>{tx.profit_pct}%</div>
          <div className="text-[9px] text-white/25 uppercase tracking-wide">Return</div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          { l: 'Buyer',          v: tx.buyer,                           bold: true },
          { l: 'Purchase Date',  v: tx.purchase_date },
          { l: 'Purchase Price', v: `₹${fmtCr(tx.purchase_price)}` },
          { l: 'Sale Date',      v: tx.sale_date },
          { l: 'Sale Price',     v: `₹${fmtCr(tx.sale_price)}`,        bold: true },
        ].map((r, i) => (
          <div key={r.l} className="flex justify-between items-center px-4 py-2.5"
            style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <span className="text-xs text-white/30">{r.l}</span>
            <span className={`text-xs ${r.bold ? 'font-bold text-white' : 'text-white/70'}`}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlotDetail({ plot, onClose, onCompare, isComparing }) {
  const [mounted,  setMounted]  = useState(false);
  const [visible,  setVisible]  = useState(false);
  const prevRef = useRef(null);

  useEffect(() => {
    if (plot) {
      setMounted(true);
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 20);
      prevRef.current = plot;
      return () => clearTimeout(t);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 380);
      return () => clearTimeout(t);
    }
  }, [plot?.id, plot]);

  if (!mounted && !plot) return null;
  const p = plot || prevRef.current;
  if (!p) return null;

  const S_COL = { Available: '#00f5a0', Reserved: '#ffd32a', Sold: '#ff4757' };
  const T_COL = { Premium: '#a78bfa', High: '#60a5fa', Mid: '#34d399', Standard: '#94a3b8' };
  const sc = S_COL[p.status] || '#888';
  const tc = T_COL[p.tier]   || '#888';

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      className="fixed inset-0 z-[2000] flex justify-end"
      style={{
        background: visible ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        transition: 'background 0.35s ease, backdrop-filter 0.35s ease',
        pointerEvents: mounted ? 'all' : 'none',
      }}
    >
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        className="h-full flex flex-col overflow-hidden"
        style={{
          width: 'min(420px, 100vw)',
          background: 'linear-gradient(180deg,#0e1020 0%,#080a12 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-32px 0 80px rgba(0,0,0,0.7)',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── HERO HEADER ── */}
        <div className="relative flex-shrink-0 px-6 pt-6 pb-5"
          style={{ background: `linear-gradient(135deg,${sc}16 0%,transparent 60%)`, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

          {/* Glow orb */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle,${sc}18 0%,transparent 70%)` }} />

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm text-white/30 transition-all duration-150 hover:bg-red-500/30 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>✕</button>

          <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-8px)', transition: 'all 0.5s 0.05s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="font-display font-extrabold leading-none mb-1" style={{ fontSize: 'clamp(28px,6vw,38px)', color: sc, textShadow: `0 0 24px ${sc}50` }}>{p.id}</div>
            <div className="text-sm text-white/40 mb-3 leading-tight">{p.zone}</div>
          </div>

          <div className="flex flex-wrap gap-2"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(6px)', transition: 'all 0.45s 0.1s cubic-bezier(0.16,1,0.3,1)' }}>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide" style={{ background: `${sc}18`, color: sc, border: `1px solid ${sc}40` }}>{p.status}</span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold" style={{ background: `${tc}12`, color: tc, border: `1px solid ${tc}28` }}>{p.tier} Tier</span>
            <span className="px-3 py-1 rounded-full text-[11px] font-medium text-white/40" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>↗ {p.facing}</span>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Compare btn */}
          <div className="mb-5" style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(8px)', transition: 'all 0.4s 0.15s ease' }}>
            <button onClick={onCompare}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-85"
              style={{ background: isComparing ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,#6c63ff,#9b59b6)', border: isComparing ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              {isComparing ? '✓ Remove from Comparison' : '⊕ Add to Comparison'}
            </button>
          </div>

          {/* Score rings */}
          <div className="flex justify-around py-5 mb-5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', opacity: visible ? 1 : 0, transition: 'opacity 0.4s 0.2s ease' }}>
            <ScoreRing value={p.roi_score}          color={roiColor(p.roi_score)} label="ROI Score"    delay={300} />
            <ScoreRing value={p.connectivity_score} color="#6c63ff"               label="Connectivity" delay={450} />
          </div>

          {/* Pricing */}
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-white/[0.05]" />Pricing<div className="flex-1 h-px bg-white/[0.05]" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <Field label="Total Value" value={`₹${fmtCr(p.total_price)}`} color="#00f5a0" delay={250} accent="#00f5a0" />
            <Field label="Price / sqft" value={`₹${p.price_psf.toLocaleString('en-IN')}`} delay={300} />
          </div>

          <PriceBar psf={p.price_psf} visible={visible} />

          {/* Details */}
          <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 flex items-center gap-2 mb-3">
            <div className="flex-1 h-px bg-white/[0.05]" />Plot Details<div className="flex-1 h-px bg-white/[0.05]" />
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <Field label="Area"         value={`${p.area_sqft.toLocaleString('en-IN')} sqft`} delay={350} />
            <Field label="Dimensions"   value={p.dimensions}   delay={390} />
            <Field label="Demand Level" value={p.demand_level} color={p.demand_level === 'High' ? '#00f5a0' : '#ffd32a'} delay={430} />
            <Field label="Zone Tier"    value={p.tier}         delay={460} />
          </div>

          {/* Transaction */}
          {p.transaction && <TxCard tx={p.transaction} visible={visible} />}

          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}