import { addMinutes } from "@/lib/format";
import { REST_STOPS } from "@/lib/data/rest-stops";
import {
  haversineKm,
  nearestOnPolyline,
  pointAlongPolyline,
  polylineLengthKm,
} from "./geo";
import type {
  Confidence,
  Place,
  PlanResult,
  PlanStop,
  PlanStopType,
  Policy,
  RestStop,
  RiskLevel,
  RouteLeg,
} from "./types";

export type PlanInput = {
  origin: Place;
  waypoints: Place[];
  destination: Place;
  startTime: Date;
  policy: Policy;
  legs: RouteLeg[];
  restStops?: RestStop[];
  continuousMin?: number;
  delayMin?: number;
};

type Cursor = {
  clock: Date;
  continuous: number;
  seq: number;
};

function clonePlace(p: Place, kind?: Place["kind"]): Place {
  return { ...p, kind: kind ?? p.kind };
}

function riskRank(r: RiskLevel) {
  const order: RiskLevel[] = ["normal", "watch", "act", "insufficient", "infeasible"];
  return order.indexOf(r);
}

function worstRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return riskRank(b) > riskRank(a) ? b : a;
}

function remaining(policy: Policy, continuous: number) {
  return Math.max(0, policy.maxContinuousMin - continuous);
}

function pushStop(
  stops: PlanStop[],
  cursor: Cursor,
  partial: Omit<PlanStop, "seq" | "start" | "end"> & {
    type: PlanStopType;
    durationMin: number;
  },
) {
  const start = cursor.clock;
  const end = addMinutes(start, partial.durationMin);
  stops.push({
    seq: cursor.seq++,
    start: start.toISOString(),
    end: end.toISOString(),
    title: partial.title,
    type: partial.type,
    place: partial.place,
    distanceKm: partial.distanceKm,
    driveMin: partial.driveMin,
    restMin: partial.restMin,
    serviceMin: partial.serviceMin,
    delayMin: partial.delayMin,
    continuousAfterMin: partial.continuousAfterMin,
    remainingBeforeRestMin: partial.remainingBeforeRestMin,
    note: partial.note,
    confidence: partial.confidence,
    onRoute: partial.onRoute,
  });
  cursor.clock = end;
}

function sliceGeometry(
  geometry: [number, number][],
  fromFrac: number,
  toFrac: number,
): [number, number][] {
  if (geometry.length < 2) return geometry;
  const a = pointAlongPolyline(geometry, fromFrac);
  const b = pointAlongPolyline(geometry, toFrac);
  const mid: [number, number][] = [];
  const total = polylineLengthKm(geometry);
  let walked = 0;
  for (let i = 1; i < geometry.length; i++) {
    const p = geometry[i]!;
    const prev = geometry[i - 1]!;
    walked += haversineKm({ lat: prev[0], lng: prev[1] }, { lat: p[0], lng: p[1] });
    const f = total === 0 ? 0 : walked / total;
    if (f > fromFrac && f < toFrac) mid.push(p);
  }
  return [a, ...mid, b];
}

function pickRestAlongLeg(
  leg: RouteLeg,
  fromFrac: number,
  targetFrac: number,
  restStops: RestStop[],
  vehicleNeedsTruck: boolean,
): { stop: RestStop; frac: number; detourKm: number } | null {
  const windowLow = Math.min(fromFrac, targetFrac);
  const windowHigh = Math.max(fromFrac, targetFrac);
  let best: { stop: RestStop; frac: number; detourKm: number; score: number } | null = null;
  for (const stop of restStops) {
    if (vehicleNeedsTruck && !stop.truckOk) continue;
    const proj = nearestOnPolyline(leg.geometry, stop);
    if (proj.distKm > 12) continue;
    if (proj.fraction < windowLow - 0.02 || proj.fraction > windowHigh + 0.02) continue;
    const detour = proj.distKm;
    const closenessToTarget = Math.abs(proj.fraction - targetFrac);
    const score = detour * 4 + closenessToTarget * 30;
    if (!best || score < best.score) {
      best = { stop, frac: Math.min(Math.max(proj.fraction, fromFrac), targetFrac), detourKm: detour, score };
    }
  }
  return best ? { stop: best.stop, frac: best.frac, detourKm: best.detourKm } : null;
}

