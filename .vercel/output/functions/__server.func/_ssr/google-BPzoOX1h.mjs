import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/google-BPzoOX1h.js
function env(key) {
	return process.env[key]?.trim() || void 0;
}
/**
* ถอดรหัส Google Encoded Polyline Algorithm (precision 5)
* → อาร์เรย์ [lat, lng][] สำหรับวาดบน Leaflet และใช้ฉายตำแหน่ง GPS
* อ้างอิง: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
*/
function decodePolyline(encoded) {
	const points = [];
	let index = 0;
	let lat = 0;
	let lng = 0;
	const len = encoded.length;
	while (index < len) {
		let result = 0;
		let shift = 0;
		let b;
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 31) << shift;
			shift += 5;
		} while (b >= 32);
		lat += result & 1 ? ~(result >> 1) : result >> 1;
		result = 0;
		shift = 0;
		do {
			b = encoded.charCodeAt(index++) - 63;
			result |= (b & 31) << shift;
			shift += 5;
		} while (b >= 32);
		lng += result & 1 ? ~(result >> 1) : result >> 1;
		points.push([lat * 1e-5, lng * 1e-5]);
	}
	return points;
}
function resolveKey(clientKey) {
	return env("GOOGLE_MAPS_API_KEY") || clientKey?.trim() || void 0;
}
function readableGoogleError(status, body) {
	const message = body && typeof body === "object" && "error" in body ? String(body.error?.message ?? "") : "";
	if (status === 400 && /API key not valid/i.test(message)) return "API key ไม่ถูกต้อง — ตรวจสอบ key อีกครั้ง";
	if (status === 403 || /PERMISSION_DENIED/i.test(message)) return "API ยังไม่ได้เปิดใช้ — ไปที่ Google Cloud Console แล้วเปิด \"Routes API\" และ \"Places API (New)\" สำหรับ key นี้";
	if (status === 429) return "ใช้งานเกินโควตา — ตรวจโควตาใน Google Cloud Console";
	return message || `Google API ตอบกลับ HTTP ${status}`;
}
/**
* เวลาเดินทางจากตำแหน่งรถ → จุดหมาย โดยใช้ข้อมูลรถติดจริงของ Google
* durationMin = เวลาตามสภาพจราจรปัจจุบัน / noTrafficMin = เวลาโดยไม่มีรถติด
*/
var googleRouteEta_createServerFn_handler = createServerRpc({
	id: "d1042ebe7abc63b5bd2847affd55e0012ae132685d7eebf97474ebe70e3d8973",
	name: "googleRouteEta",
	filename: "src/lib/maps/google.ts"
}, (opts) => googleRouteEta.__executeServer(opts));
var googleRouteEta = createServerFn({ method: "POST" }).validator((input) => input).handler(googleRouteEta_createServerFn_handler, async ({ data }) => {
	const key = resolveKey(data.apiKey);
	if (!key) return {
		ok: false,
		error: "ยังไม่ได้ตั้งค่า Google Maps API key"
	};
	const body = {
		origin: { location: { latLng: {
			latitude: data.origin.lat,
			longitude: data.origin.lng
		} } },
		destination: { location: { latLng: {
			latitude: data.destination.lat,
			longitude: data.destination.lng
		} } },
		...data.intermediates && data.intermediates.length > 0 ? { intermediates: data.intermediates.map((p) => ({ location: { latLng: {
			latitude: p.lat,
			longitude: p.lng
		} } })) } : {},
		travelMode: "DRIVE",
		routingPreference: "TRAFFIC_AWARE",
		computeAlternativeRoutes: false,
		languageCode: "th",
		units: "METRIC"
	};
	try {
		const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": key,
				"X-Goog-FieldMask": "routes.duration,routes.staticDuration,routes.distanceMeters,routes.legs.duration,routes.legs.staticDuration,routes.legs.distanceMeters"
			},
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(1e4)
		});
		const json = await res.json().catch(() => null);
		if (!res.ok) return {
			ok: false,
			error: readableGoogleError(res.status, json)
		};
		const route = (json?.routes)?.[0];
		if (!route?.duration || route.distanceMeters == null) return {
			ok: false,
			error: "ไม่ได้รับเส้นทางจาก Google Routes API"
		};
		const parseSec = (s) => s ? Number(s.replace(/s$/, "")) : NaN;
		const durationMin = parseSec(route.duration) / 60;
		const noTrafficMin = (parseSec(route.staticDuration) || durationMin) / 60;
		if (!Number.isFinite(durationMin)) return {
			ok: false,
			error: "อ่านเวลาเดินทางจาก Google ไม่ได้"
		};
		return {
			ok: true,
			distanceKm: route.distanceMeters / 1e3,
			durationMin,
			noTrafficMin: Number.isFinite(noTrafficMin) ? noTrafficMin : durationMin
		};
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : "เรียก Google Routes API ไม่สำเร็จ"
		};
	}
});
/**
* คำนวณเส้นทางเต็มแยกช่วงด้วย Google Routes API (TRAFFIC_AWARE) ณ เวลาที่เรียก
* ใช้ตอน "คำนวณเส้นทาง" ครั้งเดียวต่อเที่ยว — ไม่เรียกซ้ำระหว่าง render
* เรียกไม่สำเร็จให้ผู้เรียก fallback ไป OSRM → ประมาณการตามลำดับ
*/
var googleRouteLegs_createServerFn_handler = createServerRpc({
	id: "c7a88f0b97325a77ac422141c90f7ec510ace42c05a29886e44bb00ee1d7eb44",
	name: "googleRouteLegs",
	filename: "src/lib/maps/google.ts"
}, (opts) => googleRouteLegs.__executeServer(opts));
var googleRouteLegs = createServerFn({ method: "POST" }).validator((input) => input).handler(googleRouteLegs_createServerFn_handler, async ({ data }) => {
	const key = resolveKey(data.apiKey);
	if (!key) return {
		ok: false,
		error: "ยังไม่ได้ตั้งค่า Google Maps API key"
	};
	const nodes = data.nodes;
	if (nodes.length < 2) return {
		ok: false,
		error: "จุดต้นทาง-ปลายทางไม่ครบ"
	};
	const latLng = (p) => ({ location: { latLng: {
		latitude: p.lat,
		longitude: p.lng
	} } });
	const body = {
		origin: latLng(nodes[0]),
		destination: latLng(nodes[nodes.length - 1]),
		...nodes.length > 2 ? { intermediates: nodes.slice(1, -1).map(latLng) } : {},
		travelMode: "DRIVE",
		routingPreference: "TRAFFIC_AWARE",
		computeAlternativeRoutes: false,
		languageCode: "th",
		units: "METRIC"
	};
	try {
		const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": key,
				"X-Goog-FieldMask": "routes.legs.distanceMeters,routes.legs.duration,routes.legs.staticDuration,routes.legs.polyline.encodedPolyline"
			},
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(12e3)
		});
		const json = await res.json().catch(() => null);
		if (!res.ok) return {
			ok: false,
			error: readableGoogleError(res.status, json)
		};
		const legs = json?.routes?.[0]?.legs;
		if (!legs || legs.length !== nodes.length - 1) return {
			ok: false,
			error: "โครงสร้างเส้นทางจาก Google ไม่ตรงกับจุดแวะ — เปลี่ยนไปใช้ OSRM แทน"
		};
		const parseSec = (s) => s ? Number(s.replace(/s$/, "")) : NaN;
		const out = [];
		for (let i = 0; i < legs.length; i++) {
			const leg = legs[i];
			const durationMin = parseSec(leg.duration) / 60;
			const noTrafficMin = (parseSec(leg.staticDuration) || durationMin) / 60;
			if (!Number.isFinite(durationMin) || leg.distanceMeters == null) return {
				ok: false,
				error: "อ่านระยะทาง/เวลาจาก Google ไม่ได้"
			};
			const geometry = leg.polyline?.encodedPolyline ? decodePolyline(leg.polyline.encodedPolyline) : [[nodes[i].lat, nodes[i].lng], [nodes[i + 1].lat, nodes[i + 1].lng]];
			out.push({
				distanceKm: leg.distanceMeters / 1e3,
				durationMin,
				noTrafficMin: Number.isFinite(noTrafficMin) ? noTrafficMin : durationMin,
				geometry: geometry.length >= 2 ? geometry : [[nodes[i].lat, nodes[i].lng], [nodes[i + 1].lat, nodes[i + 1].lng]]
			});
		}
		return {
			ok: true,
			legs: out,
			calculatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : "เรียก Google Routes API ไม่สำเร็จ"
		};
	}
});
var DEFAULT_TYPES = ["gas_station"];
/**
* ค้นหาจุดพักจริง (ปั๊มน้ำมัน ฯลฯ) รอบพิกัดหนึ่ง ๆ — ใช้เสนอเป็นจุดพักแนะนำ
* เมื่อรถติดจนไปไม่ถึงจุดพักเดิม
*/
var googleRestStops_createServerFn_handler = createServerRpc({
	id: "28c758c1be18b8b64a81aa4c7f1a12703689f3d1e956cdb0d2091eae70cbaaf0",
	name: "googleRestStops",
	filename: "src/lib/maps/google.ts"
}, (opts) => googleRestStops.__executeServer(opts));
var googleRestStops = createServerFn({ method: "POST" }).validator((input) => input).handler(googleRestStops_createServerFn_handler, async ({ data }) => {
	const key = resolveKey(data.apiKey);
	if (!key) return {
		ok: false,
		error: "ยังไม่ได้ตั้งค่า Google Maps API key"
	};
	const radius = Math.min(5e4, Math.max(500, data.radiusM ?? 1e4));
	const body = {
		includedTypes: data.includedTypes?.length ? data.includedTypes : DEFAULT_TYPES,
		maxResultCount: 20,
		locationRestriction: { circle: {
			center: {
				latitude: data.lat,
				longitude: data.lng
			},
			radius
		} }
	};
	try {
		const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Goog-Api-Key": key,
				"X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.currentOpeningHours.openNow"
			},
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(1e4)
		});
		const json = await res.json().catch(() => null);
		if (!res.ok) return {
			ok: false,
			error: readableGoogleError(res.status, json)
		};
		return {
			ok: true,
			stops: (json?.places ?? []).filter((p) => p.id && p.location?.latitude != null && p.location?.longitude != null).map((p) => ({
				id: p.id,
				name: p.displayName?.text ?? "สถานที่ไม่ระบุชื่อ",
				address: p.formattedAddress ?? "",
				lat: p.location.latitude,
				lng: p.location.longitude,
				rating: typeof p.rating === "number" ? p.rating : null,
				openNow: typeof p.currentOpeningHours?.openNow === "boolean" ? p.currentOpeningHours.openNow : null
			}))
		};
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : "เรียก Google Places API ไม่สำเร็จ"
		};
	}
});
var googleTestConnection_createServerFn_handler = createServerRpc({
	id: "62ffd6edc1cc4243deb2b890d5d800194452bf0bf1c37776a0b3ed3367af6317",
	name: "googleTestConnection",
	filename: "src/lib/maps/google.ts"
}, (opts) => googleTestConnection.__executeServer(opts));
var googleTestConnection = createServerFn({ method: "POST" }).validator((input) => input).handler(googleTestConnection_createServerFn_handler, async ({ data }) => {
	return googleRestStops({ data: {
		lat: 14.251,
		lng: 100.731,
		radiusM: 5e3,
		apiKey: data?.apiKey
	} });
});
var integrationEnvStatus_createServerFn_handler = createServerRpc({
	id: "6d90837f0ba939673b7b59e23608e55ecc51b47a0e17ba62e20008f351dfeffe",
	name: "integrationEnvStatus",
	filename: "src/lib/maps/google.ts"
}, (opts) => integrationEnvStatus.__executeServer(opts));
var integrationEnvStatus = createServerFn({ method: "POST" }).handler(integrationEnvStatus_createServerFn_handler, async () => ({
	googleEnvKey: Boolean(env("GOOGLE_MAPS_API_KEY")),
	telegramEnvToken: Boolean(env("TELEGRAM_BOT_TOKEN")),
	telegramEnvChat: Boolean(env("TELEGRAM_CHAT_ID"))
}));
//#endregion
export { googleRestStops_createServerFn_handler, googleRouteEta_createServerFn_handler, googleRouteLegs_createServerFn_handler, googleTestConnection_createServerFn_handler, integrationEnvStatus_createServerFn_handler };
