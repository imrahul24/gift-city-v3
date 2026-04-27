import React, { useState, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import MapView from './components/MapView';
import Dashboard from './components/Dashboard';
import PlotRegistry from './components/PlotRegistry';
import TransactionRegistry from './components/TransactionRegistry';
import PlotDetail from './components/PlotDetail';
import ComparisonModal from './components/ComparisonModal';
import { PLOTS } from './data/usePlots';
import './index.css';

const NAV = [
  { id: 'map',          icon: '🗺',  label: 'Map' },
  { id: 'dashboard',    icon: '📊',  label: 'Dashboard' },
  { id: 'list',         icon: '🏙',  label: 'Registry' },
  { id: 'transactions', icon: '💸',  label: 'Transactions' },
];

export default function App() {
  const [activeView, setActiveView]     = useState('map');
  const [filters, setFilters]           = useState({ status: '', zone: '' });
  const [selectedPlotId, setSelectedPlotId] = useState(null);
  const [compareIds, setCompareIds]     = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);  // mobile drawer

  const filteredPlots = useMemo(() =>
    PLOTS.filter(p =>
      (!filters.status || p.status === filters.status) &&
      (!filters.zone   || p.zone   === filters.zone)
    ), [filters]);

  const selectedPlot = useMemo(() =>
    PLOTS.find(p => p.id === selectedPlotId), [selectedPlotId]);

  const handleSelectPlot = useCallback((id) => {
    setSelectedPlotId(id);
    // On mobile, switch to map if coming from list/dashboard
    if (window.innerWidth < 768) setActiveView('map');
  }, []);

  const toggleCompare = useCallback((id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg">

      {/* ── TOPBAR ── */}
      <Topbar
        plots={PLOTS}
        onMenuToggle={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
      />

      {/* ── BODY (sidebar + content) ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — hidden on mobile unless open */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 flex-shrink-0
        `}>
          <Sidebar
            activeView={activeView}
            setActiveView={(v) => { setActiveView(v); setSidebarOpen(false); }}
            filters={filters}
            setFilters={setFilters}
            plots={PLOTS}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Content views — no tabs bar, navigation is in sidebar only */}
          <div className="flex-1 overflow-hidden relative">
            {activeView === 'map' && (
              <MapView
                plots={filteredPlots}
                allPlots={PLOTS}
                onSelectPlot={handleSelectPlot}
                compareIds={compareIds}
                onToggleCompare={toggleCompare}
              />
            )}
            {activeView === 'dashboard' && (
              <Dashboard
                plots={PLOTS}
                onSelectPlot={(id) => { handleSelectPlot(id); setActiveView('map'); }}
              />
            )}
            {activeView === 'list' && (
              <PlotRegistry
                plots={filteredPlots}
                onSelectPlot={handleSelectPlot}
                compareIds={compareIds}
                onToggleCompare={toggleCompare}
              />
            )}
            {activeView === 'transactions' && (
              <TransactionRegistry
                plots={PLOTS}
                onSelectPlot={(id) => { handleSelectPlot(id); setActiveView('map'); }}
              />
            )}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden flex items-center justify-around bg-surface border-t border-white/[0.07] px-2 py-1 z-30 flex-shrink-0 mobile-nav-enter">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-150 ${
              activeView === item.id
                ? 'text-white bg-white/10'
                : 'text-white/40'
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── PLOT DETAIL PANEL ── */}
      <PlotDetail
        plot={selectedPlot}
        onClose={() => setSelectedPlotId(null)}
        onCompare={() => selectedPlot && toggleCompare(selectedPlot.id)}
        isComparing={selectedPlot ? compareIds.includes(selectedPlot.id) : false}
      />

      {/* ── COMPARE BAR ── */}
      {compareIds.length > 0 && !showComparison && (
        <div className="compare-bar-anim fixed bottom-16 lg:bottom-6 left-1/2 z-[1500] flex items-center gap-3 px-5 py-3 rounded-2xl"
          style={{ background: 'rgba(8,9,13,0.95)', backdropFilter: 'blur(16px)', border: '1px solid rgba(108,99,255,0.5)', boxShadow: '0 0 40px rgba(108,99,255,0.25)' }}>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/30">Comparing</div>
            <div className="font-display text-xl font-extrabold text-accent">{compareIds.length} Plot{compareIds.length > 1 ? 's' : ''}</div>
          </div>
          <div className="text-xs text-white/30 hidden sm:block">{compareIds.join(', ')}</div>
          <button onClick={() => setShowComparison(true)} className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-80" style={{ background: 'linear-gradient(135deg,#6c63ff,#9b59b6)' }}>
            Compare →
          </button>
          <button onClick={() => setCompareIds([])} className="px-3 py-2 rounded-lg text-xs font-semibold text-white/40 border border-white/10 hover:text-white/60 transition-colors">
            Clear
          </button>
        </div>
      )}

      {/* ── COMPARISON MODAL ── */}
      {showComparison && (
        <ComparisonModal
          plots={PLOTS.filter(p => compareIds.includes(p.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
}