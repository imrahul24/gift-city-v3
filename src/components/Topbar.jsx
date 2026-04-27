import React from 'react';
import { fmtCr } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

export default function Topbar({ plots, onMenuToggle, sidebarOpen }) {
  const { dark, toggle } = useTheme();
  const avail = plots.filter(p => p.status === 'Available').length;
  const rev   = plots.filter(p => p.status === 'Sold').reduce((s, p) => s + p.total_price, 0);
  const portf = plots.filter(p => p.status === 'Available').reduce((s, p) => s + p.total_price, 0);

  return (
    <header className="topbar-line relative flex items-center gap-3 lg:gap-5 px-4 lg:px-6 z-30 flex-shrink-0 transition-colors duration-300"
      style={{ height:60, background:'var(--bg2)', borderBottom:'1px solid var(--border)' }}>

      {/* Hamburger */}
      <button onClick={onMenuToggle}
        className="lg:hidden flex flex-col justify-center gap-[5px] w-9 h-9 rounded-xl items-center flex-shrink-0 hover:opacity-70 transition-opacity"
        style={{ border:'1px solid var(--border2)', background:'transparent' }}>
        <span className={`block w-4 h-0.5 transition-all duration-200 ${sidebarOpen?'rotate-45 translate-y-[7px]':''}`} style={{background:'var(--text2)'}} />
        <span className={`block w-4 h-0.5 transition-all duration-200 ${sidebarOpen?'opacity-0 scale-x-0':''}`} style={{background:'var(--text2)'}} />
        <span className={`block w-4 h-0.5 transition-all duration-200 ${sidebarOpen?'-rotate-45 -translate-y-[7px]':''}`} style={{background:'var(--text2)'}} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-extrabold text-lg text-white flex-shrink-0"
          style={{ background:'linear-gradient(135deg,#6c63ff,#00f5a0)' }}>G</div>
        <div className="hidden sm:block">
          <div className="font-display font-extrabold text-sm tracking-wide" style={{color:'var(--text)'}}>GIFT CITY</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest leading-none" style={{color:'var(--text3)'}}>Land Intelligence</div>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-px ml-auto">
        {[
          { label:'Available', val:avail,              color:'var(--accent2)' },
          { label:'Revenue',   val:`₹${fmtCr(rev)}`,  color:'var(--text)'   },
          { label:'Portfolio', val:`₹${fmtCr(portf)}`, color:'var(--gold)'  },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center px-4 lg:px-5" style={{borderLeft:'1px solid var(--border)'}}>
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{color:'var(--text3)'}}>{s.label}</span>
            <span className="font-display text-base lg:text-lg font-extrabold leading-tight" style={{color:s.color}}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Mobile available count */}
      <div className="md:hidden ml-auto flex items-center gap-2">
        <span className="text-[10px] font-semibold" style={{color:'var(--text3)'}}>Available</span>
        <span className="font-display text-xl font-extrabold" style={{color:'var(--accent2)'}}>{avail}</span>
      </div>

      {/* Dark/Light toggle */}
      <button onClick={toggle}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 hover:opacity-80 flex-shrink-0 ml-2"
        style={{ background:'var(--surface2)', border:'1px solid var(--border2)' }}
        title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <span className="text-base leading-none">{dark ? '☀️' : '🌙'}</span>
      </button>

      {/* Admin badge */}
      <div className="hidden sm:flex px-3 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest text-white"
        style={{ background:'linear-gradient(135deg,#6c63ff,#9b59b6)' }}>Admin</div>
    </header>
  );
}