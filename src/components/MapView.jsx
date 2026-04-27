import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useTheme } from '../context/ThemeContext';
import { roiColor } from '../utils/formatters';
import { generateSyntheticBoundary } from '../utils/geo';
import geoData from '../data/gift_city.geojson';
import { LANDMARKS } from '../utils/landmarks';

const MAPTILER_KEY = 'UNTKL1aWlNVwRZtvgWWA';

const S_COL       = { Available:'#00f5a0', Reserved:'#ffd32a', Sold:'#ff4757' };
const S_COL_LIGHT = { Available:'#00a862', Reserved:'#c49a00', Sold:'#d42030' };

const BOUNDS  = [[72.0184, 21.9876],[72.3736, 22.3510]];
const CENTER  = [72.1960, 22.1693];

const ZONE_COLORS = {
  'CBD City Center':                             '#6c63ff',
  'Industrial Knowledge & IT Phase':             '#0abde3',
  'Mixed Use - Commercial & Residential Phase':  '#ff6b81',
  'Logistics Phase':                             '#f9ca24',
  'Tourism Phase':                               '#6ab04c',
  'Industrial Phase':                            '#e17055',
  'Infrastructure Phase':                        '#a29bfe',
  'Residential  Medium to High Density Phase':   '#fd79a8',
  'Recreational & Sports Phase':                 '#55efc4',
  'Public Facility Zone':                        '#fdcb6e',
};

// Pre-build GeoJSON collections from imported geoData (no fetch needed)
const GEO = (() => {
  const polys = geoData.features.filter(f => f.geometry.type === 'Polygon');
  return {
    zones:  { type:'FeatureCollection', features: polys.filter(f => ZONE_COLORS[f.properties.name]) },
    nature: { type:'FeatureCollection', features: polys.filter(f =>
      ['Waterbody','River','Green Park Land & Canals','Agriculture',
       'Coastal Regulation Zone','Solar Energy Park','Gamtal','Village Buffer','Road','Bridge']
      .includes(f.properties.name)
    )},
    tp: { type:'FeatureCollection', features: polys.filter(f => f.properties.name?.startsWith('TP')) },
  };
})();

function makePointGeoJSON(plots, heatmap, dark) {
  const sc = dark ? S_COL : S_COL_LIGHT;
  return {
    type: 'FeatureCollection',
    features: plots.map(p => ({
      type: 'Feature', id: p.id,
      properties: {
        id: p.id, status: p.status, zone: p.zone,
        roi: p.roi_score, price: p.total_price,
        psf: p.price_psf, area: p.area_sqft, tier: p.tier,
        color: heatmap ? roiColor(p.roi_score) : (sc[p.status] || '#888'),
      },
      geometry: { type:'Point', coordinates:[p.lon, p.lat] },
    })),
  };
}

function makePolyGeoJSON(plots, heatmap, dark) {
  const sc = dark ? S_COL : S_COL_LIGHT;
  return {
    type: 'FeatureCollection',
    features: plots.map(p => {
      const side = Math.round(Math.sqrt(p.area_sqm || 5000));
      const corners = generateSyntheticBoundary(p.lat, p.lon, `${side} x ${side}`);
      const coords  = [...corners.map(c => [c[1], c[0]]), [corners[0][1], corners[0][0]]];
      return {
        type: 'Feature', id: p.id,
        properties: {
          id: p.id, status: p.status, zone: p.zone,
          roi: p.roi_score, price: p.total_price,
          psf: p.price_psf, area: p.area_sqft, tier: p.tier,
          color: heatmap ? roiColor(p.roi_score) : (sc[p.status] || '#888'),
          extH: Math.round(p.roi_score * 80),
        },
        geometry: { type:'Polygon', coordinates:[coords] },
      };
    }),
  };
}

function popupHTML(props, dark) {
  const sc  = dark ? (S_COL[props.status]||'#888') : (S_COL_LIGHT[props.status]||'#666');
  const rc  = roiColor(props.roi);
  const bg  = dark ? 'rgba(8,9,13,0.97)'     : 'rgba(255,255,255,0.98)';
  const txt = dark ? '#f0f2ff'                : '#0f1117';
  const sub = dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)';
  const cel = dark ? 'rgba(255,255,255,0.05)': 'rgba(0,0,0,0.04)';
  return `<div style="min-width:200px;font-family:'DM Sans',sans-serif;background:${bg};border-radius:14px;padding:14px;color:${txt}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;color:${sc}">${props.id}</span>
      <span style="padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700;background:${sc}22;color:${sc};border:1px solid ${sc}44">${props.status}</span>
    </div>
    <div style="font-size:11px;color:${sub};margin-bottom:9px">${props.zone}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:9px">
      ${[['Value',`₹${(props.price/1e7).toFixed(2)} Cr`,''],['PSF',`₹${Number(props.psf).toLocaleString('en-IN')}`,''],['ROI',props.roi,rc],['Area',`${Number(props.area).toLocaleString('en-IN')} sqft`,'']]
        .map(([l,v,c])=>`<div style="background:${cel};border-radius:7px;padding:5px 8px">
          <div style="font-size:9px;color:${sub};text-transform:uppercase;letter-spacing:.08em">${l}</div>
          <div style="font-weight:700;font-size:12px;color:${c||txt}">${v}</div></div>`).join('')}
    </div>
    <div style="font-size:10px;color:${sub};text-align:center;border-top:1px solid ${dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.07)'};padding-top:7px">🖱 Click to open full details</div>
  </div>`;
}

