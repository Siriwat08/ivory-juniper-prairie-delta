import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "./utils";
import { addMinutes } from "./format";
import { DEFAULT_POLICY, policyFromPartial } from "./engine/policy";
import { buildFallbackLegs, planTrip } from "./engine/rest-engine";
import type { Place, Policy, RouteLeg, Trip, TripEventType, VehicleType } from "./engine/types";
import { seedSampleTrip } from "./data/sample-trip";

type ChatTurn = { id: string; role: "user" | "assistant"; content: string };

type AppState = {
  policy: Policy;
  trips: Trip[];
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
  applyLegsAndPlan: (tripId: string, legs: RouteLeg[]) => void;
  setActive: (id: string | null) => void;
  pushEvent: (tripId: string, type: TripEventType, label: string, extraMin?: number) => void;
  startTrip: (tripId: string) => void;
  addDelay: (tripId: string, minutes: number) => void;
  startRest: (tripId: string) => void;
  finishRest: (tripId: string) => void;
  completeTrip: (tripId: string) => void;
  advanceClock: (tripId: string, minutes: number) => void;
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

export const useDesk = create<AppState>()(
  persist(
    (set, get) => ({
      policy: DEFAULT_POLICY,
      trips: [seedSampleTrip(DEFAULT_POLICY)],
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
          events: [event("planned", "สร้างแผนเดินทาง")],
          continuousMin: 0,
          clock: startTime,
          currentStopSeq: 1,
          delayMin: 0,
          policySnapshot: policy,
        };
        set({ trips: [trip, ...get().trips], activeTripId: trip.id });
        return trip;
      },
      applyLegsAndPlan: (tripId, legs) => {
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
            return { ...t, plan };
          }),
        });
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
        set({
          trips: get().trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  status: "enroute",
                  continuousMin: 0,
                  events: [event("depart", "เริ่มออกเดินทาง"), ...t.events],
                }
              : t,
          ),
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
          trips: get().trips.map((t) =>
            t.id === tripId
              ? {
                  ...t,
                  status: "resting",
                  events: [event("rest-start", "เริ่มพัก — ยังไม่รีเซ็ตเวลาขับจนกว่าจะครบ"), ...t.events],
                }
              : t,
          ),
        });
      },
      finishRest: (tripId) => {
        const policy = get().policy;
        set({
          trips: get().trips.map((t) => {
            if (t.id !== tripId) return t;
            const continuousMin = policy.restResetsDriving ? 0 : t.continuousMin;
            const clock = addMinutes(new Date(t.clock), policy.restMin).toISOString();
            return replan(
              {
                ...t,
                status: "enroute",
                delayMin: 0,
                events: [event("rest-done", `พักครบ ${policy.restMin} นาที — เริ่มรอบขับใหม่`), ...t.events],
              },
              policy,
              { continuousMin, delayMin: 0, clock },
            );
          }),
        });
      },
      completeTrip: (tripId) => {
        set({
          trips: get().trips.map((t) =>
            t.id === tripId
              ? { ...t, status: "completed", events: [event("arrive", "ถึงปลายทาง"), ...t.events] }
              : t,
          ),
        });
      },
      advanceClock: (tripId, minutes) => {
        const policy = get().policy;
        set({
          trips: get().trips.map((t) => {
            if (t.id !== tripId || t.status === "completed") return t;
            if (t.status === "resting") {
              const clock = addMinutes(new Date(t.clock), minutes).toISOString();
              return { ...t, clock, events: [event("progress", `จำลองเวลาพัก +${minutes} นาที`), ...t.events] };
            }
            const continuousMin = t.continuousMin + minutes;
            const clock = addMinutes(new Date(t.clock), minutes).toISOString();
            const over = continuousMin >= policy.maxContinuousMin;
            return {
              ...t,
              continuousMin,
              clock,
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
