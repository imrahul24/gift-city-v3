import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from '../context/ThemeContext';
import { roiColor } from '../utils/formatters';
import geoData from '../data/gift_city.geojson';
import { generateSyntheticBoundary } from '../utils/geo';

const MAPTILER_KEY   = 'UNTKL1aWlNVwRZtvgWWA';
mapboxgl.accessToken = 'pk.placeholder';

const S_COL       = { Available:'#00f5a0', Reserved:'#ffd32a', Sold:'#ff4757' };
const S_COL_LIGHT = { Available:'#00a862', Reserved:'#c49a00', Sold:'#d42030' };

const GIFT_CITY_BOUNDS = [[72.0184, 21.9876],[72.3736, 22.3510]];
const GIFT_CITY_CENTER = [72.1960, 22.1693];

// Developable zone fill colors
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

// Nature layer colors
const NATURE_COLORS = {
  'Waterbody':             { fill:'#1a6fa8', line:'#2196f3', opacity:0.55 },
  'River':                 { fill:'#1565c0', line:'#1e88e5', opacity:0.60 },
  'Green Park Land & Canals': { fill:'#2d6a2d', line:'#4caf50', opacity:0.45 },
  'Agriculture':           { fill:'#558b2f', line:'#7cb342', opacity:0.35 },
  'Coastal Regulation Zone':  { fill:'#00838f', line:'#00acc1', opacity:0.30 },
  'Solar Energy Park':     { fill:'#f57f17', line:'#fbc02d', opacity:0.40 },
  'Gamtal':                { fill:'#4e342e', line:'#795548', opacity:0.25 },
  'Village Buffer':        { fill:'#5d4037', line:'#8d6e63', opacity:0.20 },
  'Road':                  { fill:'#424242', line:'#757575', opacity:0.30 },
  'Bridge':                { fill:'#546e7a', line:'#78909c', opacity:0.40 },
};

// ── Build POLYGON GeoJSON for plots (needed for 3D extrusion) ──
function makePlotsPolygonGeoJSON(plots, useHeatmap, dark) {
  const sc = dark ? S_COL : S_COL_LIGHT;
  return {
    type: 'FeatureCollection',
    features: plots.map(p => {
      // Generate synthetic polygon from centroid + area
      const corners = generateSyntheticBoundary(p.lat, p.lon, `${Math.round(Math.sqrt(p.area_sqm))} x ${Math.round(Math.sqrt(p.area_sqm))}`);
      const coords  = [...corners.map(c => [c[1], c[0]]), [corners[0][1], corners[0][0]]];
      const col = useHeatmap ? roiColor(p.roi_score) : (sc[p.status] || '#888');
      return {
        type: 'Feature',
        id:   p.id,
        properties: {
          id:     p.id,
          status: p.status,
          zone:   p.zone,
          roi:    p.roi_score,
          price:  p.total_price,
          psf:    p.price_psf,
          area:   p.area_sqft,
          tier:   p.tier,
          color:  col,
          extH:   Math.round(p.roi_score * 80),  // height in meters for 3D
        },
        geometry: { type:'Polygon', coordinates:[coords] },
      };
    }),
  };
}

// ── Build POINT GeoJSON for plots (2D circles) ──
function makePlotsPointGeoJSON(plots, useHeatmap, dark) {
  const sc = dark ? S_COL : S_COL_LIGHT;
  return {
    type: 'FeatureCollection',
    features: plots.map(p => ({
      type: 'Feature',
      id:   p.id,
      properties: {
        id:     p.id,
        status: p.status,
        zone:   p.zone,
        roi:    p.roi_score,
        price:  p.total_price,
        psf:    p.price_psf,
        area:   p.area_sqft,
        tier:   p.tier,
        color:  useHeatmap ? roiColor(p.roi_score) : (sc[p.status] || '#888'),
        extH:   Math.round(p.roi_score * 80),
      },
      geometry: { type:'Point', coordinates:[p.lon, p.lat] },
    })),
  };
}

