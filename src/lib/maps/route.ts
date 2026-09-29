import { createServerFn } from "@tanstack/react-start";
import { fallbackLeg } from "@/lib/engine/rest-engine";
import { DEFAULT_POLICY } from "@/lib/engine/policy";
import type { Place, Policy, RouteLeg, RouteMeta } from "@/lib/engine/types";
import { googleRouteLegs } from "@/lib/maps/google";

type RouteRequest = {
  nodes: Place[];
  policy?: Policy;
  /** Google Maps key จากหน้าตั้งค่า (ถ้าไม่ส่ง จะใช้ env GOOGLE_MAPS_API_KEY ฝั่งเซิร์ฟเวอร์) */
  apiKey?: string;
};

async function osrmLegs(nodes: Place[]): Promise<RouteLeg[] | null> {
  if (nodes.length < 2) return [];
  const coords = nodes.map((n) => `${n.lng},${n.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false&annotations=false`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    code?: string;
    routes?: {
      legs?: { distance: number; duration: number }[];
      geometry?: { coordinates: [number, number][] };
    }[];
  };
  if (body.code !== "Ok" || !body.routes?.[0]) return null;
  const route = body.routes[0];
  const geometryLngLat = route.geometry?.coordinates ?? [];
  const latlng: [number, number][] = geometryLngLat.map(([lng, lat]) => [lat, lng]);
  const legs = route.legs ?? [];
  if (legs.length !== nodes.length - 1) return null;

  const totalDist = legs.reduce((s, l) => s + l.distance, 0);
  let walked = 0;
  return legs.map((leg, i) => {
    const startFrac = totalDist === 0 ? 0 : walked / totalDist;
    walked += leg.distance;
    const endFrac = totalDist === 0 ? 1 : walked / totalDist;
    const slice = sliceByFraction(latlng, startFrac, endFrac);
    const from = nodes[i]!;
    const to = nodes[i + 1]!;
    return {
      fromId: from.id,
      toId: to.id,
      distanceKm: leg.distance / 1000,
      durationMin: leg.duration / 60,
      geometry: slice.length >= 2 ? slice : [[from.lat, from.lng], [to.lat, to.lng]],
      source: "routed" as const,
    };
  });
}

function sliceByFraction(
  geometry: [number, number][],
  from: number,
  to: number,
): [number, number][] {
  if (geometry.length < 2) return geometry;
  const start = Math.floor(from * (geometry.length - 1));
  const end = Math.max(start + 1, Math.ceil(to * (geometry.length - 1)));
  return geometry.slice(start, end + 1);
}

/**
 * ลำดับการคำนวณเส้นทาง (fallback chain):
 *   1. Google Routes API (TRAFFIC_AWARE) — เมื่อมี key บนเซิร์ฟเวอร์ หรือคนขับเปิดใช้ในหน้าตั้งค่า
 *      ได้เวลาตามสภาพจราจรจริง + trafficDelayMin
 *   2. OSRM (โอเพนซอร์ส) — ไม่มีข้อมูลรถติด แต่ได้เส้นทางจริง
 *   3. ประมาณการจากระยะตรง — ใช้ก่อนชั่วคราวเมื่อเรียกแผนที่ไม่ได้ทั้งคู่
 * ทุกผลลัพธ์แนบ meta: แหล่งที่มา, trafficAware, เวลาที่คำนวณ, trafficDelayMin
 */
export const computeRouteLegs = createServerFn({ method: "POST" })
  .validator((input: RouteRequest) => input)
  .handler(async ({ data }) => {
    const policy = data.policy ?? DEFAULT_POLICY;
    const nodes = data.nodes;

    // 1) Google Routes — traffic-aware (เรียกครั้งเดียวต่อการกดคำนวณ)
    try {
      const g = await googleRouteLegs({ data: { nodes, apiKey: data.apiKey } });
      if (g.ok && g.legs.length > 0) {
        const legs: RouteLeg[] = g.legs.map((l, i) => ({
          fromId: nodes[i]!.id,
          toId: nodes[i + 1]!.id,
          distanceKm: l.distanceKm,
          durationMin: l.durationMin,
          geometry: l.geometry,
          source: "routed",
        }));
        const trafficDelayMin = g.legs.reduce(
          (s, l) => s + Math.max(0, l.durationMin - l.noTrafficMin),
          0,
        );
        const meta: RouteMeta = {
          source: "google-routes",
          trafficAware: true,
          calculatedAt: g.calculatedAt,
          trafficDelayMin,
        };
        return { ok: true as const, legs, source: "routed" as const, meta };
      }
    } catch {
      // fall through to OSRM
    }

    // 2) OSRM — เส้นทางจริงแต่ไม่มีข้อมูลรถติด
    try {
      const routed = await osrmLegs(nodes);
      if (routed && routed.length > 0) {
        const meta: RouteMeta = {
          source: "osrm",
          trafficAware: false,
          calculatedAt: new Date().toISOString(),
          trafficDelayMin: null,
        };
        return { ok: true as const, legs: routed, source: "routed" as const, meta };
      }
    } catch {
      // fall through to estimate
    }

    // 3) ประมาณการจากระยะตรง
    const legs = nodes.slice(0, -1).map((from, i) => fallbackLeg(from, nodes[i + 1]!, policy));
    const meta: RouteMeta = {
      source: "estimated",
      trafficAware: false,
      calculatedAt: new Date().toISOString(),
      trafficDelayMin: null,
    };
    return { ok: true as const, legs, source: "estimated" as const, meta };
  });
