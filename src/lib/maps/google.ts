import { createServerFn } from "@tanstack/react-start";
import { env } from "@/lib/env.server";
import { decodePolyline } from "@/lib/maps/polyline";
import type { Place } from "@/lib/engine/types";

/* ============================================================
 * Google Maps Platform — ทางเซิร์ฟเวอร์ (key ไม่โผล่ในเบราว์เซอร์)
 * - Routes API (New)   : คำนวณเวลาถึงแบบใช้ข้อมูลรถติดจริง (TRAFFIC_AWARE)
 * - Places API (New)   : ค้นหาจุดพักจริงใกล้เส้นทาง (ปั๊มน้ำมัน/ร้านค้า)
 *
 * ใช้ key จาก 2 ทาง (เลือกอย่างใดอย่างหนึ่งหรือทั้งคู่):
 * 1) env GOOGLE_MAPS_API_KEY บนเซิร์ฟเวอร์ (แนะนำ — ใช้ร่วมทุกเครื่อง)
 * 2) คนขับกรอกในหน้าตั้งค่าของแอป (เก็บในเครื่องนั้น)
 * ============================================================ */

type LatLng = { lat: number; lng: number };

function resolveKey(clientKey?: string): string | undefined {
  return env("GOOGLE_MAPS_API_KEY") || clientKey?.trim() || undefined;
}

function readableGoogleError(status: number, body: unknown): string {
  const message =
    body && typeof body === "object" && "error" in body
      ? String((body as { error?: { message?: string } }).error?.message ?? "")
      : "";
  if (status === 400 && /API key not valid/i.test(message)) {
    return "API key ไม่ถูกต้อง — ตรวจสอบ key อีกครั้ง";
  }
  if (status === 403 || /PERMISSION_DENIED/i.test(message)) {
    return "API ยังไม่ได้เปิดใช้ — ไปที่ Google Cloud Console แล้วเปิด \"Routes API\" และ \"Places API (New)\" สำหรับ key นี้";
  }
  if (status === 429) return "ใช้งานเกินโควตา — ตรวจโควตาใน Google Cloud Console";
  return message || `Google API ตอบกลับ HTTP ${status}`;
}

/* ---------------- Routes API: ETA แบบใช้รถติดจริง ---------------- */

type GoogleRouteInput = {
  origin: LatLng;
  destination: LatLng;
  /** จุดแวะบังคับกลางทาง (ตามลำดับ) — ใช้เมื่อต้องการให้เส้นทางผ่านจุดพักแผนเดิม */
  intermediates?: LatLng[];
  /** key จากหน้าตั้งค่าของคนขับ (ถ้าไม่ส่งมาใช้ env GOOGLE_MAPS_API_KEY) */
  apiKey?: string;
};

type GoogleRouteOutput =
  | { ok: true; distanceKm: number; durationMin: number; noTrafficMin: number }
  | { ok: false; error: string };

/**
 * เวลาเดินทางจากตำแหน่งรถ → จุดหมาย โดยใช้ข้อมูลรถติดจริงของ Google
 * durationMin = เวลาตามสภาพจราจรปัจจุบัน / noTrafficMin = เวลาโดยไม่มีรถติด
 */
export const googleRouteEta = createServerFn({ method: "POST" })
  .validator((input: GoogleRouteInput) => input)
  .handler(async ({ data }): Promise<GoogleRouteOutput> => {
    const key = resolveKey(data.apiKey);
    if (!key) return { ok: false, error: "ยังไม่ได้ตั้งค่า Google Maps API key" };
    const body = {
      origin: { location: { latLng: { latitude: data.origin.lat, longitude: data.origin.lng } } },
      destination: {
        location: { latLng: { latitude: data.destination.lat, longitude: data.destination.lng } },
      },
      ...(data.intermediates && data.intermediates.length > 0
        ? {
            intermediates: data.intermediates.map((p) => ({
              location: { latLng: { latitude: p.lat, longitude: p.lng } },
            })),
          }
        : {}),
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      languageCode: "th",
      units: "METRIC",
    };
    try {
      const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "routes.duration,routes.staticDuration,routes.distanceMeters,routes.legs.duration,routes.legs.staticDuration,routes.legs.distanceMeters",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) return { ok: false, error: readableGoogleError(res.status, json) };
      const routes = (json as { routes?: { duration?: string; staticDuration?: string; distanceMeters?: number }[] })
        ?.routes;
      const route = routes?.[0];
      if (!route?.duration || route.distanceMeters == null) {
        return { ok: false, error: "ไม่ได้รับเส้นทางจาก Google Routes API" };
      }
      const parseSec = (s?: string) => (s ? Number(s.replace(/s$/, "")) : NaN);
      const durationMin = parseSec(route.duration) / 60;
      const noTrafficMin = (parseSec(route.staticDuration) || durationMin) / 60;
      if (!Number.isFinite(durationMin)) {
        return { ok: false, error: "อ่านเวลาเดินทางจาก Google ไม่ได้" };
      }
      return {
        ok: true,
        distanceKm: route.distanceMeters / 1000,
        durationMin,
        noTrafficMin: Number.isFinite(noTrafficMin) ? noTrafficMin : durationMin,
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "เรียก Google Routes API ไม่สำเร็จ" };
    }
  });

