import { create } from "zustand";
import { persist } from "zustand/middleware";
import { haversineKm, nearestOnPolyline, pointAlongPolyline, polylineLengthKm } from "@/lib/engine/geo";
import { REST_STOPS } from "@/lib/data/rest-stops";
import { googleRestStops, googleRouteEta, type GooglePlaceStop } from "@/lib/maps/google";
import type { Place, PlanStop, Policy, RestStop, RouteLeg, Trip } from "@/lib/engine/types";

/* ============================================================
 * ระบบเฝ้าระวัง GPS สำหรับโหมดคนขับ
 * - โหมด "demo"   : จำลองรถวิ่งตามเส้นทาง (ทดสอบระบบแจ้งเตือนได้ทันที)
 * - โหมด "device" : ใช้ GPS ของมือถือคนขับ (ไม่ต้องตั้งค่าอะไร)
 * - โหมด "api"    : ต่อระบบ GPS ผู้ให้บริการจริง (ปรับ config ได้ในหน้าแอป)
 * ============================================================ */

export type GpsPosition = {
  lat: number;
  lng: number;
  speedKmh: number | null;
  at: string;
  source: "demo" | "device" | "api";
  /** ความคลาดเคลื่อนของ GPS (เมตร) — มีจากเครื่องนี้/บางระบบ API */
  accuracyM?: number | null;
};

export type GpsMode = "off" | "demo" | "device" | "api";

export type GpsApiConfig = {
  url: string;
  method: "GET" | "POST";
  headersJson: string;
  bodyJson: string;
  latPath: string;
  lngPath: string;
  speedPath: string;
  /** field path ของความแม่นยำ (เมตร) ถ้าผู้ให้บริการส่งมา เช่น acc */
  accuracyPath: string;
};

export const DEFAULT_GPS_API_CONFIG: GpsApiConfig = {
  url: "",
  method: "GET",
  headersJson: "",
  bodyJson: "",
  latPath: "lat",
  lngPath: "lng",
  speedPath: "speed",
  accuracyPath: "",
};

export type WatchdogLevel = "ok" | "watch" | "act";

/** ความสดของตำแหน่ง GPS — ไม่ตัดสินอะไรจาก GPS ที่เก่า/ใช้ไม่ได้ */
export type GpsQuality = "fresh" | "stale" | "unusable";

/** เกณฑ์ตรวจ GPS เก่า/ใช้ไม่ได้ + ยืนยันออกนอกเส้นทางหลายจุดต่อเนื่อง */
export const GPS_STALE_MIN = 3;
export const GPS_UNUSABLE_MIN = 10;
export const GPS_ACC_STALE_M = 100;
export const GPS_ACC_UNUSABLE_M = 300;
export const OFF_ROUTE_KM = 1.5;
export const OFF_ROUTE_CONFIRM_ROUNDS = 2;

export function gpsQuality(
  pos: GpsPosition,
  now: Date,
): { quality: GpsQuality; ageMin: number } {
  const ageMin = Math.max(0, (now.getTime() - new Date(pos.at).getTime()) / 60000);
  const acc = pos.accuracyM ?? null;
  let quality: GpsQuality = "fresh";
  if (ageMin > GPS_UNUSABLE_MIN || (acc != null && acc > GPS_ACC_UNUSABLE_M)) {
    quality = "unusable";
  } else if (ageMin > GPS_STALE_MIN || (acc != null && acc > GPS_ACC_STALE_M)) {
    quality = "stale";
  }
  return { quality, ageMin };
}

export type WatchdogResult = {
  level: WatchdogLevel;
  delayMin: number;
  progressFrac: number;
  offRouteKm: number;
  nextRestName: string | null;
  nextRestEtaMin: number | null;
  nextRestReachable: boolean;
  remainingDriveMin: number;
  etaDestinationMin: number | null;
  destinationReachable: boolean;
  message: string;
  alternatives: RestStop[];
  /** "google" = เวลาถึงคำนวณจากข้อมูลรถติดจริงของ Google Routes API */
  etaSource: "estimate" | "google";
  /** ข้อความ error ล่าสุดจาก Google (ถ้ามี — ระบบยังทำงานด้วยค่าประมาณตามเส้นทาง) */
  googleError?: string;
  /** ความสดของตำแหน่ง GPS ที่ใช้ประเมินครั้งนี้ */
  gpsQuality: GpsQuality;
  /** อายุตำแหน่ง GPS (นาที) */
  gpsAgeMin: number;
  /** ความแม่นยำที่รายงาน (เมตร) — null = ไม่ทราบ */
  gpsAccuracyM: number | null;
  /** ออกนอกเส้นทางที่ยืนยันแล้วเท่านั้น (เหลื่อมเกินเกณฑ์หลายรอบเช็คต่อเนื่อง — ไม่ตัดสินจาก GPS จุดเดียว) */
  offRoute: boolean;
  /** จำนวนรอบเช็คต่อเนื่องที่เหลื่อมเกินเกณฑ์ */
  offRouteStreak: number;
};