function unverifiedRest(
  coord: [number, number],
  label: string,
): RestStop {
  return {
    id: `unverified-${coord[0].toFixed(3)}-${coord[1].toFixed(3)}`,
    name: label,
    lat: coord[0],
    lng: coord[1],
    truckOk: false,
    facilities: [],
    verification: "unverified",
    note: "ยังไม่มีจุดพักที่ยืนยันได้ที่พิกัดนี้ — ต้องให้คนขับหาที่ปลอดภัย",
    kind: "rest",
  };
}

function driveChunk(
  stops: PlanStop[],
  cursor: Cursor,
  policy: Policy,
  from: Place,
  to: Place,
  driveMin: number,
  distanceKm: number,
  confidence: Confidence,
  note: string,
) {
  cursor.continuous += driveMin;
  pushStop(stops, cursor, {
    type: "drive",
    title: `ขับ ${from.name} → ${to.name}`,
    place: clonePlace(to),
    durationMin: driveMin,
    distanceKm,
    driveMin,
    restMin: 0,
    serviceMin: 0,
    delayMin: 0,
    continuousAfterMin: cursor.continuous,
    remainingBeforeRestMin: remaining(policy, cursor.continuous),
    note,
    confidence,
    onRoute: true,
  });
}

function insertRest(
  stops: PlanStop[],
  cursor: Cursor,
  policy: Policy,
  rest: RestStop,
  note: string,
) {
  const confidence: Confidence = rest.verification === "unverified" ? "unverified" : "must-verify";
  pushStop(stops, cursor, {
    type: "rest",
    title: `พัก ${policy.restMin} นาที · ${rest.name}`,
    place: { ...rest, kind: "rest" },
    durationMin: policy.restMin,
    distanceKm: 0,
    driveMin: 0,
    restMin: policy.restMin,
    serviceMin: 0,
    delayMin: 0,
    continuousAfterMin: policy.restResetsDriving ? 0 : cursor.continuous,
    remainingBeforeRestMin: policy.restResetsDriving
      ? policy.maxContinuousMin
      : remaining(policy, cursor.continuous),
    note,
    confidence,
    onRoute: rest.verification !== "unverified",
  });
  if (policy.restResetsDriving) cursor.continuous = 0;
}

