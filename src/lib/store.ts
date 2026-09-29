import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "./utils";
import { addMinutes, formatClock } from "./format";
import { DEFAULT_POLICY, policyFromPartial } from "./engine/policy";
import { buildFallbackLegs, planTrip } from "./engine/rest-engine";
import { haversineKm } from "./engine/geo";
import type {
  Place,
  PlanResult,
  Policy,
  RestStop,
  RouteLeg,
  RouteMeta,
  Trip,
  TripEventType,
  VehicleType,
} from "./engine/types";
import { seedSampleTrip } from "./data/sample-trip";
import { PLACES } from "./data/places";

type ChatTurn = { id: string; role: "user" | "assistant"; content: string };

export type SavedRoute = {
  id: string;
  title: string;
  origin: Place;
  waypoints: Place[];
  destination: Place;
  savedAt: string;
  note?: string;
};

type AppState = {
  policy: Policy;
  trips: Trip[];
  savedRoutes: SavedRoute[];
  activeTripId: string | null;
  chat: ChatTurn[];
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setPolicy: (p: Partial<Policy>) => void;
  setVehicle: (v: VehicleType) => void;
  createTrip: (input: {
    origin: Place;
    waypoints: Place[];
    destination: Place;
    startTime: string;
    title?: string;
  }) => Trip;
  applyLegsAndPlan: (tripId: string, legs: RouteLeg[], meta?: RouteMeta) => void;
  saveRouteFromTrip: (tripId: string, note?: string) => void;
  deleteSavedRoute: (id: string) => void;
  setActive: (id: string | null) => void;
  pushEvent: (tripId: string, type: TripEventType, label: string, extraMin?: number) => void;
  startTrip: (tripId: string) => void;
  addDelay: (tripId: string, minutes: number) => void;
  startRest: (tripId: string) => void;
  finishRest: (tripId: string) => void;
  completeTrip: (tripId: string) => void;
  advanceClock: (tripId: string, minutes: number) => void;
  replaceNextRest: (tripId: string, newRest: RestStop) => void;
  addChat: (role: "user" | "assistant", content: string) => void;
  resetChat: () => void;
  resetDemo: () => void;
};

function replan(trip: Trip, policy: Policy, extra?: Partial<Pick<Trip, "continuousMin" | "delayMin" | "clock">>): Trip {
  const next = { ...trip, ...extra };
  const legs = buildFallbackLegs(trip.origin, trip.waypoints, trip.destination, policy);
  const plan = planTrip({
    origin: trip.origin,
    waypoints: trip.waypoints,
    destination: trip.destination,
    startTime: new Date(next.clock),
    policy: { ...policy, vehicleType: trip.vehicleType },
    legs,
    continuousMin: next.continuousMin,
    delayMin: next.delayMin,
  });
  return { ...next, plan, policySnapshot: policy };
}

function event(type: TripEventType, label: string, extraMin?: number) {
  return { id: uid("ev"), type, at: new Date().toISOString(), label, extraMin };
}

/** เวลาขับต่อเนื่องจริง ณ ตอนนี้ (นับจาก enrouteSince แบบเรียลไทม์) */
export function continuousNowOf(trip: Trip): number {
  if (trip.status === "enroute" && trip.enrouteSince) {
    const extra = (Date.now() - new Date(trip.enrouteSince).getTime()) / 60000;
    return trip.continuousMin + Math.max(0, extra);
  }
  return trip.continuousMin;
}

/** เวลาพักที่เหลือ (นาที) — null ถ้าไม่ได้อยู่ระหว่างพัก */
export function restRemainingMin(trip: Trip, policy: Policy): number | null {
  if (trip.status !== "resting" || !trip.restStartedAt) return null;
  const elapsed = (Date.now() - new Date(trip.restStartedAt).getTime()) / 60000;
  return Math.max(0, policy.restMin - elapsed);
}

function seedSavedRoutes(): SavedRoute[] {
  const p = (id: string) => PLACES.find((x) => x.id === id);
  const origin = p("scgjwd-wangnoi");
  const nakhonsawan = p("nakhonsawan");
  const chiangmai = p("chiangmai");
  const lcb = p("scgjwd-lcb");
  const routes: SavedRoute[] = [];
  if (origin && nakhonsawan && chiangmai) {
    routes.push({
      id: "route-seed-north",
      title: "วังน้อย → นครสวรรค์ → เชียงใหม่",
      origin,
      waypoints: [nakhonsawan],
      destination: chiangmai,
      savedAt: new Date().toISOString(),
      note: "เส้นทางเหนือ 586 กม. — เที่ยวเดิมของบริษัท",
    });
  }
  if (origin && lcb) {
    routes.push({
      id: "route-seed-lcb",
      title: "วังน้อย → แหลมฉบัง",
      origin,
      waypoints: [],
      destination: lcb,
      savedAt: new Date().toISOString(),
      note: "เที่ยวสั้น ส่งของคลังแหลมฉบัง",
    });
  }
  return routes;
}