/* ---------------- เส้นทางเต็มของเที่ยววิ่ง ---------------- */

export function tripPolyline(trip: Trip): [number, number][] {
  const pts: [number, number][] = [];
  const legs: RouteLeg[] =
    trip.legs && trip.legs.length > 0
      ? trip.legs
      : straightLegs(trip);
  for (const leg of legs) {
    for (const p of leg.geometry) {
      const last = pts[pts.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) pts.push(p);
    }
  }
  return pts.length >= 2
    ? pts
    : [
        [trip.origin.lat, trip.origin.lng],
        [trip.destination.lat, trip.destination.lng],
      ];
}

function straightLegs(trip: Trip): RouteLeg[] {
  const nodes: Place[] = [trip.origin, ...trip.waypoints, trip.destination];
  const legs: RouteLeg[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i]!;
    const b = nodes[i + 1]!;
    legs.push({
      fromId: a.id,
      toId: b.id,
      distanceKm: haversineKm(a, b),
      durationMin: (haversineKm(a, b) / 55) * 60,
      geometry: [
        [a.lat, a.lng],
        [b.lat, b.lng],
      ],
      source: "estimated",
    });
  }
  return legs;
}

/* ---------------- Adapters: ดึงตำแหน่งรถ ---------------- */

/** โหมดจำลอง: รถวิ่งตามเส้นทางตามนาฬิกาเที่ยว (trip.clock) หน่วงด้วย factor */
export function demoPosition(trip: Trip, at: Date, factor: number): GpsPosition {
  const geom = tripPolyline(trip);
  const startMs = new Date(trip.startTime).getTime();
  const totalPlanMin = Math.max(1, (new Date(trip.plan.eta).getTime() - startMs) / 60000);
  const elapsedMin = (at.getTime() - startMs) / 60000;
  const frac = Math.min(1, Math.max(0, elapsedMin / Math.max(0.5, factor) / totalPlanMin));
  const [lat, lng] = pointAlongPolyline(geom, frac);
  return { lat, lng, speedKmh: null, at: at.toISOString(), source: "demo" };
}

/** โหมดเครื่องนี้: GPS จากมือถือคนขับ */
export function devicePosition(): Promise<GpsPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("เบราว์เซอร์นี้ไม่รองรับ GPS"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) =>
        resolve({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          speedKmh: p.coords.speed != null ? p.coords.speed * 3.6 : null,
          at: new Date().toISOString(),
          source: "device",
          accuracyM: p.coords.accuracy ?? null,
        }),
      (err) => reject(new Error(`อ่าน GPS เครื่องนี้ไม่ได้ (${err.message})`)),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  });
}

