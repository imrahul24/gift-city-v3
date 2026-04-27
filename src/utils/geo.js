export function generateSyntheticBoundary(lat, lon, dimensionsStr) {
  try {
    const parts = dimensionsStr.split('x').map(p => parseFloat(p.trim()));
    const widthFt = parts[0] || 40;
    const heightFt = parts[1] || 80;
    const latDiff = (heightFt * 0.3048) / 111320;
    const lonDiff = (widthFt * 0.3048) / (111320 * Math.cos(lat * Math.PI / 180));
    return [
      [lat - latDiff/2, lon - lonDiff/2],
      [lat + latDiff/2, lon - lonDiff/2],
      [lat + latDiff/2, lon + lonDiff/2],
      [lat - latDiff/2, lon + lonDiff/2]
    ];
  } catch (e) {
    return [
      [lat - 0.0001, lon - 0.0001],
      [lat + 0.0001, lon - 0.0001],
      [lat + 0.0001, lon + 0.0001],
      [lat - 0.0001, lon + 0.0001]
    ];
  }
}
