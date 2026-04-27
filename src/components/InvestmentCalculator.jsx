import React, { useState, useMemo } from 'react';

const ZONES = [
  { id:'residential', label:'Residential',    cagr:18, desc:'~18% CAGR', color:'#6c63ff' },
  { id:'commercial',  label:'Commercial',      cagr:22, desc:'~22% CAGR', color:'#0abde3' },
  { id:'industrial',  label:'Industrial',      cagr:20, desc:'~20% CAGR', color:'#e17055' },
  { id:'solar',       label:'Solar / Energy',  cagr:15, desc:'~15% CAGR', color:'#ffd32a' },
  { id:'it',          label:'IT / Knowledge',  cagr:24, desc:'~24% CAGR', color:'#00f5a0' },
  { id:'logistics',   label:'Logistics',       cagr:19, desc:'~19% CAGR', color:'#fd79a8' },
];

const BENCHMARKS = [
  { label:'Dholera SIR',      cagr:null,  color:'var(--accent)'  },  // dynamic
  { label:'Ahmedabad RE',     cagr:10,    color:'#6ab04c'        },
  { label:'Mumbai RE',        cagr:8,     color:'#0abde3'        },
  { label:'Mutual Funds',     cagr:12,    color:'#a29bfe'        },
  { label:'Fixed Deposit',    cagr:7,     color:'#fdcb6e'        },
];

function fmtCr(v) {
  if (v >= 1e7) return (v/1e7).toFixed(2) + ' Cr';
  if (v >= 1e5) return (v/1e5).toFixed(2) + ' L';
  return v.toLocaleString('en-IN');
}

