import React, { useEffect, useRef, useState } from 'react';
import { fmtCr, roiColor } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

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
        setAnim((1 - Math.pow(1 - p, 3)) * value);
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
          <circle cx={42} cy={42} r={r} fill="none" stroke="var(--surface3)" strokeWidth={6} />
          <circle cx={42} cy={42} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, dash)} ${Math.max(0, circ - dash)}`}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-extrabold text-xl leading-none"
            style={{ color, textShadow: `0 0 12px ${color}60` }}>
            {Math.round(anim)}
          </span>
        </div>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>{label}</span>
    </div>
  );
}

function Field({ label, value, color, delay, accent }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    setVis(false);
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay, value]);

  return (
    <div className="rounded-xl p-3 relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--surface2)',
        border: `1px solid ${accent ? accent + '30' : 'var(--border)'}`,
        opacity: vis ? 1 : 0,
        transform: vis ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.97)',
        transition: 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.16,1,0.3,1)',
      }}>
      {accent && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,${accent},transparent)` }} />}
      <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text3)' }}>{label}</div>
      <div className="font-display font-bold text-sm leading-tight" style={{ color: color || 'var(--text)' }}>{value}</div>
    </div>
  );
}

function PriceBar({ psf, visible }) {
  const [w, setW] = useState(0);
  const pct = Math.max(5, Math.min(100, Math.round(((psf - 3000) / 7000) * 100)));
  const col = pct > 70 ? 'var(--accent)' : pct > 40 ? 'var(--gold)' : 'var(--accent2)';

  useEffect(() => {
    setW(0);
    if (visible) { const t = setTimeout(() => setW(pct), 500); return () => clearTimeout(t); }
  }, [visible, pct]);

  return (
    <div className="rounded-xl p-3.5 mb-4"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)', opacity: visible ? 1 : 0, transition: 'opacity 0.4s 0.45s ease' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text3)' }}>Price Tier Position</span>
        <span className="text-xs font-bold" style={{ color: col }}>₹{psf.toLocaleString('en-IN')} PSF</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface3)' }}>
        <div className="h-full rounded-full transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: `${w}%`, background: `linear-gradient(90deg,${col},${col}99)`, boxShadow: `0 0 8px ${col}60` }} />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[8px]" style={{ color: 'var(--text3)' }}>₹3,400 Std</span>
        <span className="text-[8px]" style={{ color: 'var(--text3)' }}>₹9,500 Premium</span>
      </div>
    </div>
  );
}

