import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import PlotRegistry from './components/PlotRegistry';
import InvestmentCalculator from './components/InvestmentCalculator';
import MomentumDashboard from './components/MomentumDashboard';
import TransactionRegistry from './components/TransactionRegistry';
import PlotDetail from './components/PlotDetail';
import ComparisonModal from './components/ComparisonModal';
import { loadPlots } from './data/usePlots';
import './index.css';

const NAV = [
  { id:'map',   icon:'🗺', label:'Map'        },
  { id:'list',  icon:'🏙', label:'Registry'   },
  { id:'calc',  icon:'🧮', label:'Calculator' },
  { id:'momentum', icon:'🚀', label:'Momentum'   },
];

export default function App() {
  const [plots,       setPlots]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeView,  setActiveView]  = useState('map');
  const [filters,     setFilters]     = useState({ status:'', zone:'' });
  const [selectedId,  setSelectedId]  = useState(null);
  const [compareIds,  setCompareIds]  = useState([]);
  const [showCmp,     setShowCmp]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load plots from GeoJSON on mount
  useEffect(() => {
    loadPlots().then(p => { setPlots(p); setLoading(false); });
  }, []);

  const filtered = useMemo(() =>
    plots.filter(p =>
      (!filters.status || p.status === filters.status) &&
      (!filters.zone   || p.zone   === filters.zone)
    ), [plots, filters]);

  const selectedPlot = useMemo(() => plots.find(p => p.id === selectedId), [plots, selectedId]);

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
    if (window.innerWidth < 1024) setActiveView('map');
  }, []);

  const toggleCompare = useCallback((id) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x!==id)
      : prev.length >= 3 ? prev : [...prev, id]
    );
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-screen"
      style={{ background:'var(--bg)' }}>
      <div className="text-center">
        <div className="font-display font-extrabold text-3xl mb-3" style={{ color:'var(--accent)' }}>
          GIFT CITY
        </div>
        <div className="text-sm mb-6" style={{ color:'var(--text3)' }}>Loading land intelligence data…</div>
        <div className="flex gap-1.5 justify-center">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full animate-bounce"
              style={{ background:'var(--accent)', animationDelay:`${i*0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background:'var(--bg)' }}>

      <Topbar plots={plots} onMenuToggle={() => setSidebarOpen(o=>!o)} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto w-64 flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <Sidebar
            activeView={activeView}
            setActiveView={(v) => { setActiveView(v); setSidebarOpen(false); }}
            filters={filters}
            setFilters={setFilters}
            plots={plots}
          />
        </div>

        {/* Main */}
        <main className="flex-1 overflow-hidden min-w-0">
          <div className="h-full">
            {activeView==='map' && (
              <MapView plots={filtered} allPlots={plots}
                onSelectPlot={handleSelect} compareIds={compareIds}
                onToggleCompare={toggleCompare} />
            )}
            {activeView==='list' && (
              <PlotRegistry plots={filtered} onSelectPlot={handleSelect}
                compareIds={compareIds} onToggleCompare={toggleCompare} />
            )}
            {activeView==='calc' && <InvestmentCalculator />}
            {activeView==='momentum' && <MomentumDashboard />}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden flex items-center justify-around border-t z-30 flex-shrink-0 py-1"
        style={{ background:'var(--surface)', borderColor:'var(--border)' }}>
        {NAV.map(item => (
          <button key={item.id} onClick={() => setActiveView(item.id)}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150"
            style={{ color: activeView===item.id ? 'var(--text)' : 'var(--text3)',
              background: activeView===item.id ? 'var(--surface2)' : 'transparent' }}>
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      <PlotDetail
        plot={selectedPlot}
        onClose={() => setSelectedId(null)}
        onCompare={() => selectedPlot && toggleCompare(selectedPlot.id)}
        isComparing={selectedPlot ? compareIds.includes(selectedPlot.id) : false}
      />

      {compareIds.length > 0 && !showCmp && (
        <div className="compare-bar-anim fixed bottom-16 lg:bottom-6 left-1/2 z-[1500] flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{ background:'rgba(8,9,13,0.95)', backdropFilter:'blur(16px)',
            border:'1px solid rgba(108,99,255,0.5)', boxShadow:'0 0 40px rgba(108,99,255,0.25)',
            transform:'translateX(-50%)' }}>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/30">Comparing</div>
            <div className="font-display text-xl font-extrabold" style={{color:'var(--accent)'}}>
              {compareIds.length} Plot{compareIds.length>1?'s':''}
            </div>
          </div>
          <div className="text-xs hidden sm:block" style={{color:'var(--text3)'}}>{compareIds.join(', ')}</div>
          <button onClick={() => setShowCmp(true)}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white"
            style={{ background:'linear-gradient(135deg,#6c63ff,#9b59b6)' }}>
            Compare →
          </button>
          <button onClick={() => setCompareIds([])}
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ border:'1px solid var(--border)', color:'var(--text3)' }}>
            Clear
          </button>
        </div>
      )}

      {showCmp && (
        <ComparisonModal
          plots={plots.filter(p => compareIds.includes(p.id))}
          onClose={() => setShowCmp(false)}
        />
      )}
    </div>
  );
}