function traverseLeg(
  stops: PlanStop[],
  cursor: Cursor,
  policy: Policy,
  from: Place,
  to: Place,
  leg: RouteLeg,
  restStops: RestStop[],
  risk: { current: RiskLevel; notes: string[] },
  delayMin: number,
) {
  const duration = leg.durationMin + (delayMin > 0 ? delayMin : 0);
  const distance = leg.distanceKm;
  let frac = 0;
  let remainMin = duration;
  let remainKm = distance;
  const truck = policy.vehicleType !== "6-wheel";

  if (delayMin > 0) {
    pushStop(stops, cursor, {
      type: "delay",
      title: `ความล่าช้า ${delayMin} นาที`,
      place: clonePlace(from),
      durationMin: 0,
      distanceKm: 0,
      driveMin: 0,
      restMin: 0,
      serviceMin: 0,
      delayMin,
      continuousAfterMin: cursor.continuous,
      remainingBeforeRestMin: remaining(policy, cursor.continuous),
      note: "ความล่าช้าถูกรวมในเวลาขับช่วงนี้แล้ว — รถติดไม่นับเป็นพัก",
      confidence: "estimated",
      onRoute: true,
    });
  }

  while (remainMin > 0.6) {
    const left = remaining(policy, cursor.continuous);
    const comfortable = left - policy.bufferMin;

    if (remainMin <= left) {
      const endIsRealStop = true;
      const fitsComfortably = remainMin <= Math.max(0, comfortable);
      if (fitsComfortably || endIsRealStop) {
        driveChunk(
          stops,
          cursor,
          policy,
          from,
          to,
          remainMin,
          remainKm,
          leg.source,
          fitsComfortably
            ? "ช่วงนี้ถึงจุดหมายก่อนขีดจำกัดพร้อมระยะเผื่อ"
            : `ถึงจุดหมายได้ก่อนครบ ${policy.maxContinuousMin / 60} ชม. แต่เข้าช่วงระยะเผื่อ ${policy.bufferMin} นาที`,
        );
        if (!fitsComfortably) {
          risk.current = worstRisk(risk.current, "watch");
          risk.notes.push(`ช่วงเข้า ${to.name} อยู่ในระยะเผื่อ — อย่าต่อช่วงถัดไปโดยไม่พัก`);
        }
        remainMin = 0;
        remainKm = 0;
        break;
      }
    }

    if (left <= 8) {
      risk.current = worstRisk(risk.current, "act");
      const here = pointAlongPolyline(leg.geometry, frac);
      const emergency = unverifiedRest(here, "จุดปลอดภัยใกล้ตำแหน่งปัจจุบัน");
      insertRest(
        stops,
        cursor,
        policy,
        emergency,
        "เวลาขับเหลือไม่พอไปต่อ — ต้องจอดในที่ปลอดภัยทันที ห้ามเร่งไปจุดพักเดิม",
      );
      continue;
    }

    const hardCap = Math.max(8, left - 5);
    const targetDrive = Math.min(
      remainMin * 0.92,
      Math.min(hardCap, Math.max(12, left - policy.bufferMin)),
    );
    const targetFrac = frac + (duration <= 0 ? 0 : (targetDrive / duration) * (1 - frac) || 0.15);

    const picked = pickRestAlongLeg(leg, frac, targetFrac, restStops, truck);
    let restPlace: RestStop;
    let usedFrac = targetFrac;
    let extra = "";

    if (picked) {
      restPlace = picked.stop;
      usedFrac = Math.max(frac + 0.01, picked.frac);
      extra =
        picked.detourKm > 3
          ? `เบี่ยงประมาณ ${picked.detourKm.toFixed(1)} กม. จากเส้นทาง · ${restPlace.note ?? "ต้องตรวจว่ารถเข้าจอดได้"}`
          : restPlace.note ?? "จุดจากคลังทางหลวง — ต้องตรวจสอบก่อนใช้จริง";
      if (restPlace.verification !== "routed") {
        risk.current = worstRisk(risk.current, "watch");
      }
    } else {
      const coord = pointAlongPolyline(leg.geometry, targetFrac);
      restPlace = unverifiedRest(coord, "จุดพักตามเส้นทาง (ยังไม่ยืนยันสถานที่)");
      extra = "ไม่พบจุดพักในคลังที่อยู่ในระยะ — ห้ามยืนยันว่ามีลานจอดจริง";
      risk.current = worstRisk(risk.current, "act");
      risk.notes.push("ไม่มีจุดพักที่ยืนยันได้ในช่วงเวลาที่ปลอดภัย");
    }

    const usedRatio = Math.max(0, usedFrac - frac);
    const chunkMin = duration * usedRatio;
    const chunkKm = distance * usedRatio;
    if (chunkMin > 0.4) {
      driveChunk(
        stops,
        cursor,
        policy,
        from,
        restPlace,
        chunkMin,
        chunkKm,
        picked ? "must-verify" : "unverified",
        `แทรกจุดพักก่อนครบ ${policy.maxContinuousMin / 60} ชม. (เผื่อ ${policy.bufferMin} นาที)`,
      );
    }
    insertRest(stops, cursor, policy, restPlace, extra);
    const nextFrac = Math.max(frac + 0.04, usedFrac);
    frac = Math.min(0.98, nextFrac);
    remainMin = duration * (1 - frac);
    remainKm = distance * (1 - frac);
    from = restPlace;
    if (stops.length > 80) {
      risk.current = worstRisk(risk.current, "infeasible");
      risk.notes.push("แผนยาวผิดปกติ — หยุดคำนวณ");
      break;
    }

  }
}

