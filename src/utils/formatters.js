export const STATUS_COLOR = {
  Available: '#00f5a0',
  Sold: '#ff4757',
  Reserved: '#ffd32a'
};

export const ZONE_COLOR = {
  'CBD City Center': '#6c63ff',
  'Industrial Knowledge & IT Phase': '#0abde3',
  'Mixed Use - Commercial & Residential Phase': '#ff6b81',
  'Logistics Phase': '#f9ca24',
  'Tourism Phase': '#6ab04c',
  'Industrial Phase': '#e17055'
};

export function roiColor(roi) {
  if (roi >= 70) return '#00f5a0';
  if (roi >= 55) return '#ffd32a';
  return '#ff4757';
}

export function scoreClass(v) {
  if (v >= 65) return 'score-high';
  if (v >= 45) return 'score-mid';
  return 'score-low';
}

export function fmtCr(v) {
  const cr = v / 1e7;
  return cr >= 100 ? cr.toFixed(0) + ' Cr' : cr.toFixed(2) + ' Cr';
}

export function fmtNum(v) {
  return new Intl.NumberFormat('en-IN').format(v);
}