function makePopupHTML(props, dark) {
  const sc  = dark ? (S_COL[props.status]||'#888') : (S_COL_LIGHT[props.status]||'#666');
  const rc  = roiColor(props.roi);
  const bg  = dark ? 'rgba(8,9,13,0.97)'        : 'rgba(255,255,255,0.98)';
  const txt = dark ? '#f0f2ff'                   : '#0f1117';
  const sub = dark ? 'rgba(255,255,255,0.3)'     : 'rgba(0,0,0,0.4)';
  const cel = dark ? 'rgba(255,255,255,0.05)'    : 'rgba(0,0,0,0.04)';
  const price = (props.price / 1e7).toFixed(2);
  return `<div style="min-width:200px;font-family:'DM Sans',sans-serif;background:${bg};border-radius:14px;padding:14px;color:${txt}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
      <span style="font-family:'Syne',sans-serif;font-weight:800;font-size:16px;color:${sc}">${props.id}</span>
      <span style="padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700;background:${sc}22;color:${sc};border:1px solid ${sc}44">${props.status}</span>
    </div>
    <div style="font-size:11px;color:${sub};margin-bottom:9px;line-height:1.4">${props.zone}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:9px">
      ${[['Value',`₹${price} Cr`,''],['PSF',`₹${Number(props.psf).toLocaleString('en-IN')}`,''],['ROI',props.roi,rc],['Area',`${Number(props.area).toLocaleString('en-IN')} sqft`,'']]
        .map(([l,v,c])=>`<div style="background:${cel};border-radius:7px;padding:5px 8px">
          <div style="font-size:9px;color:${sub};text-transform:uppercase;letter-spacing:.08em">${l}</div>
          <div style="font-weight:700;font-size:12px;color:${c||txt}">${v}</div></div>`).join('')}
    </div>
    <div style="font-size:10px;color:${sub};text-align:center;border-top:1px solid ${dark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.07)'};padding-top:7px">
      🖱 Click to open full details
    </div>
  </div>`;
}

