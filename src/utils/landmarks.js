export const LANDMARKS = [
  { id:'airport',  name:'Airport',            icon:'✈️',  lat:22.3626096, lon:72.3039288, color:'#0abde3' },
  { id:'tata',     name:'Tata Semiconductor', icon:'🏭',  lat:22.2503353, lon:71.7624784, color:'#e17055' },
  { id:'abcd',     name:'ABCD Building',      icon:'🏢',  lat:22.2577441, lon:72.1858376, color:'#6c63ff' },
];

export function distKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return (2 * R * Math.asin(Math.sqrt(a))).toFixed(1);
}