function Slider({ label, value, min, max, step, onChange, displayVal, rangeLabel }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-6">
      <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{color:'var(--text3)'}}>{label}</div>
      <div className="text-2xl font-display font-extrabold mb-2" style={{color:'var(--accent)'}}>{displayVal}</div>
      <div className="relative">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${pct}%, var(--surface3) ${pct}%, var(--surface3) 100%)`,
            outline: 'none',
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px]" style={{color:'var(--text3)'}}>{typeof min === 'number' ? min.toLocaleString('en-IN') : min}</span>
        <span className="text-[10px]" style={{color:'var(--text3)'}}>{rangeLabel}</span>
      </div>
    </div>
  );
}

function BarChart({ data, maxVal, color }) {
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="text-xs font-semibold w-12 text-right flex-shrink-0" style={{color:'var(--text3)'}}>{d.label}</div>
          <div className="flex-1 relative h-8 rounded-lg overflow-hidden" style={{background:'var(--surface3)'}}>
            <div className="h-full rounded-lg flex items-center px-3 transition-all duration-700 ease-out"
              style={{
                width: `${Math.max(4, (d.value/maxVal)*100)}%`,
                background: d.color || color,
                minWidth: 60,
              }}>
              <span className="text-xs font-bold text-white whitespace-nowrap">₹{fmtCr(d.value)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BenchmarkChart({ cagr, investment }) {
  const bmarks = BENCHMARKS.map(b => ({
    ...b,
    cagr: b.cagr === null ? cagr : b.cagr,
  }));
  const maxCagr = Math.max(...bmarks.map(b => b.cagr));
  return (
    <div className="space-y-3">
      {bmarks.map((b, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="text-xs font-semibold w-28 flex-shrink-0" style={{color:'var(--text2)'}}>{b.label}</div>
          <div className="flex-1 relative h-8 rounded-lg overflow-hidden" style={{background:'var(--surface3)'}}>
            <div className="h-full rounded-lg flex items-center px-3 transition-all duration-700 ease-out"
              style={{ width:`${Math.max(8,(b.cagr/maxCagr)*100)}%`, background:b.color }}>
              <span className="text-xs font-bold text-white whitespace-nowrap">{b.cagr}% CAGR</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InvestmentCalculator() {
  const [area,      setArea]      = useState(1000);
  const [entryPsm,  setEntryPsm]  = useState(2500);
  const [holdYears, setHoldYears] = useState(5);
  const [zone,      setZone]      = useState(ZONES[0]);

  const calc = useMemo(() => {
    const investment   = area * entryPsm;
    const cagr         = zone.cagr / 100;
    const exitValue    = investment * Math.pow(1 + cagr, holdYears);
    const profit       = exitValue - investment;
    const totalReturn  = ((profit / investment) * 100).toFixed(1);
    const yearByYear   = Array.from({ length: holdYears }, (_, i) => ({
      label: `Year ${i+1}`,
      value: Math.round(investment * Math.pow(1 + cagr, i + 1)),
      color: zone.color,
    }));
    return { investment, exitValue, profit, totalReturn, yearByYear, cagr: zone.cagr };
  }, [area, entryPsm, holdYears, zone]);

  const maxYearVal = Math.max(...calc.yearByYear.map(y => y.value));

  return (
    <div className="h-full overflow-y-auto" style={{background:'var(--bg)'}}>
      <div className="max-w-[1200px] mx-auto p-4 md:p-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl mb-2" style={{color:'var(--text)'}}>
            Investment Calculator
          </h1>
          <p className="text-sm" style={{color:'var(--text3)'}}>
            Model your returns across Dholera SIR land categories based on real appreciation trends and infrastructure timelines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: Controls ── */}
          <div>
            {/* Sliders */}
            <div className="rounded-2xl p-5 mb-5" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
              <Slider label="Land Area (sq. metres)"
                value={area} min={500} max={50000} step={100}
                onChange={setArea}
                displayVal={`${area.toLocaleString('en-IN')} sq.m`}
                rangeLabel="500 – 50,000 sq.m" />
              <Slider label="Entry Price (₹ per sq.m)"
                value={entryPsm} min={500} max={8000} step={100}
                onChange={setEntryPsm}
                displayVal={`₹${entryPsm.toLocaleString('en-IN')}/sq.m`}
                rangeLabel="₹500 – ₹8,000" />
              <Slider label="Hold Period (Years)"
                value={holdYears} min={2} max={10} step={1}
                onChange={setHoldYears}
                displayVal={`${holdYears} Year${holdYears>1?'s':''}`}
                rangeLabel="2 – 10 Years" />
            </div>

            {/* Zone selector */}
            <div className="rounded-2xl p-5" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{color:'var(--text3)'}}>Land Zone</div>
              <div className="grid grid-cols-2 gap-2.5">
                {ZONES.map(z => (
                  <button key={z.id} onClick={() => setZone(z)}
                    className="rounded-xl p-3 text-left transition-all duration-150"
                    style={{
                      background: zone.id===z.id ? `${z.color}18` : 'var(--surface2)',
                      border: zone.id===z.id ? `1.5px solid ${z.color}` : '1.5px solid var(--border)',
                    }}>
                    <div className="text-sm font-bold" style={{color: zone.id===z.id ? z.color : 'var(--text)'}}>{z.label}</div>
                    <div className="text-[11px] mt-0.5" style={{color:'var(--text3)'}}>{z.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Outputs ── */}
          <div className="space-y-5">

            {/* Exit value hero */}
            <div className="rounded-2xl p-5" style={{background:`linear-gradient(135deg, ${zone.color}10, var(--surface))`, border:`1px solid ${zone.color}30`}}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'var(--text3)'}}>Projected Exit Value</div>
              <div className="font-display font-extrabold mb-1" style={{fontSize:'clamp(36px,6vw,56px)', color:zone.color, lineHeight:1}}>
                ₹{fmtCr(calc.exitValue)}
              </div>
              <div className="text-xs" style={{color:'var(--text3)'}}>after {holdYears} year{holdYears>1?'s':''} in {zone.label}</div>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:'Total Investment', val:`₹${fmtCr(calc.investment)}`, color:'var(--text)' },
                { label:'Profit',           val:`₹${fmtCr(calc.profit)}`,     color:'var(--accent2)' },
                { label:'CAGR',             val:`${calc.cagr}%`,              color:zone.color },
                { label:'Total Return',     val:`${calc.totalReturn}%`,        color:'var(--gold)' },
              ].map(k => (
                <div key={k.label} className="rounded-xl p-4" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
                  <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:'var(--text3)'}}>{k.label}</div>
                  <div className="font-display font-extrabold text-xl leading-none" style={{color:k.color}}>{k.val}</div>
                </div>
              ))}
            </div>

            {/* Year by year chart */}
            <div className="rounded-2xl p-5" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{color:'var(--text3)'}}>
                Projected Value — Year by Year
              </div>
              <BarChart data={calc.yearByYear} maxVal={maxYearVal} color={zone.color} />
            </div>

            {/* Benchmark chart */}
            <div className="rounded-2xl p-5" style={{background:'var(--surface)', border:'1px solid var(--border)'}}>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{color:'var(--text3)'}}>
                Dholera vs Other Investment Classes
              </div>
              <BenchmarkChart cagr={calc.cagr} investment={calc.investment} />
            </div>

          </div>
        </div>
      </div>

      {/* Slider thumb style */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--bg2);
          box-shadow: 0 0 8px var(--accent);
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--accent);
          border: 2px solid var(--bg2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}