// Build all GeoJSON feature collections from imported geoData
function buildGeoSources() {
  const features = geoData.features.filter(f => f.geometry.type === 'Polygon');

  const zones   = { type:'FeatureCollection', features: features.filter(f => ZONE_COLORS[f.properties.name]) };
  const nature  = { type:'FeatureCollection', features: features.filter(f => NATURE_COLORS[f.properties.name]) };
  const tp      = { type:'FeatureCollection', features: features.filter(f => f.properties.name?.startsWith('TP')) };

  return { zones, nature, tp };
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

  // ── Shared event handler factories (stable refs) ──
  const attachHandlers = useCallback((map) => {
    const showPopup = (e) => {
      if (!e.features?.length) return;
      map.getCanvas().style.cursor = 'pointer';
      const props = e.features[0].properties;
      if (!popupRef.current)
        popupRef.current = new mapboxgl.Popup({ closeButton:false, closeOnClick:false, offset:16, className:'gc-popup' });
      popupRef.current.setLngLat(e.lngLat).setHTML(makePopupHTML(props, darkRef.current)).addTo(map);
    };
    const hidePopup = () => {
      map.getCanvas().style.cursor = '';
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
    };
    const handleClick = (e) => {
      if (!e.features?.length) return;
      hidePopup();
      map.flyTo({ center:e.lngLat, zoom:Math.max(map.getZoom(), 14), duration:700, easing:t=>1-Math.pow(1-t,3) });
      onSelectRef.current(e.features[0].properties.id);
    };
    ['plots-circle','plots-3d','plots-poly'].forEach(layer => {
      map.on('mousemove',  layer, showPopup);
      map.on('mouseleave', layer, hidePopup);
      map.on('click',      layer, handleClick);
    });
  }, []);

  // ── Add all map sources and layers ──
  const addAllLayers = useCallback((map, isDark, initialVisible) => {
    const { zones, nature, tp } = buildGeoSources();

    // ── Nature layers (water, rivers, parks, roads) ──
    map.addSource('nature', { type:'geojson', data:nature });

    // Water fills (blue)
    map.addLayer({ id:'water-fill', type:'fill', source:'nature',
      filter:['in',['get','name'],['literal',['Waterbody','River','Coastal Regulation Zone']]],
      paint:{ 'fill-color':['match',['get','name'],
        'Waterbody','#1a6fa8','River','#1565c0','#00838f'], 'fill-opacity':0.6 }});

    // Green fills (parks, agriculture)
    map.addLayer({ id:'green-fill', type:'fill', source:'nature',
      filter:['in',['get','name'],['literal',['Green Park Land & Canals','Agriculture','Solar Energy Park']]],
      paint:{ 'fill-color':['match',['get','name'],
        'Green Park Land & Canals','#1b5e20','Agriculture','#33691e','#e65100'], 'fill-opacity':0.45 }});

    // Other nature fills (village, road, bridge)
    map.addLayer({ id:'other-fill', type:'fill', source:'nature',
      filter:['in',['get','name'],['literal',['Gamtal','Village Buffer','Road','Bridge']]],
      paint:{ 'fill-color':['match',['get','name'],
        'Gamtal','#4e342e','Village Buffer','#5d4037','Road','#37474f','#455a64'], 'fill-opacity':0.25 }});

    // Nature outlines
    map.addLayer({ id:'water-line', type:'line', source:'nature',
      filter:['in',['get','name'],['literal',['Waterbody','River','Coastal Regulation Zone']]],
      paint:{ 'line-color':'#29b6f6', 'line-opacity':0.7, 'line-width':1 }});
    map.addLayer({ id:'green-line', type:'line', source:'nature',
      filter:['in',['get','name'],['literal',['Green Park Land & Canals','Agriculture','Solar Energy Park']]],
      paint:{ 'line-color':'#66bb6a', 'line-opacity':0.6, 'line-width':0.8 }});

    // ── Zone backgrounds ──
    map.addSource('zones', { type:'geojson', data:zones });
    map.addLayer({ id:'zones-fill', type:'fill', source:'zones', paint:{
      'fill-color':['match',['get','name'],...Object.entries(ZONE_COLORS).flat(),'#6b7280'],
      'fill-opacity': isDark ? 0.1 : 0.15,
    }});
    map.addLayer({ id:'zones-line', type:'line', source:'zones', paint:{
      'line-color':['match',['get','name'],...Object.entries(ZONE_COLORS).flat(),'#6b7280'],
      'line-opacity': isDark ? 0.4 : 0.5, 'line-width': 1.2,
    }});

    // ── TP boundaries ──
    map.addSource('tp', { type:'geojson', data:tp });
    map.addLayer({ id:'tp-line', type:'line', source:'tp',
      paint:{ 'line-color': isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)', 'line-width':0.8 }});

    // ── Plot CIRCLE layer (2D, uses Point geometry) ──
    map.addSource('plots-pts', { type:'geojson', data:makePlotsPointGeoJSON(initialVisible, false, isDark), generateId:true });
    map.addLayer({ id:'plots-circle', type:'circle', source:'plots-pts', layout:{ visibility:'visible' }, paint:{
      'circle-radius':         ['interpolate',['linear'],['zoom'], 9,6, 11,10, 13,15, 15,22],
      'circle-color':          ['get','color'],
      'circle-opacity':        0.92,
      'circle-stroke-width':   ['interpolate',['linear'],['zoom'], 9,1.5, 13,3],
      'circle-stroke-color':   ['get','color'],
      'circle-stroke-opacity': 0.4,
      'circle-blur':           0.08,
    }});

    // ── Plot POLYGON layer (for 3D extrusion, uses Polygon geometry) ──
    map.addSource('plots-poly', { type:'geojson', data:makePlotsPolygonGeoJSON(initialVisible, false, isDark), generateId:true });
    map.addLayer({ id:'plots-poly', type:'fill', source:'plots-poly', layout:{ visibility:'none' }, paint:{
      'fill-color':   ['get','color'],
      'fill-opacity': 0.85,
    }});
    map.addLayer({ id:'plots-3d', type:'fill-extrusion', source:'plots-poly', layout:{ visibility:'none' }, paint:{
      'fill-extrusion-color':              ['get','color'],
      'fill-extrusion-height':             ['get','extH'],
      'fill-extrusion-base':               0,
      'fill-extrusion-opacity':            0.85,
      'fill-extrusion-vertical-gradient':  true,
    }});

    attachHandlers(map);
  }, [attachHandlers]);

  // ── INIT MAP (once) ──
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style:     dark
        ? `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_KEY}`
        : `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
      center:    GIFT_CITY_CENTER, zoom:10.2,
      pitch:0, bearing:0, antialias:true,
      maxBounds: [[71.5,21.5],[72.9,22.8]],
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass:true, visualizePitch:true }), 'bottom-right');
    map.on('load', () => {
      addAllLayers(map, dark, allPlots);
      map.fitBounds(GIFT_CITY_BOUNDS, { padding:40, duration:1200 });
      setMapReady(true);
    });
    mapRef.current = map;
    return () => {
      if (popupRef.current) { try { popupRef.current.remove(); } catch(_){} popupRef.current = null; }
      map.remove(); mapRef.current = null;
    };
  }, []); // eslint-disable-line

  // ── Theme change: swap style + re-add layers ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    setMapReady(false);
    map.setStyle(dark
      ? `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_KEY}`
      : `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`
    );
    map.once('styledata', () => {
      addAllLayers(map, dark, visible);
      // Restore 3D state if was active
      if (globe3d) {
        map.setLayoutProperty('plots-circle','visibility','none');
        map.setLayoutProperty('plots-poly',  'visibility','none');
        map.setLayoutProperty('plots-3d',    'visibility','visible');
      }
      setVisibleCount(visible.length);
      setMapReady(true);
    });
  }, [dark]); // eslint-disable-line

  // ── Update plot data when filters/heatmap change ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const ptSrc   = map.getSource('plots-pts');
    const polySrc = map.getSource('plots-poly');
    if (ptSrc)   ptSrc.setData(makePlotsPointGeoJSON(visible, heatmap, dark));
    if (polySrc) polySrc.setData(makePlotsPolygonGeoJSON(visible, heatmap, dark));
    setVisibleCount(visible.length);
  }, [mapReady, visible, heatmap, dark]);

  // ── 3D toggle ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const setVis = (id, vis) => { if (map.getLayer(id)) map.setLayoutProperty(id,'visibility',vis); };
    if (globe3d) {
      setVis('plots-circle','none');
      setVis('plots-poly',  'visible');
      setVis('plots-3d',    'visible');
    } else {
      setVis('plots-circle','visible');
      setVis('plots-poly',  'none');
      setVis('plots-3d',    'none');
    }
    map.easeTo({ pitch:globe3d?58:0, bearing:globe3d?-18:0, duration:900 });
  }, [globe3d, mapReady]);

  // ── Nature visibility toggle ──
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const vis = showNature ? 'visible' : 'none';
    ['water-fill','water-line','green-fill','green-line','other-fill'].forEach(id => {
      if (map.getLayer(id)) map.setLayoutProperty(id,'visibility',vis);
    });
  }, [showNature, mapReady]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    setHeatmap(false); setTopOnly(false); setFilterStatus(null); setGlobe3d(false); setShowNature(true);
    if (mapRef.current) {
      mapRef.current.easeTo({ pitch:0, bearing:0, duration:600 });
      mapRef.current.fitBounds(GIFT_CITY_BOUNDS, { padding:40, duration:900 });
    }
  }, []);

  const toggleStatus = (s) => setFilterStatus(p => p===s ? null : s);

  const Btn = ({ active, onClick, children, aStyle }) => (
    <button onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150"
      style={{ background: active?undefined:'var(--surface)', border: active?'none':'1px solid var(--border2)',
        color: active?'#fff':'var(--text2)',
        ...(active ? aStyle||{background:'rgba(108,99,255,0.3)',border:'1px solid rgba(108,99,255,0.6)'} : {}) }}>
      {children}
    </button>
  );

  const panel = { background:'var(--surface)', backdropFilter:'blur(14px)', border:'1px solid var(--border2)' };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Count badge */}
      <div className="absolute top-3 left-3 z-10 px-3 py-2.5 rounded-2xl" style={panel}>
        <div className="text-[9px] font-bold uppercase tracking-widest" style={{color:'var(--text3)'}}>Showing</div>
        <div className="font-display text-2xl font-extrabold leading-tight" style={{color:'var(--accent)'}}>{visibleCount}</div>
        <div className="text-[9px]" style={{color:'var(--text3)'}}>of {allPlots.length} plots</div>
      </div>

      {/* Nature legend */}
      {showNature && (
        <div className="absolute bottom-4 left-3 z-10 px-3 py-2.5 rounded-2xl" style={panel}>
          <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{color:'var(--text3)'}}>Map Layers</div>
          {[
            { color:'#1a6fa8', label:'Water / River' },
            { color:'#1b5e20', label:'Parks & Canals' },
            { color:'#33691e', label:'Agriculture' },
            { color:'#4e342e', label:'Village Areas' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2 py-0.5">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{background:l.color}}/>
              <span className="text-[10px]" style={{color:'var(--text2)'}}>{l.label}</span>
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
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:col, boxShadow:`0 0 5px ${col}`}}/>
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
          style={{...panel, border:'1px solid rgba(108,99,255,0.45)'}}>
          <div className="text-[9px] font-bold uppercase tracking-widest" style={{color:'var(--text3)'}}>Comparing</div>
          <div className="font-display text-xl font-extrabold" style={{color:'var(--accent)'}}>{compareIds.length}</div>
        </div>
      )}
    </div>
  );
}