/* ---------------- Routes API: เส้นทางเต็มแบบใช้รถติดจริง (ตอนคำนวณแผน) ---------------- */

type GoogleLegsInput = {
  /** จุดตามลำดับ: ต้นทาง → จุดแวะ... → ปลายทาง (>= 2 จุด) */
  nodes: Place[];
  apiKey?: string;
};

export type GoogleLeg = {
  distanceKm: number;
  /** เวลาตามสภาพจราจรปัจจุบัน (TRAFFIC_AWARE) */
  durationMin: number;
  /** เวลาโดยไม่คิดรถติด (staticDuration) — ใช้คิด trafficDelay */
  noTrafficMin: number;
  geometry: [number, number][];
};

type GoogleLegsOutput =
  | { ok: true; legs: GoogleLeg[]; calculatedAt: string }
  | { ok: false; error: string };

/**
 * คำนวณเส้นทางเต็มแยกช่วงด้วย Google Routes API (TRAFFIC_AWARE) ณ เวลาที่เรียก
 * ใช้ตอน "คำนวณเส้นทาง" ครั้งเดียวต่อเที่ยว — ไม่เรียกซ้ำระหว่าง render
 * เรียกไม่สำเร็จให้ผู้เรียก fallback ไป OSRM → ประมาณการตามลำดับ
 */
export const googleRouteLegs = createServerFn({ method: "POST" })
  .validator((input: GoogleLegsInput) => input)
  .handler(async ({ data }): Promise<GoogleLegsOutput> => {
    const key = resolveKey(data.apiKey);
    if (!key) return { ok: false, error: "ยังไม่ได้ตั้งค่า Google Maps API key" };
    const nodes = data.nodes;
    if (nodes.length < 2) return { ok: false, error: "จุดต้นทาง-ปลายทางไม่ครบ" };

    const latLng = (p: Place) => ({
      location: { latLng: { latitude: p.lat, longitude: p.lng } },
    });
    const body = {
      origin: latLng(nodes[0]!),
      destination: latLng(nodes[nodes.length - 1]!),
      ...(nodes.length > 2
        ? { intermediates: nodes.slice(1, -1).map(latLng) }
        : {}),
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      languageCode: "th",
      units: "METRIC",
    };
    try {
      const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "routes.legs.distanceMeters,routes.legs.duration,routes.legs.staticDuration,routes.legs.polyline.encodedPolyline",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(12000),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) return { ok: false, error: readableGoogleError(res.status, json) };
      const legs = (
        json as {
          routes?: {
            legs?: {
              distanceMeters?: number;
              duration?: string;
              staticDuration?: string;
              polyline?: { encodedPolyline?: string };
            }[];
          }[];
        }
      )?.routes?.[0]?.legs;
      if (!legs || legs.length !== nodes.length - 1) {
        return {
          ok: false,
          error: "โครงสร้างเส้นทางจาก Google ไม่ตรงกับจุดแวะ — เปลี่ยนไปใช้ OSRM แทน",
        };
      }
      const parseSec = (s?: string) => (s ? Number(s.replace(/s$/, "")) : NaN);
      const out: GoogleLeg[] = [];
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i]!;
        const durationMin = parseSec(leg.duration) / 60;
        const noTrafficMin = (parseSec(leg.staticDuration) || durationMin) / 60;
        if (!Number.isFinite(durationMin) || leg.distanceMeters == null) {
          return { ok: false, error: "อ่านระยะทาง/เวลาจาก Google ไม่ได้" };
        }
        const geometry = leg.polyline?.encodedPolyline
          ? decodePolyline(leg.polyline.encodedPolyline)
          : [
              [nodes[i]!.lat, nodes[i]!.lng],
              [nodes[i + 1]!.lat, nodes[i + 1]!.lng],
            ] as [number, number][];
        out.push({
          distanceKm: leg.distanceMeters / 1000,
          durationMin,
          noTrafficMin: Number.isFinite(noTrafficMin) ? noTrafficMin : durationMin,
          geometry: geometry.length >= 2 ? geometry : [
            [nodes[i]!.lat, nodes[i]!.lng],
            [nodes[i + 1]!.lat, nodes[i + 1]!.lng],
          ],
        });
      }
      return { ok: true, legs: out, calculatedAt: new Date().toISOString() };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "เรียก Google Routes API ไม่สำเร็จ",
      };
    }
  });

