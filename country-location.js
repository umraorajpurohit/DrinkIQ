// Natural Earth 1:110m boundaries are approximate. Leave a margin around them.
export async function findCountry({ latitude, longitude, accuracy }) {
  if (![latitude, longitude, accuracy].every(Number.isFinite) || accuracy < 0) return;
  const response = await fetch('./country-boundaries.json', { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Country boundaries unavailable');
  const boundaries = await response.json();
  const margin = accuracy + 10000;
  const metresPerLongitude = 111000 * Math.cos(latitude * Math.PI / 180);
  const matches = Object.entries(boundaries).filter(([, polygons]) => polygons.some(polygon => {
    const rings = polygon.map(ring => ring.map(([lon, lat]) => [
      (lon - longitude) * metresPerLongitude,
      (lat - latitude) * 110000,
    ]));
    return containsPoint(rings[0], margin) === true &&
      rings.slice(1).every(ring => containsPoint(ring, margin) === false);
  }));
  if (matches.length === 1) return matches[0][0];
}

function containsPoint(ring, margin) {
  let inside = false;
  for (let index = 1; index < ring.length; index++) {
    const [ax, ay] = ring[index - 1];
    const [bx, by] = ring[index];
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared)) : 0;
    if (Math.hypot(ax + t * dx, ay + t * dy) <= margin) return null;
    if ((ay > 0) !== (by > 0) && ax - ay * dx / dy > 0) inside = !inside;
  }
  return inside;
}
