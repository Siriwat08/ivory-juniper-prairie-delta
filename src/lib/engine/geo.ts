import type { Place } from "./types";

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const dLat = deg(b.lat - a.lat);
  const dLng = deg(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg(a.lat)) * Math.cos(deg(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function deg(n: number) {
  return (n * Math.PI) / 180;
}

export function polylineLengthKm(geometry: [number, number][]) {
  let d = 0;
  for (let i = 1; i < geometry.length; i++) {
    const a = geometry[i - 1];
    const b = geometry[i];
    if (!a || !b) continue;
    d += haversineKm({ lat: a[0], lng: a[1] }, { lat: b[0], lng: b[1] });
  }
  return d;
}

export function pointAlongPolyline(
  geometry: [number, number][],
  fraction: number,
): [number, number] {
  if (geometry.length === 0) return [0, 0];
  if (geometry.length === 1) return geometry[0]!;
  const t = Math.min(1, Math.max(0, fraction));
  const total = polylineLengthKm(geometry);
  if (total === 0) return geometry[0]!;
  let remain = total * t;
  for (let i = 1; i < geometry.length; i++) {
    const a = geometry[i - 1]!;
    const b = geometry[i]!;
    const seg = haversineKm({ lat: a[0], lng: a[1] }, { lat: b[0], lng: b[1] });
    if (remain <= seg || i === geometry.length - 1) {
      const u = seg === 0 ? 0 : remain / seg;
      return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    }
    remain -= seg;
  }
  return geometry[geometry.length - 1]!;
}

export function nearestOnPolyline(
  geometry: [number, number][],
  point: { lat: number; lng: number },
) {
  let best = {
    distKm: Infinity,
    fraction: 0,
    coord: geometry[0] ?? [point.lat, point.lng],
  };
  const total = polylineLengthKm(geometry);
  if (total === 0) return { ...best, distKm: 0, fraction: 0 };
  let walked = 0;
  for (let i = 1; i < geometry.length; i++) {
    const a = geometry[i - 1]!;
    const b = geometry[i]!;
    const seg = haversineKm({ lat: a[0], lng: a[1] }, { lat: b[0], lng: b[1] });
    const proj = projectOnSegment(a, b, point);
    if (proj.distKm < best.distKm) {
      best = {
        distKm: proj.distKm,
        fraction: total === 0 ? 0 : (walked + seg * proj.t) / total,
        coord: proj.coord,
      };
    }
    walked += seg;
  }
  return best;
}

function projectOnSegment(
  a: [number, number],
  b: [number, number],
  p: { lat: number; lng: number },
) {
  const ax = a[1];
  const ay = a[0];
  const bx = b[1];
  const by = b[0];
  const px = p.lng;
  const py = p.lat;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const coord: [number, number] = [ay + dy * t, ax + dx * t];
  return {
    t,
    coord,
    distKm: haversineKm({ lat: coord[0], lng: coord[1] }, p),
  };
}

export function asPlace(
  id: string,
  name: string,
  lat: number,
  lng: number,
  extra: Partial<Place> = {},
): Place {
  return { id, name, lat, lng, ...extra };
}