export function planTrip(input: PlanInput): PlanResult {
  const policy = input.policy;
  const restStops = input.restStops ?? REST_STOPS;
  const nodes = [input.origin, ...input.waypoints, input.destination];
  const stops: PlanStop[] = [];
  const cursor: Cursor = {
    clock: new Date(input.startTime),
    continuous: input.continuousMin ?? 0,
    seq: 1,
  };
  const risk = { current: "normal" as RiskLevel, notes: [] as string[] };
  const source: Confidence = input.legs.every((l) => l.source === "routed")
    ? "routed"
    : "estimated";

  pushStop(stops, cursor, {
    type: "depart",
    title: `ออกจาก ${input.origin.name}`,
    place: clonePlace(input.origin, "origin"),
    durationMin: 0,
    distanceKm: 0,
    driveMin: 0,
    restMin: 0,
    serviceMin: 0,
    delayMin: 0,
    continuousAfterMin: cursor.continuous,
    remainingBeforeRestMin: remaining(policy, cursor.continuous),
    note: cursor.continuous > 0 ? `เริ่มด้วยเวลาขับสะสม ${cursor.continuous} นาที` : "เริ่มนับเวลาขับต่อเนื่องจาก 0",
    confidence: source,
    onRoute: true,
  });

  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i]!;
    const to = nodes[i + 1]!;
    const leg =
      input.legs[i] ??
      fallbackLeg(from, to, policy);

    const delayForLeg = i === 0 ? input.delayMin ?? 0 : 0;
    traverseLeg(stops, cursor, policy, from, to, leg, restStops, risk, delayForLeg);

    const isLast = i === nodes.length - 2;
    if (isLast) {
      pushStop(stops, cursor, {
        type: "arrive",
        title: `ถึงปลายทาง ${to.name}`,
        place: clonePlace(to, "destination"),
        durationMin: 0,
        distanceKm: 0,
        driveMin: 0,
        restMin: 0,
        serviceMin: 0,
        delayMin: 0,
        continuousAfterMin: cursor.continuous,
        remainingBeforeRestMin: remaining(policy, cursor.continuous),
        note: "สิ้นสุดภารกิจ — ตรวจเวลาขับสะสมก่อนรับงานต่อ",
        confidence: source,
        onRoute: true,
      });
    } else {
      pushStop(stops, cursor, {
        type: "waypoint",
        title: `ส่งของ · ${to.name}`,
        place: clonePlace(to, "waypoint"),
        durationMin: policy.serviceMin,
        distanceKm: 0,
        driveMin: 0,
        restMin: 0,
        serviceMin: policy.serviceMin,
        delayMin: 0,
        continuousAfterMin: cursor.continuous,
        remainingBeforeRestMin: remaining(policy, cursor.continuous),
        note: `เวลาขนถ่าย ${policy.serviceMin} นาที ไม่นับเป็นเวลาขับรถ และไม่นับเป็นพักตามกฎ`,
        confidence: "estimated",
        onRoute: true,
      });

      const next = nodes[i + 2];
      const nextLeg = input.legs[i + 1];
      if (next && nextLeg) {
        const left = remaining(policy, cursor.continuous);
        if (nextLeg.durationMin > left - policy.bufferMin) {
          const nearby = pickRestAlongLeg(
            { ...nextLeg, geometry: [[to.lat, to.lng], [to.lat, to.lng]] },
            0,
            1,
            restStops.filter((s) => haversineKm(s, to) < 8),
            policy.vehicleType !== "6-wheel",
          );
          const restAt =
            nearby?.stop ??
            restStops
              .filter((s) => haversineKm(s, to) < 10)
              .sort((a, b) => haversineKm(a, to) - haversineKm(b, to))[0] ??
            ({
              ...to,
              truckOk: true,
              facilities: ["ที่จอดจุดส่ง"],
              verification: "must-verify" as const,
              note: "พักที่จุดแวะเพราะช่วงถัดไปยาวเกินเวลาที่เหลือ",
              kind: "rest" as const,
            } satisfies RestStop);
          insertRest(
            stops,
            cursor,
            policy,
            restAt,
            `ช่วงถัดไปไป ${next.name} ใช้ประมาณ ${Math.round(nextLeg.durationMin)} นาที แต่เหลือเวลาขับ ${Math.round(left)} นาที — พักที่จุดแวะก่อนออก`,
          );
          risk.current = worstRisk(risk.current, "watch");
        }
      }
    }
  }

  const totalDistanceKm = stops.reduce((s, x) => s + x.distanceKm, 0);
  const totalDriveMin = stops.reduce((s, x) => s + x.driveMin, 0);
  const totalRestMin = stops.reduce((s, x) => s + x.restMin, 0);
  const totalServiceMin = stops.reduce((s, x) => s + x.serviceMin, 0);
  const totalDelayMin = stops.reduce((s, x) => s + x.delayMin, 0);
  const restCount = stops.filter((s) => s.type === "rest").length;
  const unverifiedRestCount = stops.filter(
    (s) => s.type === "rest" && (s.confidence === "unverified" || s.confidence === "must-verify"),
  ).length;

  if (unverifiedRestCount > 0) {
    risk.current = worstRisk(risk.current, "watch");
    risk.notes.push("มีจุดพักที่ยังต้องตรวจสอบสถานที่จริง");
  }
  if (input.legs.length === 0) {
    risk.current = worstRisk(risk.current, "insufficient");
    risk.notes.push("ใช้ระยะทางประมาณ ไม่มีเส้นทางจากบริการแผนที่");
  }

  const eta = stops[stops.length - 1]?.end ?? input.startTime.toISOString();
  const riskNote =
    risk.notes[0] ??
    (risk.current === "normal"
      ? "แผนอยู่ในกรอบ 4 ชั่วโมง/พัก 30 นาที ตามนโยบายที่ตั้งไว้"
      : "ตรวจจุดพักและความล่าช้าก่อนออกเดินทาง");

  return {
    stops,
    totalDistanceKm,
    totalDriveMin,
    totalRestMin,
    totalServiceMin,
    totalDelayMin,
    eta,
    risk: risk.current,
    riskNote,
    restCount,
    unverifiedRestCount,
    source,
  };
}