function TxCard({ tx, visible }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
    if (visible) { const t = setTimeout(() => setOpen(true), 700); return () => clearTimeout(t); }
  }, [visible, tx]);

  const col = tx.profit_pct >= 25 ? 'var(--accent2)' : tx.profit_pct >= 15 ? 'var(--gold)' : 'var(--text2)';

  return (
    <div style={{ opacity: open ? 1 : 0, transform: open ? 'translateY(0)' : 'translateY(14px)', transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)' }}>
      <div className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3" style={{ color: 'var(--text3)' }}>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        Transaction Record
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>
      {/* Profit highlight */}
      <div className="rounded-xl p-4 mb-3 flex justify-between items-center"
        style={{ background: 'var(--surface2)', border: `1px solid var(--border)`, borderLeft: `3px solid ${col}` }}>
        <div>
          <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text3)' }}>Net Profit</div>
          <div className="font-display text-xl font-extrabold" style={{ color: col }}>₹{fmtCr(tx.profit)}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-extrabold leading-none" style={{ color: col }}>{tx.profit_pct}%</div>
          <div className="text-[9px] uppercase tracking-wide" style={{ color: 'var(--text3)' }}>Return</div>
        </div>
      </div>
      {/* Details */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {[
          { l: 'Buyer',          v: tx.buyer,                        bold: true },
          { l: 'Purchase Date',  v: tx.purchase_date },
          { l: 'Purchase Price', v: `₹${fmtCr(tx.purchase_price)}` },
          { l: 'Sale Date',      v: tx.sale_date },
          { l: 'Sale Price',     v: `₹${fmtCr(tx.sale_price)}`,     bold: true },
        ].map((row, i) => (
          <div key={row.l} className="flex justify-between items-center px-4 py-2.5"
            style={{ background: i%2===0 ? 'var(--surface2)' : 'transparent', borderBottom: i<4 ? '1px solid var(--border)' : 'none' }}>
            <span className="text-xs" style={{ color: 'var(--text3)' }}>{row.l}</span>
            <span className={`text-xs ${row.bold ? 'font-bold' : ''}`} style={{ color: row.bold ? 'var(--text)' : 'var(--text2)' }}>{row.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlotDetail({ plot, onClose, onCompare, isComparing }) {
  const { dark } = useTheme();
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

  const S_COL = {
    Available: dark ? '#00f5a0' : '#00a862',
    Reserved:  dark ? '#ffd32a' : '#c49a00',
    Sold:      dark ? '#ff4757' : '#e03040',
  };
  const T_COL = { Premium:'#a78bfa', High:'#60a5fa', Mid:'#f59e0b', Standard:'#94a3b8' };
  const sc = S_COL[p.status] || '#888';
  const tc = T_COL[p.tier]   || '#888';

  return (
    <div onClick={onClose}
      className="fixed inset-0 z-[2000] flex justify-end"
      style={{
        background: visible ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background 0.35s ease, backdrop-filter 0.35s ease',
        pointerEvents: mounted ? 'all' : 'none',
      }}>
      <div onClick={e => e.stopPropagation()}
        className="h-full flex flex-col overflow-hidden"
        style={{
          width: 'min(420px, 100vw)',
          background: 'var(--bg2)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-24px 0 60px rgba(0,0,0,0.15)',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}>

        {/* Header */}
        <div className="relative flex-shrink-0 px-6 pt-6 pb-5"
          style={{ background: `linear-gradient(135deg, ${sc}12 0%, transparent 60%)`, borderBottom: '1px solid var(--border)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${sc}14 0%, transparent 70%)` }} />

          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-150"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', color: 'var(--text3)' }}
            onMouseEnter={e => Object.assign(e.currentTarget.style, { background:'#e0304022', color:'#e03040', borderColor:'#e03040' })}
            onMouseLeave={e => Object.assign(e.currentTarget.style, { background:'var(--surface2)', color:'var(--text3)', borderColor:'var(--border2)' })}>
            ✕
          </button>

          <div style={{ opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(-8px)', transition: 'all 0.5s 0.05s cubic-bezier(0.16,1,0.3,1)' }}>
            <div className="font-display font-extrabold leading-none mb-1"
              style={{ fontSize:'clamp(28px,6vw,38px)', color: sc, textShadow: `0 0 24px ${sc}40` }}>
              {p.id}
            </div>
            <div className="text-sm mb-3" style={{ color: 'var(--text2)' }}>{p.zone}</div>
          </div>

          <div className="flex flex-wrap gap-2"
            style={{ opacity: visible?1:0, transform: visible?'translateY(0)':'translateY(6px)', transition: 'all 0.45s 0.1s cubic-bezier(0.16,1,0.3,1)' }}>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
              style={{ background: `${sc}18`, color: sc, border: `1px solid ${sc}40` }}>{p.status}</span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: `${tc}14`, color: tc, border: `1px solid ${tc}28` }}>{p.tier} Tier</span>
            <span className="px-3 py-1 rounded-full text-[11px] font-medium"
              style={{ background: 'var(--surface2)', color: 'var(--text2)', border: '1px solid var(--border)' }}>↗ {p.facing}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Compare btn */}
          <div className="mb-5" style={{ opacity: visible?1:0, transition: 'all 0.4s 0.15s ease' }}>
            <button onClick={onCompare}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-85"
              style={{ background: isComparing ? 'var(--surface2)' : 'linear-gradient(135deg,var(--accent),#9b59b6)',
                border: isComparing ? '1px solid var(--border2)' : 'none',
                color: isComparing ? 'var(--text2)' : '#fff' }}>
              {isComparing ? '✓ Remove from Comparison' : '⊕ Add to Comparison'}
            </button>
          </div>

          {/* Score rings */}
          <div className="flex justify-around py-5 mb-5 rounded-2xl"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border)', opacity: visible?1:0, transition: 'opacity 0.4s 0.2s ease' }}>
            <ScoreRing value={p.roi_score}          color={roiColor(p.roi_score)} label="ROI Score"    delay={300} />
            <ScoreRing value={p.connectivity_score} color="var(--accent)"         label="Connectivity" delay={450} />
          </div>

          {/* Section label helper */}
          {['Pricing','Plot Details'].map((sec, si) => (
            <div key={sec}>
              <div className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3"
                style={{ color: 'var(--text3)' }}>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                {sec}
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
              {si === 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <Field label="Total Value" value={`₹${fmtCr(p.total_price)}`} color="var(--accent2)" delay={250} accent="var(--accent2)" />
                    <Field label="Price / sqft" value={`₹${p.price_psf.toLocaleString('en-IN')}`} delay={300} />
                  </div>
                  <PriceBar psf={p.price_psf} visible={visible} />
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  <Field label="Area"         value={`${p.area_sqft.toLocaleString('en-IN')} sqft`} delay={350} />
                  <Field label="Dimensions"   value={`${Math.round(Math.sqrt(p.area_sqm))} × ${Math.round(Math.sqrt(p.area_sqm))} m`} delay={390} />
                  <Field label="Demand Level" value={p.demand_level} color={p.demand_level==='High'?'var(--accent2)':'var(--gold)'} delay={430} />
                  <Field label="Zone Tier"    value={p.tier}         delay={460} />
                </div>
              )}
            </div>
          ))}

          {p.transaction && <TxCard tx={p.transaction} visible={visible} />}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}