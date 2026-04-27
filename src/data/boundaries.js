import { PLOTS } from './plots';
import { generateSyntheticBoundary } from '../utils/geo';

const features = PLOTS.map(plot => {
  const coords = generateSyntheticBoundary(plot.lat, plot.lon, plot.dimensions);
  // Leaflet Polygon coords are [lat, lon], GeoJSON expects [lon, lat] and needs to close the loop
  const geoJsonCoords = [
    ...coords.map(c => [c[1], c[0]]),
    [coords[0][1], coords[0][0]]
  ];

  return {
    type: "Feature",
    properties: {
      id: plot.id,
      zone: plot.zone,
      status: plot.status,
      roi: plot.roi_score
    },
    geometry: {
      type: "Polygon",
      coordinates: [geoJsonCoords]
    }
  };
});

export const BOUNDARIES = {
  type: "FeatureCollection",
  features: features
};