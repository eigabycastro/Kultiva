// Distância entre dois pontos (fórmula de Haversine), em km
export function distanciaKm(a, b) {
  if (a?.latitude == null || b?.latitude == null) return null
  const R = 6371
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.latitude - a.latitude)
  const dLon = rad(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10
}

// Retângulo que contém o círculo de raio `km`: filtra no banco antes do cálculo exato
export function caixaDeBusca({ latitude, longitude }, km) {
  const dLat = km / 111
  const dLon = km / (111 * Math.cos((latitude * Math.PI) / 180))
  return {
    latitude: { gte: latitude - dLat, lte: latitude + dLat },
    longitude: { gte: longitude - dLon, lte: longitude + dLon },
  }
}