export function fallbackLeg(from: Place, to: Place, policy: Policy): RouteLeg {
  const via = corridorVia(from, to);
  const geometry: [number, number][] = [
    [from.lat, from.lng],
    ...via.map((p) => [p.lat, p.lng] as [number, number]),
    [to.lat, to.lng],
  ];
  const distanceKm = polylineLengthKm(geometry);
  const durationMin = (distanceKm / Math.max(30, policy.avgHighwayKmh)) * 60;
  return {
    fromId: from.id,
    toId: to.id,
    distanceKm,
    durationMin,
    geometry,
    source: "estimated",
  };
}

function corridorVia(from: Place, to: Place): Place[] {
  const north = to.lat > 16 && from.lat < 16;
  const south = to.lat < 10 && from.lat > 12;
  if (north) {
    return [
      { id: "v-saraburi", name: "สระบุรี", lat: 14.529, lng: 100.91 },
      { id: "v-lopburi", name: "ลพบุรี", lat: 14.8, lng: 100.653 },
      { id: "v-ns", name: "นครสวรรค์", lat: 15.694, lng: 100.123 },
      { id: "v-kps", name: "กำแพงเพชร", lat: 16.483, lng: 99.522 },
      { id: "v-tak", name: "ตาก", lat: 16.884, lng: 99.126 },
      { id: "v-thoen", name: "เถิน", lat: 17.889, lng: 99.216 },
      { id: "v-lampang", name: "ลำปาง", lat: 18.288, lng: 99.491 },
    ].filter((p) => p.lat > from.lat + 0.15 && p.lat < to.lat - 0.15);
  }
  if (south) {
    return [
      { id: "v-phet", name: "เพชรบุรี", lat: 13.111, lng: 99.939 },
      { id: "v-prachuap", name: "ประจวบ", lat: 11.81, lng: 99.797 },
      { id: "v-chumpon", name: "ชุมพร", lat: 10.496, lng: 99.18 },
      { id: "v-surat", name: "สุราษฎร์", lat: 9.138, lng: 99.333 },
    ].filter((p) => p.lat < from.lat - 0.2 && p.lat > to.lat + 0.2);
  }
  return [];
}

export function buildFallbackLegs(
  origin: Place,
  waypoints: Place[],
  destination: Place,
  policy: Policy,
) {
  const nodes = [origin, ...waypoints, destination];
  const legs: RouteLeg[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    legs.push(fallbackLeg(nodes[i]!, nodes[i + 1]!, policy));
  }
  return legs;
}

export function summarizeRisk(plan: PlanResult): { label: string; detail: string } {
  switch (plan.risk) {
    case "normal":
      return { label: "ปกติ", detail: plan.riskNote };
    case "watch":
      return { label: "เฝ้าระวัง", detail: plan.riskNote };
    case "act":
      return { label: "ต้องจัดการทันที", detail: plan.riskNote };
    case "insufficient":
      return { label: "ข้อมูลไม่เพียงพอ", detail: plan.riskNote };
    case "infeasible":
      return { label: "ยืนยันความเป็นไปไม่ได้", detail: plan.riskNote };
  }
}
