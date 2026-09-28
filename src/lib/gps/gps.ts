import { create } from "zustand";
import { persist } from "zustand/middleware";
import { haversineKm, nearestOnPolyline, pointAlongPolyline, polylineLengthKm } from "@/lib/engine/geo";
import { REST_STOPS } from "@/lib/data/rest-stops";
import type { Place, Policy, RestStop, RouteLeg, Trip } from "@/lib/engine/types";

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
};

export const DEFAULT_GPS_API_CONFIG: GpsApiConfig = {
  url: "",
  method: "GET",
  headersJson: "",
  bodyJson: "",
  latPath: "lat",
  lngPath: "lng",
  speedPath: "speed",
};

export type WatchdogLevel = "ok" | "watch" | "act";

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
  return {
    lat,
    lng,
    speedKmh: Number.isFinite(speedRaw) ? speedRaw : null,
    at: new Date().toISOString(),
    source: "api",
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
  };
}

/* ---------------- Stores ---------------- */

type GpsSettingsState = {
  mode: GpsMode;
  apiConfig: GpsApiConfig;
  telegramBotToken: string;
  telegramChatId: string;
  setMode: (m: GpsMode) => void;
  setApiConfig: (c: Partial<GpsApiConfig>) => void;
  setTelegram: (botToken: string, chatId: string) => void;
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
      setMode: (mode) => set({ mode }),
      setApiConfig: (c) => set({ apiConfig: { ...getApiConfig(), ...c } }),
      setTelegram: (telegramBotToken, telegramChatId) => set({ telegramBotToken, telegramChatId }),
    }),
    {
      name: "phaopanya-gps-settings",
      partialize: (s) => ({
        mode: s.mode,
        apiConfig: s.apiConfig,
        telegramBotToken: s.telegramBotToken,
        telegramChatId: s.telegramChatId,
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
  setStatus: (status: GpsLiveState["status"], error?: string | null) => void;
  setPosition: (pos: GpsPosition) => void;
  setWatchdog: (wd: WatchdogResult | null) => void;
  setDemoFactor: (f: number) => void;
  reset: () => void;
};

export const useGpsLive = create<GpsLiveState>()((set) => ({
  status: "idle",
  error: null,
  pos: null,
  watchdog: null,
  lastCheckAt: null,
  demoFactor: 1,
  setStatus: (status, error = null) => set({ status, error }),
  setPosition: (pos) => set({ pos }),
  setWatchdog: (watchdog) => set({ watchdog }),
  setDemoFactor: (demoFactor) => set({ demoFactor: Math.min(3, Math.max(1, demoFactor)) }),
  reset: () =>
    set({ status: "idle", error: null, pos: null, watchdog: null, lastCheckAt: null, demoFactor: 1 }),
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
    const wd = runWatchdog(
      trip,
      pos,
      policy,
      continuousNow,
      mode === "demo" ? new Date(trip.clock) : nowAt,
    );
    live.setPosition(pos);
    live.setWatchdog(wd);
    live.setStatus("idle", null);
    return wd;
  } catch (e) {
    live.setStatus("error", e instanceof Error ? e.message : "เชื่อมต่อ GPS ไม่สำเร็จ");
    return null;
  }
}
