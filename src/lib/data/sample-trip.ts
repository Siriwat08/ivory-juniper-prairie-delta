import { placeById } from "./places";
import { buildFallbackLegs, planTrip } from "@/lib/engine/rest-engine";
import type { Policy, Trip } from "@/lib/engine/types";

export function seedSampleTrip(policy: Policy): Trip {
  const origin = placeById("scgjwd-wangnoi")!;
  const waypoint = placeById("nakhonsawan")!;
  const destination = placeById("chiangmai")!;
  const startTime = defaultStartIso();
  const legs = buildFallbackLegs(origin, [waypoint], destination, policy);
  const plan = planTrip({
    origin,
    waypoints: [waypoint],
    destination,
    startTime: new Date(startTime),
    policy,
    legs,
  });
  return {
    id: "trip-sample-north",
    code: "PP-SCG-NORTH-01",
    title: "วังน้อย → นครสวรรค์ → เชียงใหม่",
    client: "SCGJWD",
    createdAt: new Date().toISOString(),
    origin,
    waypoints: [waypoint],
    destination,
    startTime,
    status: "planned",
    vehicleType: policy.vehicleType,
    plan,
    events: [
      {
        id: "ev-seed",
        type: "planned",
        at: new Date().toISOString(),
        label: "แผนตัวอย่างงาน SCGJWD สายเหนือ",
      },
    ],
    continuousMin: 0,
    clock: startTime,
    currentStopSeq: 1,
    delayMin: 0,
    policySnapshot: policy,
  };
}

function defaultStartIso() {
  const now = new Date();
  const bkk = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  bkk.setHours(6, 0, 0, 0);
  if (new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" })).getHours() >= 18) {
    bkk.setDate(bkk.getDate() + 1);
  }
  const y = bkk.getFullYear();
  const m = String(bkk.getMonth() + 1).padStart(2, "0");
  const d = String(bkk.getDate()).padStart(2, "0");
  return new Date(`${y}-${m}-${d}T06:00:00+07:00`).toISOString();
}