export const useDesk = create<AppState>()(
  persist(
    (set, get) => ({
      policy: DEFAULT_POLICY,
      trips: [seedSampleTrip(DEFAULT_POLICY)],
      savedRoutes: seedSavedRoutes(),
      activeTripId: "trip-sample-north",
      chat: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "สวัสดีครับ ผมคือผู้ช่วยวางแผนเส้นทางของเผ่าปัญญา ทรานสปอร์ต สำหรับงาน SCGJWD\n\nคุมไม่ให้ขับต่อเนื่องเกิน 4 ชั่วโมง และจัดพัก 30 นาทีตามนโยบายเที่ยวนี้\nเปิดเที่ยวตัวอย่างวังน้อย → นครสวรรค์ → เชียงใหม่ ได้เลย หรือวางแผนเที่ยวใหม่\n\nตัวเลขในแผนเป็นค่าประมาณจนกว่าจะยืนยันจากแผนที่/จุดพักจริง",
        },
      ],
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setPolicy: (p) => {
        const policy = policyFromPartial({ ...get().policy, ...p });
        set({ policy });
      },
      setVehicle: (vehicleType) => {
        const policy = policyFromPartial({ ...get().policy, vehicleType });
        set({ policy });
      },
      createTrip: ({ origin, waypoints, destination, startTime, title }) => {
        const policy = get().policy;
        const legs = buildFallbackLegs(origin, waypoints, destination, policy);
        const plan = planTrip({
          origin,
          waypoints,
          destination,
          startTime: new Date(startTime),
          policy,
          legs,
        });
        const trip: Trip = {
          id: uid("trip"),
          code: `PP-SCG-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(get().trips.length + 1).padStart(2, "0")}`,
          title: title ?? `${origin.name} → ${destination.name}`,
          client: "SCGJWD",
          createdAt: new Date().toISOString(),
          origin,
          waypoints,
          destination,
          startTime,
          status: "planned",
          vehicleType: policy.vehicleType,
          plan,
          legs: buildFallbackLegs(origin, waypoints, destination, policy),
          events: [event("planned", "สร้างแผนเดินทาง")],
          continuousMin: 0,
          clock: startTime,
          currentStopSeq: 1,
          delayMin: 0,
          enrouteSince: null,
          restStartedAt: null,
          policySnapshot: policy,
        };
        set({ trips: [trip, ...get().trips], activeTripId: trip.id });
        return trip;
      },
      applyLegsAndPlan: (tripId, legs, meta) => {
        const { trips, policy } = get();
        set({
          trips: trips.map((t) => {
            if (t.id !== tripId) return t;
            const plan = planTrip({
              origin: t.origin,
              waypoints: t.waypoints,
              destination: t.destination,
              startTime: new Date(t.startTime),
              policy: { ...policy, vehicleType: t.vehicleType },
              legs,
              continuousMin: t.continuousMin,
              delayMin: t.delayMin,
            });
            return { ...t, plan, legs, ...(meta ? { routeMeta: meta } : {}) };
          }),
        });
      },
      saveRouteFromTrip: (tripId, note) => {
        const t = get().trips.find((x) => x.id === tripId);
        if (!t) return;
        if (get().savedRoutes.some((r) => r.title === t.title)) return;
        const route: SavedRoute = {
          id: uid("route"),
          title: t.title,
          origin: t.origin,
          waypoints: t.waypoints,
          destination: t.destination,
          savedAt: new Date().toISOString(),
          note,
        };
        set({ savedRoutes: [route, ...get().savedRoutes] });
      },
      deleteSavedRoute: (id) => {
        set({ savedRoutes: get().savedRoutes.filter((r) => r.id !== id) });
      },
      setActive: (id) => set({ activeTripId: id }),
      pushEvent: (tripId, type, label, extraMin) => {
        set({
          trips: get().trips.map((t) =>
            t.id === tripId ? { ...t, events: [event(type, label, extraMin), ...t.events] } : t,
          ),
        });
      },
      startTrip: (tripId) => {
        const policy = get().policy;
        const nowIso = new Date().toISOString();
        set({
          trips: get().trips.map((t) => {
            if (t.id !== tripId) return t;
            // เริ่มจริงตอนนี้ — คำนวณแผนใหม่โดยยึดเวลาเริ่มจริงเป็นหลัก
            const plan = planTrip({
              origin: t.origin,
              waypoints: t.waypoints,
              destination: t.destination,
              startTime: new Date(nowIso),
              policy: { ...policy, vehicleType: t.vehicleType },
              legs: t.legs ?? buildFallbackLegs(t.origin, t.waypoints, t.destination, policy),
              continuousMin: 0,
              delayMin: t.delayMin,
            });
            return {
              ...t,
              status: "enroute",
              continuousMin: 0,
              clock: nowIso,
              enrouteSince: nowIso,
              restStartedAt: null,
              plan,
              events: [event("depart", "เริ่มออกเดินทาง — เริ่มนับเวลาขับ 0 นาที"), ...t.events],
            };
          }),
        });
      },
      addDelay: (tripId, minutes) => {
        const policy = get().policy;
        set({
          trips: get().trips.map((t) => {
            if (t.id !== tripId) return t;
            const delayMin = t.delayMin + minutes;
            const updated = replan(
              { ...t, delayMin, events: [event("traffic", `รายงานรถติด +${minutes} นาที`, minutes), ...t.events] },
              policy,
              { delayMin, clock: t.clock },
            );
            return updated;
          }),
        });
      },
      startRest: (tripId) => {
        set({
          trips: get().trips.map((t) => {
            if (t.id !== tripId) return t;
            const nowIso = new Date().toISOString();
            // ปิดรอบขับ: รวมเวลาขับที่วิ่งจริงมาเก็บใน continuousMin ก่อนเริ่มพัก
            const folded = t.enrouteSince
              ? t.continuousMin + (Date.now() - new Date(t.enrouteSince).getTime()) / 60000
              : t.continuousMin;
            return {
              ...t,
              status: "resting",
              continuousMin: Math.round(folded),
              enrouteSince: null,
              restStartedAt: nowIso,
              clock: nowIso,
              events: [event("rest-start", "เริ่มพัก — นับถอยหลัง 30 นาที"), ...t.events],
            };
          }),
        });
      },
      finishRest: (tripId) => {
        const policy = get().policy;
        const nowIso = new Date().toISOString();
        set({
          trips: get().trips.map((t) => {
            if (t.id !== tripId) return t;
            const continuousMin = policy.restResetsDriving ? 0 : t.continuousMin;
            const replanned = replan(
              {
                ...t,
                status: "enroute",
                enrouteSince: nowIso,
                restStartedAt: null,
                events: [
                  event("rest-done", `พักครบ ${policy.restMin} นาที — ออกเดินทางต่อ ${formatClock(nowIso)}`),
                  ...t.events,
                ],
              },
              policy,
              { continuousMin, delayMin: 0, clock: nowIso },
            );
            return replanned;
          }),
        });
      },
      completeTrip: (tripId) => {
        set({
          trips: get().trips.map((t) => {
            if (t.id !== tripId) return t;
            const folded = t.enrouteSince
              ? t.continuousMin + (Date.now() - new Date(t.enrouteSince).getTime()) / 60000
              : t.continuousMin;
            return {
              ...t,
              status: "completed",
              continuousMin: Math.round(folded),
              enrouteSince: null,
              restStartedAt: null,
              events: [event("arrive", "ถึงปลายทาง"), ...t.events],
            };
          }),
        });
      },
      advanceClock: (tripId, minutes) => {
        const policy = get().policy;
        set({
          trips: get().trips.map((t) => {
            if (t.id !== tripId || t.status === "completed") return t;
            const clock = addMinutes(new Date(t.clock), minutes).toISOString();
            if (t.status === "resting") {
              // จำลองเวลาพักผ่านไป = เลื่อนเวลาเริ่มพักถอยหลัง
              const restStartedAt = t.restStartedAt
                ? new Date(new Date(t.restStartedAt).getTime() - minutes * 60000).toISOString()
                : t.restStartedAt;
              return { ...t, clock, restStartedAt, events: [event("progress", `จำลองเวลาพัก +${minutes} นาที`), ...t.events] };
            }
            // จำลองเวลาขับผ่านไป = เลื่อนเวลาเริ่มขับถอยหลัง (เข็มนาฬิกาวิ่งเร็วขึ้น)
            const enrouteSince = t.enrouteSince
              ? new Date(new Date(t.enrouteSince).getTime() - minutes * 60000).toISOString()
              : t.enrouteSince;
            const newCont = t.enrouteSince ? continuousNowOf(t) + minutes : t.continuousMin + minutes;
            const over = newCont >= policy.maxContinuousMin;
            return {
              ...t,
              clock,
              enrouteSince,
              continuousMin: t.enrouteSince ? t.continuousMin : newCont,
              events: [
                event(
                  "progress",
                  over
                    ? `จำลอง +${minutes} นาที — เวลาขับถึงเพดานแล้ว ต้องพัก`
                    : `จำลองเวลาขับ +${minutes} นาที`,
                ),
                ...t.events,
              ],
            };
          }),
        });
      },
      replaceNextRest: (tripId, newRest) => {
        const policy = get().policy;
        set({
          trips: get().trips.map((t) =>
            t.id === tripId ? applyRestReplacement(t, policy, newRest) : t,
          ),
        });
      },
      addChat: (role, content) => {
        set({ chat: [...get().chat, { id: uid("m"), role, content }] });
      },
      resetChat: () => set({ chat: [] }),
      resetDemo: () => {
        const policy = DEFAULT_POLICY;
        set({
          policy,
          trips: [seedSampleTrip(policy)],
          activeTripId: "trip-sample-north",
          chat: [],
        });
      },
    }),
    {
      name: "phaopanya-route-desk",
      partialize: (s) => ({
        policy: s.policy,
        trips: s.trips,
        savedRoutes: s.savedRoutes,
        activeTripId: s.activeTripId,
        chat: s.chat.slice(-20),
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function useActiveTrip() {
  return useDesk((s) => s.trips.find((t) => t.id === s.activeTripId) ?? s.trips[0] ?? null);
}

/** เปลี่ยนจุดพักถัดไป (จุดพักแรกที่ยังไม่ถึง) เป็นจุดใหม่ แล้วเลื่อนเวลาช่วงหลังให้สอดคล้อง */
function applyRestReplacement(trip: Trip, policy: Policy, newRest: RestStop): Trip {
  const nowIso = new Date().toISOString();
  const stops = [...trip.plan.stops];
  const idx = stops.findIndex((s) => s.type === "rest" && s.start > nowIso);
  if (idx < 0) return trip;

  const oldRest = stops[idx]!;
  const prevDrive = stops[idx - 1];
  const fromPlace = idx >= 2 ? stops[idx - 2]!.place : trip.origin;

  // ประมาณการขับไปจุดพักใหม่จากระยะทางตรง × 1.3 (คูณเผื่อถนนโค้ง)
  const roadKm = haversineKm(fromPlace, newRest) * 1.3;
  const newDriveMin = Math.max(5, (roadKm / Math.max(30, policy.avgHighwayKmh)) * 60);
  const oldDriveMin = prevDrive?.driveMin ?? 0;
  const deltaMin = newDriveMin + policy.restMin - (oldDriveMin + oldRest.restMin);

  if (prevDrive) {
    stops[idx - 1] = {
      ...prevDrive,
      title: `ขับ (ประมาณการ) → ${newRest.name}`,
      distanceKm: roadKm,
      driveMin: newDriveMin,
      confidence: "estimated",
      note: "ระยะประมาณการหลังเปลี่ยนจุดพัก ณ เวลาที่ยืนยัน",
    };
  }

  const driveEnd = prevDrive
    ? addMinutes(new Date(stops[idx - 1]!.start), newDriveMin).toISOString()
    : oldRest.start;
  const restEnd = addMinutes(new Date(driveEnd), policy.restMin).toISOString();
  stops[idx] = {
    ...oldRest,
    title: `พัก ${policy.restMin} นาที · ${newRest.name}`,
    place: { ...newRest, kind: "rest" },
    start: driveEnd,
    end: restEnd,
    note: `เปลี่ยนจุดพักจาก ${oldRest.place.name} — ตัวเลขหลังจากนี้เป็นประมาณการ`,
    confidence: newRest.verification === "routed" ? "routed" : "must-verify",
    onRoute: true,
  };

  let prevEnd = restEnd;
  for (let j = idx + 1; j < stops.length; j++) {
    const s = stops[j]!;
    // คงความยาวช่วงเดิมไว้ (วัดจาก start/end เดิม) แล้วเลื่อนเวลาตามจุดพักใหม่
    const dur = (new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000;
    const start = prevEnd;
    const end = addMinutes(new Date(start), dur).toISOString();
    stops[j] = { ...s, start, end };
    prevEnd = end;
  }

  const plan: PlanResult = {
    ...trip.plan,
    stops,
    totalDistanceKm: stops.reduce((sum, x) => sum + x.distanceKm, 0),
    totalDriveMin: stops.reduce((sum, x) => sum + x.driveMin, 0),
    eta: stops[stops.length - 1]?.end ?? trip.plan.eta,
    risk: "watch",
    riskNote: "เปลี่ยนจุดพักกลางทางแล้ว — ตัวเลขช่วงหลังเป็นประมาณการ ควรยืนยันจุดพักจริงอีกครั้ง",
  };

  return {
    ...trip,
    plan,
    delayMin: trip.delayMin + Math.max(0, deltaMin),
    events: [
      event(
        "replan",
        `เปลี่ยนจุดพักเป็น ${newRest.name} (เดิม: ${oldRest.place.name})`,
        Math.max(0, Math.round(deltaMin)),
      ),
      ...trip.events,
    ],
  };
}