/* ---------------- Places API (New): จุดพักจริงใกล้พิกัด ---------------- */

export type GooglePlaceStop = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  openNow: boolean | null;
};

type GoogleStopsInput = {
  lat: number;
  lng: number;
  /** รัศมีค้นหา (เมตร) สูงสุด 50,000 */
  radiusM?: number;
  /** ประเภทสถานที่ตาม Places API (New) — ค่าเริ่มต้นคือปั๊มน้ำมัน */
  includedTypes?: string[];
  apiKey?: string;
};

type GoogleStopsOutput =
  | { ok: true; stops: GooglePlaceStop[] }
  | { ok: false; error: string };

const DEFAULT_TYPES = ["gas_station"];

/**
 * ค้นหาจุดพักจริง (ปั๊มน้ำมัน ฯลฯ) รอบพิกัดหนึ่ง ๆ — ใช้เสนอเป็นจุดพักแนะนำ
 * เมื่อรถติดจนไปไม่ถึงจุดพักเดิม
 */
export const googleRestStops = createServerFn({ method: "POST" })
  .validator((input: GoogleStopsInput) => input)
  .handler(async ({ data }): Promise<GoogleStopsOutput> => {
    const key = resolveKey(data.apiKey);
    if (!key) return { ok: false, error: "ยังไม่ได้ตั้งค่า Google Maps API key" };
    const radius = Math.min(50000, Math.max(500, data.radiusM ?? 10000));
    const body = {
      includedTypes: data.includedTypes?.length ? data.includedTypes : DEFAULT_TYPES,
      maxResultCount: 20,
      locationRestriction: {
        circle: { center: { latitude: data.lat, longitude: data.lng }, radius },
      },
    };
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours.openNow",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) return { ok: false, error: readableGoogleError(res.status, json) };
      const places = (json as { places?: {
        id?: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        location?: { latitude?: number; longitude?: number };
        rating?: number;
        currentOpeningHours?: { openNow?: boolean };
      }[] })?.places;
      const stops: GooglePlaceStop[] = (places ?? [])
        .filter(
          (p) =>
            p.id &&
            p.location?.latitude != null &&
            p.location?.longitude != null,
        )
        .map((p) => ({
          id: p.id!,
          name: p.displayName?.text ?? "สถานที่ไม่ระบุชื่อ",
          address: p.formattedAddress ?? "",
          lat: p.location!.latitude!,
          lng: p.location!.longitude!,
          rating: typeof p.rating === "number" ? p.rating : null,
          openNow: typeof p.currentOpeningHours?.openNow === "boolean" ? p.currentOpeningHours.openNow : null,
        }));
      return { ok: true, stops };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "เรียก Google Places API ไม่สำเร็จ" };
    }
  });

/** ปุ่มทดสอบในหน้าตั้งค่า: ค้นหาจุดพักรอบ ปตท. วังน้อย (ทล.1) เป็นตัวตรวจว่า key ใช้ได้ */
export const googleTestConnection = createServerFn({ method: "POST" })
  .validator((input: { apiKey?: string }) => input)
  .handler(async ({ data }) => {
    return googleRestStops({
      data: { lat: 14.251, lng: 100.731, radiusM: 5000, apiKey: data?.apiKey },
    });
  });

/** ตรวจว่าเซิร์ฟเวอร์ตั้ง env ที่จำเป็นไว้หรือยัง (ใช้ในหน้า "ความพร้อมใช้งานจริง") */
export const integrationEnvStatus = createServerFn({ method: "POST" }).handler(
  async () => ({
    googleEnvKey: Boolean(env("GOOGLE_MAPS_API_KEY")),
    telegramEnvToken: Boolean(env("TELEGRAM_BOT_TOKEN")),
    telegramEnvChat: Boolean(env("TELEGRAM_CHAT_ID")),
  }),
);