function extractPath(obj: unknown, path: string): unknown {
  const parts = path.split(".").filter(Boolean);
  let cur: unknown = obj;
  for (const key of parts) {
    if (cur == null) return undefined;
    if (Array.isArray(cur)) {
      const i = Number(key);
      cur = Number.isNaN(i) ? undefined : cur[i];
    } else if (typeof cur === "object") {
      cur = (cur as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return cur;
}

/** โหมด API: ดึงจากระบบ GPS ผู้ให้บริการ (REST polling) */
export async function apiPosition(cfg: GpsApiConfig): Promise<GpsPosition> {
  if (!cfg.url) throw new Error("ยังไม่ได้ตั้งค่า URL ของระบบ GPS");
  const headers: Record<string, string> = {};
  if (cfg.headersJson.trim()) {
    try {
      Object.assign(headers, JSON.parse(cfg.headersJson) as Record<string, string>);
    } catch {
      throw new Error("Headers ต้องเป็น JSON ที่ถูกต้อง");
    }
  }
  const init: RequestInit = { method: cfg.method, headers, signal: AbortSignal.timeout(10000) };
  if (cfg.method === "POST" && cfg.bodyJson.trim()) {
    init.body = cfg.bodyJson;
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  }
  const res = await fetch(cfg.url, init);
  if (!res.ok) throw new Error(`ระบบ GPS ตอบกลับ HTTP ${res.status}`);
  const body: unknown = await res.json();
  const lat = Number(extractPath(body, cfg.latPath || "lat"));
  const lng = Number(extractPath(body, cfg.lngPath || "lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("อ่านพิกัดจากผลลัพธ์ไม่ได้ — ตรวจ lat/lng path อีกครั้ง");
  }
  const speedRaw = cfg.speedPath ? Number(extractPath(body, cfg.speedPath)) : NaN;
  const accRaw = cfg.accuracyPath ? Number(extractPath(body, cfg.accuracyPath)) : NaN;
  return {
    lat,
    lng,
    speedKmh: Number.isFinite(speedRaw) ? speedRaw : null,
    at: new Date().toISOString(),
    source: "api",
    accuracyM: Number.isFinite(accRaw) ? accRaw : null,
  };
}

/* ---------------- เครื่องเฝ้าระวัง (watchdog) ---------------- */

export function runWatchdog(
  trip: Trip,
  pos: GpsPosition,
  policy: Policy,
  continuousNow: number,
  now: Date,
): WatchdogResult {
  const geom = tripPolyline(trip);
  const totalKm = polylineLengthKm(geom);
  const proj = nearestOnPolyline(geom, pos);

  const startMs = new Date(trip.startTime).getTime();
  const totalPlanMin = Math.max(1, (new Date(trip.plan.eta).getTime() - startMs) / 60000);
  const elapsedMin = (now.getTime() - startMs) / 60000;
  const expectedFrac = Math.min(1, Math.max(0, elapsedMin / totalPlanMin));
  const delayMin = Math.max(0, (expectedFrac - proj.fraction) * totalPlanMin);

  const remainingDriveMin = Math.max(0, policy.maxContinuousMin - continuousNow);
  const speed = Math.max(20, policy.avgHighwayKmh);

  // จุดพักถัดไปในแผน (จุดที่ยังไม่ผ่านตำแหน่งรถ)
  const rests = trip.plan.stops
    .filter((s) => s.type === "rest")
    .map((s) => ({ stop: s, frac: nearestOnPolyline(geom, s.place).fraction }))
    .sort((a, b) => a.frac - b.frac);
  const next = rests.find((r) => r.frac > proj.fraction + 0.004);

  const etaTo = (frac: number) => ((frac - proj.fraction) * totalKm / speed) * 60;

  const nextRestEtaMin = next ? etaTo(next.frac) : null;
  const nextRestReachable = next ? nextRestEtaMin! + policy.bufferMin <= remainingDriveMin : true;
  const etaDestinationMin = etaTo(1);
  const destinationReachable = etaDestinationMin + policy.bufferMin <= remainingDriveMin;

  let level: WatchdogLevel = "ok";
  let message = "ตำแหน่งรถอยู่ตามแผน — เฝ้าระวังต่อเนื่อง";
  if (delayMin > 10) {
    level = "watch";
    message = `ล่าช้าสะสมประมาณ ${Math.round(delayMin)} นาที — เฝ้าดูจุดพักถัดไปให้แน่น`;
  }

  // ทริกเกอร์หนัก: จะไปไม่ถึงจุดพักถัดไปภายในเวลาขับที่เหลือ (รวม buffer)
  if (next && !nextRestReachable) {
    level = "act";
    message = `รถติด/ล่าช้า! คำนวณแล้วจะไปไม่ถึง "${next.stop.place.name}" ภายในเวลาขับที่เหลือ ${Math.round(remainingDriveMin)} นาที — ต้องเลือกจุดพักใหม่ก่อนออกเดินทางต่อ`;
  } else if (!next && !destinationReachable) {
    level = "act";
    message = `เวลาขับที่เหลือไม่พอไปปลายทาง (ต้องการ ~${Math.round(etaDestinationMin)} นาที เหลือ ${Math.round(remainingDriveMin)} นาที) — ต้องหาจุดพักก่อน`;
  } else if (remainingDriveMin <= 10 && trip.status === "enroute") {
    level = "act";
    message = `เวลาขับต่อเนื่องเหลือ ${Math.round(remainingDriveMin)} นาที — ต้องจอดพักในที่ปลอดภัยทันที`;
  }

  // จุดพักแนะนำ (เมื่อระดับ act): จุดบนเส้นทางข้างหน้าที่ไปทัน
  const alternatives: RestStop[] = [];
  if (level === "act") {
    const targetFrac = next ? next.frac : Math.min(1, proj.fraction + 0.5);
    const budgetFrac =
      proj.fraction +
      Math.max(0, (remainingDriveMin - policy.bufferMin) * (speed / 60)) / Math.max(1, totalKm);
    const ceiling = Math.max(proj.fraction + 0.01, Math.min(targetFrac, budgetFrac));
    const scored = REST_STOPS.filter((s) => (policy.vehicleType !== "6-wheel" ? s.truckOk : true))
      .map((s) => ({ s, proj: nearestOnPolyline(geom, s) }))
      .filter((x) => x.proj.fraction > proj.fraction + 0.004 && x.proj.fraction <= ceiling + 0.02)
      .filter((x) => x.proj.distKm <= 12)
      .sort((a, b) => a.proj.fraction - b.proj.fraction)
      .slice(0, 4);
    for (const x of scored) {
      alternatives.push({
        ...x.s,
        note: `ไปทันในเวลาที่เหลือ · เบี่ยง ~${x.proj.distKm.toFixed(1)} กม.`,
      });
    }
    if (alternatives.length === 0) {
      const coord = pointAlongPolyline(geom, Math.min(ceiling, 0.999));
      alternatives.push({
        id: "unverified-emergency",
        name: "จุดปลอดภัยริมทาง (ยังไม่ยืนยัน)",
        lat: coord[0],
        lng: coord[1],
        truckOk: false,
        facilities: [],
        verification: "unverified",
        note: "ไม่มีจุดพักในคลังที่ไปทัน — ให้คนขับเลือกจุดจอดที่ปลอดภัยเอง",
        kind: "rest",
      });
    }
  }

  return {
    level,
    delayMin,
    progressFrac: proj.fraction,
    offRouteKm: proj.distKm,
    nextRestName: next?.stop.place.name ?? null,
    nextRestEtaMin,
    nextRestReachable,
    remainingDriveMin,
    etaDestinationMin,
    destinationReachable,
    message,
    alternatives,
    etaSource: "estimate",
    gpsQuality: "fresh",
    gpsAgeMin: 0,
    gpsAccuracyM: pos.accuracyM ?? null,
    offRoute: false,
    offRouteStreak: 0,
  };
}

/* ---------------- เสริมความแม่นด้วย Google (รถติดจริง + จุดพักจริง) ---------------- */

function googleKeyOrNull(): string | undefined {
  const s = useGpsSettings.getState();
  if (!s.googleEnabled) return undefined;
  const key = s.googleMapsKey.trim();
  // คืน undefined ได้ — ถ้าฝั่งเซิร์ฟเวอร์ตั้ง env GOOGLE_MAPS_API_KEY ไว้จะใช้จาก env แทน
  return key || undefined;
}

/** จุดพักถัดไปที่ยังไม่ผ่านตำแหน่งรถ (ตรรกะเดียวกับ runWatchdog) */
function nextRestAhead(trip: Trip, projFrac: number): { stop: PlanStop; frac: number } | null {
  const geom = tripPolyline(trip);
  const rests = trip.plan.stops
    .filter((s) => s.type === "rest")
    .map((s) => ({ stop: s, frac: nearestOnPolyline(geom, s.place).fraction }))
    .sort((a, b) => a.frac - b.frac);
  return rests.find((r) => r.frac > projFrac + 0.004) ?? null;
}

/**
 * ค้นหาจุดพักจริงจาก Google Places บนช่วงเส้นทางที่รถไปทันภายในเวลาขับที่เหลือ
 * แล้วรวมกับจุดพักจากคลังข้อมูลเดิม (ตัดซ้ำระยะใกล้กัน < 1.5 กม.)
 */
async function googleAlternatives(
  trip: Trip,
  projFrac: number,
  remainingDriveMin: number,
  policy: Policy,
  geom: [number, number][],
  totalKm: number,
  existing: RestStop[],
): Promise<RestStop[]> {
  const speed = Math.max(20, policy.avgHighwayKmh);
  const budgetKm = Math.max(0, remainingDriveMin - policy.bufferMin) * (speed / 60);
  const ceilingFrac = Math.min(0.999, projFrac + budgetKm / Math.max(1, totalKm));
  if (ceilingFrac <= projFrac + 0.005) return existing;

  const midFrac = (projFrac + ceilingFrac) / 2;
  const probeA = pointAlongPolyline(geom, midFrac);
  const probeB = pointAlongPolyline(geom, ceilingFrac);
  const apiKey = googleKeyOrNull();

  const results = await Promise.all([
    googleRestStops({ data: { lat: probeA[0], lng: probeA[1], radiusM: 10000, apiKey } }).catch(() => null),
    googleRestStops({ data: { lat: probeB[0], lng: probeB[1], radiusM: 10000, apiKey } }).catch(() => null),
  ]);

  const byId = new Map<string, GooglePlaceStop>();
  for (const r of results) {
    if (r && r.ok) for (const s of r.stops) byId.set(s.id, s);
  }

  const candidates: { stop: RestStop; frac: number }[] = [];
  for (const s of byId.values()) {
    const proj = nearestOnPolyline(geom, { lat: s.lat, lng: s.lng });
    // ต้องอยู่ข้างหน้ารถ และไม่เกินเพดานระยะที่ไปทัน
    if (proj.fraction <= projFrac + 0.004 || proj.fraction > ceilingFrac + 0.02) continue;
    if (proj.distKm > 12) continue;
    // ตัดซ้ำกับจุดพักในคลังเดิม (แค่ ~1.5 กม. ถือว่าเป็นที่เดียวกัน)
    const dupOfCatalog = existing.some(
      (c) => haversineKm({ lat: s.lat, lng: s.lng }, c) < 1.5,
    );
    if (dupOfCatalog) continue;
    const etaMin = ((proj.fraction - projFrac) * totalKm) / speed;
    const bits = [
      `ไปทันในเวลาที่เหลือ · เบี่ยง ~${proj.distKm.toFixed(1)} กม. · ~${Math.round(etaMin)} นาที`,
      s.rating != null ? `★ ${s.rating.toFixed(1)}` : null,
      s.openNow != null ? (s.openNow ? "เปิดอยู่" : "ปิดแล้ว") : null,
    ].filter(Boolean);
    candidates.push({
      frac: proj.fraction,
      stop: {
        id: `g-${s.id}`,
        name: s.name,
        address: s.address || undefined,
        lat: s.lat,
        lng: s.lng,
        truckOk: false,
        facilities: ["ปั๊มน้ำมัน"],
        verification: "must-verify",
        note: bits.join(" · "),
        kind: "rest",
      },
    });
  }

  const existingWithFrac = existing.map((s) => ({
    frac: nearestOnPolyline(geom, s).fraction,
    stop: s,
  }));
  return [...candidates, ...existingWithFrac]
    .sort((a, b) => a.frac - b.frac)
    .slice(0, 6)
    .map((x) => x.stop);
}

/**
 * เรียก Google Routes API ตรวจเวลาถึงจุดพักถัดไป/ปลายทางด้วยข้อมูลรถติดจริง
 * ถ้าไปไม่ทัน → ยกระดับเตือนเป็น act + หาจุดพักจริงจาก Google Places ให้ทันที
 * ทุกกรณีถ้า Google ล่ม/key มีปัญหา ระบบยังใช้ผลคำนวณจากเส้นทางเดิม (fallback ปลอดภัย)
 */
async function enrichWithGoogle(
  trip: Trip,
  pos: GpsPosition,
  wd: WatchdogResult,
  policy: Policy,
  continuousNow: number,
): Promise<WatchdogResult> {
  const apiKey = googleKeyOrNull();
  const geom = tripPolyline(trip);
  const totalKm = polylineLengthKm(geom);
  const proj = nearestOnPolyline(geom, pos);
  const remainingDriveMin = Math.max(0, policy.maxContinuousMin - continuousNow);
  const next = nextRestAhead(trip, proj.fraction);
  const target = next ? next.stop.place : trip.destination;

  const r = await googleRouteEta({
    data: {
      origin: { lat: pos.lat, lng: pos.lng },
      destination: { lat: target.lat, lng: target.lng },
      apiKey,
    },
  }).catch(() => null);

  if (!r) return { ...wd, googleError: "เรียก Google Routes API ไม่สำเร็จ" };
  if (!r.ok) return { ...wd, googleError: r.error };

  const etaMin = r.durationMin;
  const out: WatchdogResult = { ...wd, etaSource: "google", googleError: undefined };

  if (next) {
    out.nextRestEtaMin = etaMin;
    out.nextRestReachable = etaMin + policy.bufferMin <= remainingDriveMin;
    if (!out.nextRestReachable) {
      out.level = "act";
      out.message = `ข้อมูลรถติดจริง (Google): จุดพัก "${next.stop.place.name}" ใช้เวลา ~${Math.round(etaMin)} นาที แต่เวลาขับที่เหลือ ${Math.round(remainingDriveMin)} นาที — ต้องเลือกจุดพักใหม่ก่อนออกเดินทางต่อ`;
    } else {
      const baseEta = wd.nextRestEtaMin ?? etaMin;
      if (out.level === "ok" && etaMin > baseEta + 10) {
        out.level = "watch";
        out.message = `ข้อมูลรถติดจริง (Google): ไปถึงจุดพักใช้ ~${Math.round(etaMin)} นาที (ช้ากว่าแผน ~${Math.round(etaMin - baseEta)} นาที) — เฝ้าดูต่อเนื่อง`;
      }
    }
  } else {
    out.etaDestinationMin = etaMin;
    out.destinationReachable = etaMin + policy.bufferMin <= remainingDriveMin;
    if (!out.destinationReachable) {
      out.level = "act";
      out.message = `ข้อมูลรถติดจริง (Google): ปลายทางใช้เวลา ~${Math.round(etaMin)} นาที แต่เวลาขับที่เหลือ ${Math.round(remainingDriveMin)} นาที — ต้องหาจุดพักก่อน`;
    }
  }

  if (out.level === "act") {
    out.alternatives = await googleAlternatives(
      trip,
      proj.fraction,
      remainingDriveMin,
      policy,
      geom,
      totalKm,
      out.alternatives,
    );
  }
  return out;
}

/* ---------------- Stores ---------------- */

type GpsSettingsState = {
  mode: GpsMode;
  apiConfig: GpsApiConfig;
  telegramBotToken: string;
  telegramChatId: string;
  /** Google Maps API key จากหน้าตั้งค่า (ถ้าว่างจะใช้ env GOOGLE_MAPS_API_KEY ฝั่งเซิร์ฟเวอร์) */
  googleMapsKey: string;
  /** เปิดใช้ข้อมูลรถติดจริง + จุดพักจริงจาก Google */
  googleEnabled: boolean;
  setMode: (m: GpsMode) => void;
  setApiConfig: (c: Partial<GpsApiConfig>) => void;
  setTelegram: (botToken: string, chatId: string) => void;
  setGoogle: (key: string, enabled: boolean) => void;
};

function getApiConfig(): GpsApiConfig {
  return useGpsSettings.getState().apiConfig ?? DEFAULT_GPS_API_CONFIG;
}

export const useGpsSettings = create<GpsSettingsState>()(
  persist(
    (set) => ({
      mode: "off",
      apiConfig: DEFAULT_GPS_API_CONFIG,
      telegramBotToken: "",
      telegramChatId: "",
      googleMapsKey: "",
      googleEnabled: false,
      setMode: (mode) => set({ mode }),
      setApiConfig: (c) => set({ apiConfig: { ...getApiConfig(), ...c } }),
      setTelegram: (telegramBotToken, telegramChatId) => set({ telegramBotToken, telegramChatId }),
      setGoogle: (googleMapsKey, googleEnabled) => set({ googleMapsKey, googleEnabled }),
    }),
    {
      name: "phaopanya-gps-settings",
      partialize: (s) => ({
        mode: s.mode,
        apiConfig: s.apiConfig,
        telegramBotToken: s.telegramBotToken,
        telegramChatId: s.telegramChatId,
        googleMapsKey: s.googleMapsKey,
        googleEnabled: s.googleEnabled,
      }),
    },
  ),
);

type GpsLiveState = {
  status: "idle" | "polling" | "error";
  error: string | null;
  pos: GpsPosition | null;
  watchdog: WatchdogResult | null;
  lastCheckAt: string | null;
  demoFactor: number;
  /** รอบเช็คต่อเนื่องที่รถเหลื่อมเส้นทางเกินเกณฑ์ (รีเซ็ตเมื่อกลับเข้าเส้นทาง) */
  offRouteStreak: number;
  setStatus: (status: GpsLiveState["status"], error?: string | null) => void;
  setPosition: (pos: GpsPosition) => void;
  setWatchdog: (wd: WatchdogResult | null) => void;
  setDemoFactor: (f: number) => void;
  setOffRouteStreak: (n: number) => void;
  reset: () => void;
};

export const useGpsLive = create<GpsLiveState>()((set) => ({
  status: "idle",
  error: null,
  pos: null,
  watchdog: null,
  lastCheckAt: null,
  demoFactor: 1,
  offRouteStreak: 0,
  setStatus: (status, error = null) => set({ status, error }),
  setPosition: (pos) => set({ pos }),
  setWatchdog: (watchdog) => set({ watchdog }),
  setDemoFactor: (demoFactor) => set({ demoFactor: Math.min(3, Math.max(1, demoFactor)) }),
  setOffRouteStreak: (offRouteStreak) => set({ offRouteStreak }),
  reset: () =>
    set({
      status: "idle",
      error: null,
      pos: null,
      watchdog: null,
      lastCheckAt: null,
      demoFactor: 1,
      offRouteStreak: 0,
    }),
}));

/** ดึงตำแหน่งรถตามโหมดที่เลือก + รัน watchdog แล้วเก็บผลลง live store */
export async function checkGpsNow(
  trip: Trip,
  policy: Policy,
  continuousNow: number,
  at?: Date,
): Promise<WatchdogResult | null> {
  const { mode, apiConfig } = useGpsSettings.getState();
  const live = useGpsLive.getState();
  if (mode === "off") {
    live.setWatchdog(null);
    return null;
  }
  const nowAt = at ?? new Date();
  live.setStatus("polling");
  try {
    let pos: GpsPosition;
    if (mode === "demo") {
      pos = demoPosition(trip, trip.status === "planned" ? nowAt : new Date(trip.clock), live.demoFactor);
    } else if (mode === "device") {
      pos = await devicePosition();
    } else {
      pos = await apiPosition(apiConfig);
    }
    const wdBase = runWatchdog(
      trip,
      pos,
      policy,
      continuousNow,
      mode === "demo" ? new Date(trip.clock) : nowAt,
    );

    // ความสดของ GPS — แสดงสถานะให้คนขับ/ผู้ดูแลเห็นชัด ไม่ประเมินจาก GPS เก่าเงียบ ๆ
    const { quality, ageMin } = gpsQuality(pos, mode === "demo" ? new Date(trip.clock) : nowAt);
    wdBase.gpsQuality = quality;
    wdBase.gpsAgeMin = ageMin;

    // ยืนยัน "ออกนอกเส้นทาง" ด้วยหลายจุดต่อเนื่อง — ไม่เตือนจาก GPS จุดเดียว
    // (กัน GPS เด้ง/อยู่ในอุโมงค์) และไม่นับตอนจอดพัก (จุดพักอาจเบี่ยงออกจากเส้นทางได้)
    const offNow = wdBase.offRouteKm > OFF_ROUTE_KM && trip.status === "enroute";
    const live2 = useGpsLive.getState();
    const streak = offNow ? live2.offRouteStreak + 1 : 0;
    live2.setOffRouteStreak(streak);
    wdBase.offRouteStreak = streak;
    wdBase.offRoute = offNow && streak >= OFF_ROUTE_CONFIRM_ROUNDS;

    const wd = useGpsSettings.getState().googleEnabled
      ? await enrichWithGoogle(trip, pos, wdBase, policy, continuousNow)
      : wdBase;
    live.setPosition(pos);
    live.setWatchdog(wd);
    live.setStatus("idle", null);
    return wd;
  } catch (e) {
    live.setStatus("error", e instanceof Error ? e.message : "เชื่อมต่อ GPS ไม่สำเร็จ");
    return null;
  }
}