function addLayers(map, isDark, plots) {
  // ── Nature ──
  map.addSource('nature', { type:'geojson', data:GEO.nature });
  map.addLayer({ id:'water-fill', type:'fill', source:'nature',
    filter:['in',['get','name'],['literal',['Waterbody','River','Coastal Regulation Zone']]],
    paint:{ 'fill-color':['match',['get','name'],'Waterbody','#1a6fa8','River','#1565c0','#00838f'], 'fill-opacity':0.55 }});
  map.addLayer({ id:'green-fill', type:'fill', source:'nature',
    filter:['in',['get','name'],['literal',['Green Park Land & Canals','Agriculture','Solar Energy Park']]],
    paint:{ 'fill-color':['match',['get','name'],'Green Park Land & Canals','#1b5e20','Agriculture','#33691e','#e65100'], 'fill-opacity':0.4 }});
  map.addLayer({ id:'other-fill', type:'fill', source:'nature',
    filter:['in',['get','name'],['literal',['Gamtal','Village Buffer','Road','Bridge']]],
    paint:{ 'fill-color':['match',['get','name'],'Gamtal','#4e342e','Village Buffer','#5d4037','Road','#37474f','#455a64'], 'fill-opacity':0.22 }});
  map.addLayer({ id:'water-line', type:'line', source:'nature',
    filter:['in',['get','name'],['literal',['Waterbody','River','Coastal Regulation Zone']]],
    paint:{ 'line-color':'#29b6f6', 'line-opacity':0.6, 'line-width':1 }});
  map.addLayer({ id:'green-line', type:'line', source:'nature',
    filter:['in',['get','name'],['literal',['Green Park Land & Canals','Agriculture']]],
    paint:{ 'line-color':'#66bb6a', 'line-opacity':0.5, 'line-width':0.8 }});

  // ── Zones ──
  map.addSource('zones', { type:'geojson', data:GEO.zones });
  map.addLayer({ id:'zones-fill', type:'fill', source:'zones', paint:{
    'fill-color':['match',['get','name'],...Object.entries(ZONE_COLORS).flat(),'#6b7280'],
    'fill-opacity': isDark ? 0.12 : 0.18 }});
  map.addLayer({ id:'zones-line', type:'line', source:'zones', paint:{
    'line-color':['match',['get','name'],...Object.entries(ZONE_COLORS).flat(),'#6b7280'],
    'line-opacity': isDark ? 0.45 : 0.55, 'line-width':1.5 }});

  // ── TP boundaries ──
  map.addSource('tp', { type:'geojson', data:GEO.tp });
  map.addLayer({ id:'tp-line', type:'line', source:'tp',
    paint:{ 'line-color': isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)', 'line-width':1 }});

  // ── Plot circles (2D) ──
  map.addSource('plots-pts', { type:'geojson', data:makePointGeoJSON(plots, false, isDark), generateId:true });
  map.addLayer({ id:'plots-circle', type:'circle', source:'plots-pts', layout:{ visibility:'visible' }, paint:{
    'circle-radius':        ['interpolate',['linear'],['zoom'], 8,4, 10,7, 12,11, 14,16],
    'circle-color':         ['get','color'],
    'circle-opacity':       0.95,
    'circle-stroke-width':  2,
    'circle-stroke-color':  ['get','color'],
    'circle-stroke-opacity':0.4,
  }});

  // ── Plot polygons + 3D (hidden until 3D mode on) ──
  map.addSource('plots-poly', { type:'geojson', data:makePolyGeoJSON(plots, false, isDark), generateId:true });
  map.addLayer({ id:'plots-poly', type:'fill', source:'plots-poly', layout:{ visibility:'none' },
    paint:{ 'fill-color':['get','color'], 'fill-opacity':0.85 }});
  map.addLayer({ id:'plots-3d', type:'fill-extrusion', source:'plots-poly', layout:{ visibility:'none' }, paint:{
    'fill-extrusion-color':   ['get','color'],
    'fill-extrusion-height':  ['get','extH'],
    'fill-extrusion-base':    0,
    'fill-extrusion-opacity': 0.85,
  }});
}

export default function MapView({ plots, allPlots, onSelectPlot, compareIds }) {
  const { dark } = useTheme();
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const popupRef     = useRef(null);
  const onSelectRef  = useRef(onSelectPlot);
  const darkRef      = useRef(dark);
  useEffect(() => { onSelectRef.current = onSelectPlot; }, [onSelectPlot]);
  useEffect(() => { darkRef.current = dark; }, [dark]);

  const [heatmap,      setHeatmap]      = useState(false);
  const [topOnly,      setTopOnly]      = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const [globe3d,      setGlobe3d]      = useState(false);
  const [showNature,   setShowNature]   = useState(true);
  const [mapReady,     setMapReady]     = useState(false);
  const [visibleCount, setVisibleCount] = useState(allPlots.length);

  const visible = useMemo(() => plots.filter(p => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (topOnly && p.roi_score < 70) return false;
    return true;
  }), [plots, filterStatus, topOnly]);

  const showPopup = useCallback((map) => (e) => {
    if (!e.features?.length) return;
    map.getCanvas().style.cursor = 'pointer';
    if (!popupRef.current)
      popupRef.current = new mapboxgl.Popup({ closeButton:false, closeOnClick:false, offset:16 });
    popupRef.current.setLngLat(e.lngLat)
      .setHTML(popupHTML(e.features[0].properties, darkRef.current))
      .addTo(map);
  }, []);

  const hidePopup = useCallback((map) => () => {
    map.getCanvas().style.cursor = '';
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
  }, []);

  const handleClick = useCallback(() => (e) => {
    if (!e.features?.length) return;
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
    onSelectRef.current(e.features[0].properties.id);
  }, []);

  // ── INIT MAP ──
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const styleUrl = dark
      ? `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_KEY}`
      : `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleUrl,
      bounds: BOUNDS,          // ← fit to GIFT City on load, no fitBounds needed
      fitBoundsOptions: { padding: 40 },
      pitch: 0, bearing: 0, antialias: true,
      maxBounds: [[71.5,21.5],[72.9,22.8]],
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass:true, visualizePitch:true }), 'bottom-right');

    map.on('load', () => {
      addLayers(map, dark, allPlots);

      const sp = showPopup(map);
      const hp = hidePopup(map);
      const hc = handleClick(map);

      ['plots-circle','plots-poly','plots-3d'].forEach(layer => {
        map.on('mousemove',  layer, sp);
        map.on('mouseleave', layer, hp);
        map.on('click',      layer, hc);
      });

      setVisibleCount(allPlots.length);
      setMapReady(true);
    });

    mapRef.current = map;
    return () => {
      if (popupRef.current) { try { popupRef.current.remove(); } catch(_){} }
      map.remove(); mapRef.current = null;
    };
  }, []); // eslint-disable-line

  // ── Theme change ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    setMapReady(false);
    const newStyle = dark
      ? `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_KEY}`
      : `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`;
    map.setStyle(newStyle);
    map.once('styledata', () => {
      addLayers(map, dark, visible);
      const sp = showPopup(map), hp = hidePopup(map), hc = handleClick(map);
      ['plots-circle','plots-poly','plots-3d'].forEach(l => {
        map.on('mousemove',l,sp); map.on('mouseleave',l,hp); map.on('click',l,hc);
      });
      if (globe3d) {
        map.setLayoutProperty('plots-circle','visibility','none');
        map.setLayoutProperty('plots-poly',  'visibility','visible');
        map.setLayoutProperty('plots-3d',    'visibility','visible');
      }
      setMapReady(true);
    });
  }, [dark]); // eslint-disable-line

  // ── Update plot data ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const ptSrc  = map.getSource('plots-pts');
    const polSrc = map.getSource('plots-poly');
    if (ptSrc)  ptSrc.setData(makePointGeoJSON(visible, heatmap, dark));
    if (polSrc) polSrc.setData(makePolyGeoJSON(visible, heatmap, dark));
    setVisibleCount(visible.length);
  }, [mapReady, visible, heatmap, dark]);

  // ── 3D toggle ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const sv = (id, v) => { if (map.getLayer(id)) map.setLayoutProperty(id,'visibility',v); };
    if (globe3d) {
      sv('plots-circle','none'); sv('plots-poly','visible'); sv('plots-3d','visible');
    } else {
      sv('plots-circle','visible'); sv('plots-poly','none'); sv('plots-3d','none');
    }
    map.easeTo({ pitch:globe3d?58:0, bearing:globe3d?-18:0, duration:900 });
  }, [globe3d, mapReady]);

  // ── Nature toggle ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const v = showNature ? 'visible' : 'none';
    ['water-fill','water-line','green-fill','green-line','other-fill'].forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id,'visibility',v);
    });
  }, [showNature, mapReady]);

  const handleReset = useCallback(() => {
    setHeatmap(false); setTopOnly(false); setFilterStatus(null); setGlobe3d(false); setShowNature(true);
    if (mapRef.current) {
      mapRef.current.fitBounds(BOUNDS, { padding:40, duration:900 });
      mapRef.current.easeTo({ pitch:0, bearing:0, duration:600 });
    }
  }, []);

  const toggleStatus = (s) => setFilterStatus(p => p===s ? null : s);

  const Btn = ({ active, onClick, children, aStyle }) => (
    <button onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150"
      style={{ background:active?undefined:'var(--surface)', border:active?'none':'1px solid var(--border2)',
        color:active?'#fff':'var(--text2)', ...(active?aStyle||{background:'rgba(108,99,255,0.3)',border:'1px solid rgba(108,99,255,0.6)'}:{}) }}>
      {children}
    </button>
  );

  const panel = { background:'var(--surface)', backdropFilter:'blur(14px)', border:'1px solid var(--border2)' };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Count */}
      <div className="absolute top-3 left-3 z-10 px-3 py-2.5 rounded-2xl" style={panel}>
        <div className="text-[9px] font-bold uppercase tracking-widest" style={{color:'var(--text3)'}}>Showing</div>
        <div className="font-display text-2xl font-extrabold leading-tight" style={{color:'var(--accent)'}}>{visibleCount}</div>
        <div className="text-[9px]" style={{color:'var(--text3)'}}>of {allPlots.length} plots</div>
      </div>

      {/* Nature legend */}
      {showNature && (
        <div className="absolute bottom-4 left-3 z-10 px-3 py-2.5 rounded-2xl" style={panel}>
          <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{color:'var(--text3)'}}>Map Layers</div>
          {[['#1a6fa8','Water / River'],['#1b5e20','Parks & Canals'],['#33691e','Agriculture'],['#4e342e','Village Areas']]
            .map(([c,l]) => (
              <div key={l} className="flex items-center gap-2 py-0.5">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:c}}/>
                <span className="text-[10px]" style={{color:'var(--text2)'}}>{l}</span>
              </div>
            ))}
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 w-36">
        <div className="rounded-2xl p-2 flex flex-col gap-1" style={panel}>
          <div className="text-[9px] font-bold uppercase tracking-widest px-1 pb-1" style={{color:'var(--text3)'}}>Filter</div>
          {['Available','Reserved','Sold'].map(s => {
            const col = dark ? S_COL[s] : S_COL_LIGHT[s];
            return (
              <Btn key={s} active={filterStatus===s} onClick={() => toggleStatus(s)}
                aStyle={{background:`${col}25`,border:`1px solid ${col}60`,color:col}}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:col,boxShadow:`0 0 5px ${col}`}}/>
                {s}
              </Btn>
            );
          })}
        </div>
        <div className="rounded-2xl p-2 flex flex-col gap-1" style={panel}>
          <div className="text-[9px] font-bold uppercase tracking-widest px-1 pb-1" style={{color:'var(--text3)'}}>Overlays</div>
          <Btn active={heatmap}    onClick={() => setHeatmap(h=>!h)}>🔥 ROI Heat</Btn>
          <Btn active={topOnly}    onClick={() => setTopOnly(t=>!t)}>⭐ High Yield</Btn>
          <Btn active={globe3d}    onClick={() => setGlobe3d(g=>!g)}
            aStyle={{background:'rgba(108,99,255,0.3)',border:'1px solid rgba(108,99,255,0.7)',color:'#fff',fontWeight:700}}>
            ⬡ 3D Mode
          </Btn>
          <Btn active={showNature} onClick={() => setShowNature(n=>!n)}
            aStyle={{background:'rgba(27,94,32,0.35)',border:'1px solid rgba(76,175,80,0.6)',color:'#66bb6a'}}>
            🌿 Nature
          </Btn>
        </div>
        <button onClick={handleReset}
          className="w-full px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150"
          style={{background:'var(--surface)',border:'1px solid var(--border2)',color:'var(--text3)'}}>
          ↺ Reset View
        </button>
      </div>

      {globe3d && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl text-xs font-semibold pointer-events-none whitespace-nowrap"
          style={{background:'rgba(108,99,255,0.15)',border:'1px solid rgba(108,99,255,0.5)',color:'#a89dff',backdropFilter:'blur(8px)'}}>
          ⬡ Heights = ROI score · drag to orbit
        </div>
      )}

      {compareIds.length > 0 && (
        <div className="absolute bottom-16 right-3 z-10 px-4 py-3 rounded-2xl"
          style={{...panel,border:'1px solid rgba(108,99,255,0.45)'}}>
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{color:'var(--text3)'}}>Comparing</div>
          <div className="font-display text-xl font-extrabold" style={{color:'var(--accent)'}}>{compareIds.length}</div>
        </div>
      )}
    </div>
  );
}