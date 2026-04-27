import geoData from './gift_city.geojson';

// ── ONLY developable land zones (no water/roads/rivers/buffers) ──
const PLOT_ZONES = new Set([
  'CBD City Center',
  'Industrial Knowledge & IT Phase',
  'Mixed Use - Commercial & Residential Phase',
  'Logistics Phase',
  'Tourism Phase',
  'Industrial Phase',
  'Infrastructure Phase',
  'Residential  Medium to High Density Phase',
  'Recreational & Sports Phase',
  'Public Facility Zone',
]);

// excluded (442 polygons): Waterbody(152), Green Park(59), River(42), Gamtal(33),
// Road(32), Village Buffer(32), Bridge(26), Agriculture(20), Coastal Zone(10),
// Solar Energy Park(2), TP SCHEME(6), TP sub-zones(27), 919098094.763(1)

const ZONE_TIER = {
  'CBD City Center':                             'Premium',
  'Industrial Knowledge & IT Phase':             'High',
  'Mixed Use - Commercial & Residential Phase':  'High',
  'Tourism Phase':                               'Mid',
  'Residential  Medium to High Density Phase':   'Mid',
  'Logistics Phase':                             'Mid',
  'Recreational & Sports Phase':                 'Standard',
  'Infrastructure Phase':                        'Standard',
  'Industrial Phase':                            'Standard',
  'Public Facility Zone':                        'Standard',
};

const ZONE_PSM = {
  'CBD City Center':                             90000,
  'Industrial Knowledge & IT Phase':             62000,
  'Mixed Use - Commercial & Residential Phase':  52000,
  'Tourism Phase':                               47000,
  'Residential  Medium to High Density Phase':   42000,
  'Logistics Phase':                             33000,
  'Recreational & Sports Phase':                 27000,
  'Infrastructure Phase':                        24000,
  'Industrial Phase':                            22000,
  'Public Facility Zone':                        18000,
};

const STATUSES = ['Available','Available','Available','Reserved','Sold'];
const FACINGS  = ['North','South','East','West','North-East','South-West','North-West','South-East'];
const BUYERS   = ['DLF','Mahindra Lifespaces','Tata Projects','Adani Realty','L&T Infra',
                  'Prestige Group','Brigade Group','Sobha Ltd','Godrej Properties','Embassy Group'];

function seededRand(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function polygonAreaSqm(ring) {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1, lat1] = ring[i], [lon2, lat2] = ring[i + 1];
    const midLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
    area += (lon1 * 111320 * Math.cos(midLat)) * (lat2 * 110540)
          - (lon2 * 111320 * Math.cos(midLat)) * (lat1 * 110540);
  }
  return Math.abs(area) / 2;
}

function polygonCentroid(ring) {
  const pts = ring.slice(0, -1);
  return [
    parseFloat((pts.reduce((s,c) => s+c[0], 0) / pts.length).toFixed(6)),
    parseFloat((pts.reduce((s,c) => s+c[1], 0) / pts.length).toFixed(6)),
  ];
}

function generatePlots() {
  return geoData.features
    .filter(f => f.geometry.type === 'Polygon' && PLOT_ZONES.has(f.properties.name))
    .map((feat, idx) => {
      const rand      = seededRand(idx * 7919 + 31337);
      const zone      = feat.properties.name;
      const ring      = feat.geometry.coordinates[0];
      const areaSqm   = polygonAreaSqm(ring);
      const areaSqft  = Math.round(areaSqm * 10.7639);
      const [lon, lat]= polygonCentroid(ring);
      const psm       = Math.round((ZONE_PSM[zone] || 20000) * (0.88 + rand() * 0.24));
      const psf       = Math.round(psm / 10.7639);
      const totalPrice= Math.round(areaSqm * psm);
      const status    = STATUSES[Math.floor(rand() * STATUSES.length)];
      const roiScore  = Math.round(45 + rand() * 47);
      const connScore = Math.round(40 + rand() * 48);

      let transaction = null;
      if (status === 'Sold') {
        const pp  = Math.round(totalPrice * (0.65 + rand() * 0.15));
        const yr1 = 2020 + Math.floor(rand() * 3);
        const yr2 = yr1 + 1 + Math.floor(rand() * 2);
        transaction = {
          buyer:          BUYERS[Math.floor(rand() * BUYERS.length)],
          purchase_date:  `${yr1}-${String(Math.ceil(rand()*12)).padStart(2,'0')}-${String(Math.ceil(rand()*28)).padStart(2,'0')}`,
          purchase_price: pp,
          sale_date:      `${yr2}-${String(Math.ceil(rand()*12)).padStart(2,'0')}-${String(Math.ceil(rand()*28)).padStart(2,'0')}`,
          sale_price:     totalPrice,
          profit:         totalPrice - pp,
          profit_pct:     parseFloat((((totalPrice - pp) / pp) * 100).toFixed(1)),
        };
      }

      return {
        id:                 `GC-${String(idx + 1).padStart(3, '0')}`,
        zone, tier: ZONE_TIER[zone] || 'Standard', status,
        area_sqm: Math.round(areaSqm), area_sqft: areaSqft,
        price_psf: psf, price_psm: psm, total_price: totalPrice,
        roi_score: roiScore, connectivity_score: connScore,
        demand_level: ['High','Medium','Low'][Math.floor(rand() * 3)],
        facing: FACINGS[Math.floor(rand() * FACINGS.length)],
        lat, lon, transaction,
      };
    });
}

export const PLOTS = generatePlots();