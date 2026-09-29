import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useRouter, Y as require_jsx_runtime, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as formatClock, c as incompleteGapCount, l as policyFromPartial, r as addMinutes, t as DEFAULT_POLICY } from "./format-C_chUSPy.mjs";
import { a as googleRestStops, d as nearestOnPolyline, f as planTrip, l as haversineKm, m as polylineLengthKm, n as buildFallbackLegs, o as googleRouteEta, p as pointAlongPolyline, t as REST_STOPS, u as integrationEnvStatus } from "./google-B27hyiqN.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { A as ClipboardCheck, E as Compass, M as CircleCheck, N as CircleAlert, j as CircleDashed, k as ClipboardList, l as ShieldAlert, n as TriangleAlert, t as Truck, x as MessageSquareText } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-JYbKxw-Q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function uid(prefix = "id") {
	return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}
var PLACES = [
	{
		id: "scgjwd-wangnoi",
		name: "คลังสินค้า SCG JWD วังน้อย",
		address: "อ.วังน้อย จ.พระนครศรีอยุธยา",
		lat: 14.2482,
		lng: 100.7248,
		kind: "origin",
		clientSite: true
	},
	{
		id: "scgjwd-bangna",
		name: "คลัง SCG JWD บางนา",
		address: "บางนา กรุงเทพฯ",
		lat: 13.6048,
		lng: 100.7042,
		clientSite: true
	},
	{
		id: "scgjwd-lcb",
		name: "SCG JWD แหลมฉบัง",
		address: "ศรีราชา ชลบุรี",
		lat: 13.0836,
		lng: 100.883,
		clientSite: true
	},
	{
		id: "nakhonsawan",
		name: "จุดส่งสินค้านครสวรรค์",
		address: "อ.เมือง จ.นครสวรรค์",
		lat: 15.6938,
		lng: 100.1229,
		kind: "waypoint"
	},
	{
		id: "chiangmai",
		name: "จุดส่งสินค้าเชียงใหม่",
		address: "อ.เมือง จ.เชียงใหม่",
		lat: 18.7883,
		lng: 98.9853,
		kind: "destination"
	},
	{
		id: "khonkaen",
		name: "จุดส่งสินค้าขอนแก่น",
		address: "อ.เมือง จ.ขอนแก่น",
		lat: 16.4419,
		lng: 102.836
	},
	{
		id: "hatyai",
		name: "จุดส่งสินค้าหาดใหญ่",
		address: "อ.หาดใหญ่ จ.สงขลา",
		lat: 7.0084,
		lng: 100.4747
	},
	{
		id: "rayong",
		name: "จุดส่งสินค้าระยอง",
		address: "อ.เมือง จ.ระยอง",
		lat: 12.6814,
		lng: 101.2816
	},
	{
		id: "tak",
		name: "ตัวเมืองตาก",
		address: "อ.เมือง จ.ตาก",
		lat: 16.884,
		lng: 99.1258
	},
	{
		id: "lampang",
		name: "ตัวเมืองลำปาง",
		address: "อ.เมือง จ.ลำปาง",
		lat: 18.2883,
		lng: 99.4906
	},
	{
		id: "saraburi",
		name: "สระบุรี",
		address: "อ.เมือง จ.สระบุรี",
		lat: 14.5289,
		lng: 100.9102
	},
	{
		id: "lopburi",
		name: "ลพบุรี",
		address: "อ.เมือง จ.ลพบุรี",
		lat: 14.7995,
		lng: 100.6534
	},
	{
		id: "bangkok",
		name: "กรุงเทพฯ (จุดอ้างอิง)",
		address: "ปทุมวัน",
		lat: 13.7563,
		lng: 100.5018
	}
];
function placeById(id) {
	return PLACES.find((p) => p.id === id);
}
function seedSampleTrip(policy) {
	const origin = placeById("scgjwd-wangnoi");
	const waypoint = placeById("nakhonsawan");
	const destination = placeById("chiangmai");
	const startTime = defaultStartIso();
	const legs = buildFallbackLegs(origin, [waypoint], destination, policy);
	const plan = planTrip({
		origin,
		waypoints: [waypoint],
		destination,
		startTime: new Date(startTime),
		policy,
		legs
	});
	return {
		id: "trip-sample-north",
		code: "PP-SCG-NORTH-01",
		title: "วังน้อย → นครสวรรค์ → เชียงใหม่",
		client: "SCGJWD",
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		origin,
		waypoints: [waypoint],
		destination,
		startTime,
		status: "planned",
		vehicleType: policy.vehicleType,
		plan,
		events: [{
			id: "ev-seed",
			type: "planned",
			at: (/* @__PURE__ */ new Date()).toISOString(),
			label: "แผนตัวอย่างงาน SCGJWD สายเหนือ"
		}],
		continuousMin: 0,
		clock: startTime,
		currentStopSeq: 1,
		delayMin: 0,
		policySnapshot: policy
	};
}
function defaultStartIso() {
	const now = /* @__PURE__ */ new Date();
	const bkk = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
	bkk.setHours(6, 0, 0, 0);
	if (new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" })).getHours() >= 18) bkk.setDate(bkk.getDate() + 1);
	const y = bkk.getFullYear();
	const m = String(bkk.getMonth() + 1).padStart(2, "0");
	const d = String(bkk.getDate()).padStart(2, "0");
	return (/* @__PURE__ */ new Date(`${y}-${m}-${d}T06:00:00+07:00`)).toISOString();
}
function replan(trip, policy, extra) {
	const next = {
		...trip,
		...extra
	};
	const legs = buildFallbackLegs(trip.origin, trip.waypoints, trip.destination, policy);
	const plan = planTrip({
		origin: trip.origin,
		waypoints: trip.waypoints,
		destination: trip.destination,
		startTime: new Date(next.clock),
		policy: {
			...policy,
			vehicleType: trip.vehicleType
		},
		legs,
		continuousMin: next.continuousMin,
		delayMin: next.delayMin
	});
	return {
		...next,
		plan,
		policySnapshot: policy
	};
}
function event(type, label, extraMin) {
	return {
		id: uid("ev"),
		type,
		at: (/* @__PURE__ */ new Date()).toISOString(),
		label,
		extraMin
	};
}
/** เวลาขับต่อเนื่องจริง ณ ตอนนี้ (นับจาก enrouteSince แบบเรียลไทม์) */
function continuousNowOf(trip) {
	if (trip.status === "enroute" && trip.enrouteSince) {
		const extra = (Date.now() - new Date(trip.enrouteSince).getTime()) / 6e4;
		return trip.continuousMin + Math.max(0, extra);
	}
	return trip.continuousMin;
}
/** เวลาพักที่เหลือ (นาที) — null ถ้าไม่ได้อยู่ระหว่างพัก */
function restRemainingMin(trip, policy) {
	if (trip.status !== "resting" || !trip.restStartedAt) return null;
	const elapsed = (Date.now() - new Date(trip.restStartedAt).getTime()) / 6e4;
	return Math.max(0, policy.restMin - elapsed);
}
function seedSavedRoutes() {
	const p = (id) => PLACES.find((x) => x.id === id);
	const origin = p("scgjwd-wangnoi");
	const nakhonsawan = p("nakhonsawan");
	const chiangmai = p("chiangmai");
	const lcb = p("scgjwd-lcb");
	const routes = [];
	if (origin && nakhonsawan && chiangmai) routes.push({
		id: "route-seed-north",
		title: "วังน้อย → นครสวรรค์ → เชียงใหม่",
		origin,
		waypoints: [nakhonsawan],
		destination: chiangmai,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		note: "เส้นทางเหนือ 586 กม. — เที่ยวเดิมของบริษัท"
	});
	if (origin && lcb) routes.push({
		id: "route-seed-lcb",
		title: "วังน้อย → แหลมฉบัง",
		origin,
		waypoints: [],
		destination: lcb,
		savedAt: (/* @__PURE__ */ new Date()).toISOString(),
		note: "เที่ยวสั้น ส่งของคลังแหลมฉบัง"
	});
	return routes;
}
var useDesk = create()(persist((set, get) => ({
	policy: DEFAULT_POLICY,
	trips: [seedSampleTrip(DEFAULT_POLICY)],
	savedRoutes: seedSavedRoutes(),
	activeTripId: "trip-sample-north",
	chat: [{
		id: "welcome",
		role: "assistant",
		content: "สวัสดีครับ ผมคือผู้ช่วยวางแผนเส้นทางของเผ่าปัญญา ทรานสปอร์ต สำหรับงาน SCGJWD\n\nคุมไม่ให้ขับต่อเนื่องเกิน 4 ชั่วโมง และจัดพัก 30 นาทีตามนโยบายเที่ยวนี้\nเปิดเที่ยวตัวอย่างวังน้อย → นครสวรรค์ → เชียงใหม่ ได้เลย หรือวางแผนเที่ยวใหม่\n\nตัวเลขในแผนเป็นค่าประมาณจนกว่าจะยืนยันจากแผนที่/จุดพักจริง"
	}],
	hydrated: false,
	setHydrated: (v) => set({ hydrated: v }),
	setPolicy: (p) => {
		set({ policy: policyFromPartial({
			...get().policy,
			...p
		}) });
	},
	setVehicle: (vehicleType) => {
		set({ policy: policyFromPartial({
			...get().policy,
			vehicleType
		}) });
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
			legs
		});
		const trip = {
			id: uid("trip"),
			code: `PP-SCG-${(/* @__PURE__ */ new Date()).toISOString().slice(2, 10).replace(/-/g, "")}-${String(get().trips.length + 1).padStart(2, "0")}`,
			title: title ?? `${origin.name} → ${destination.name}`,
			client: "SCGJWD",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
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
			policySnapshot: policy
		};
		set({
			trips: [trip, ...get().trips],
			activeTripId: trip.id
		});
		return trip;
	},
	applyLegsAndPlan: (tripId, legs, meta) => {
		const { trips, policy } = get();
		set({ trips: trips.map((t) => {
			if (t.id !== tripId) return t;
			const plan = planTrip({
				origin: t.origin,
				waypoints: t.waypoints,
				destination: t.destination,
				startTime: new Date(t.startTime),
				policy: {
					...policy,
					vehicleType: t.vehicleType
				},
				legs,
				continuousMin: t.continuousMin,
				delayMin: t.delayMin
			});
			return {
				...t,
				plan,
				legs,
				...meta ? { routeMeta: meta } : {}
			};
		}) });
	},
	saveRouteFromTrip: (tripId, note) => {
		const t = get().trips.find((x) => x.id === tripId);
		if (!t) return;
		if (get().savedRoutes.some((r) => r.title === t.title)) return;
		set({ savedRoutes: [{
			id: uid("route"),
			title: t.title,
			origin: t.origin,
			waypoints: t.waypoints,
			destination: t.destination,
			savedAt: (/* @__PURE__ */ new Date()).toISOString(),
			note
		}, ...get().savedRoutes] });
	},
	deleteSavedRoute: (id) => {
		set({ savedRoutes: get().savedRoutes.filter((r) => r.id !== id) });
	},
	setActive: (id) => set({ activeTripId: id }),
	pushEvent: (tripId, type, label, extraMin) => {
		set({ trips: get().trips.map((t) => t.id === tripId ? {
			...t,
			events: [event(type, label, extraMin), ...t.events]
		} : t) });
	},
	startTrip: (tripId) => {
		const policy = get().policy;
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		set({ trips: get().trips.map((t) => {
			if (t.id !== tripId) return t;
			const plan = planTrip({
				origin: t.origin,
				waypoints: t.waypoints,
				destination: t.destination,
				startTime: new Date(nowIso),
				policy: {
					...policy,
					vehicleType: t.vehicleType
				},
				legs: t.legs ?? buildFallbackLegs(t.origin, t.waypoints, t.destination, policy),
				continuousMin: 0,
				delayMin: t.delayMin
			});
			return {
				...t,
				status: "enroute",
				continuousMin: 0,
				clock: nowIso,
				enrouteSince: nowIso,
				restStartedAt: null,
				plan,
				events: [event("depart", "เริ่มออกเดินทาง — เริ่มนับเวลาขับ 0 นาที"), ...t.events]
			};
		}) });
	},
	addDelay: (tripId, minutes) => {
		const policy = get().policy;
		set({ trips: get().trips.map((t) => {
			if (t.id !== tripId) return t;
			const delayMin = t.delayMin + minutes;
			return replan({
				...t,
				delayMin,
				events: [event("traffic", `รายงานรถติด +${minutes} นาที`, minutes), ...t.events]
			}, policy, {
				delayMin,
				clock: t.clock
			});
		}) });
	},
	startRest: (tripId) => {
		set({ trips: get().trips.map((t) => {
			if (t.id !== tripId) return t;
			const nowIso = (/* @__PURE__ */ new Date()).toISOString();
			const folded = t.enrouteSince ? t.continuousMin + (Date.now() - new Date(t.enrouteSince).getTime()) / 6e4 : t.continuousMin;
			return {
				...t,
				status: "resting",
				continuousMin: Math.round(folded),
				enrouteSince: null,
				restStartedAt: nowIso,
				clock: nowIso,
				events: [event("rest-start", "เริ่มพัก — นับถอยหลัง 30 นาที"), ...t.events]
			};
		}) });
	},
	finishRest: (tripId) => {
		const policy = get().policy;
		const nowIso = (/* @__PURE__ */ new Date()).toISOString();
		set({ trips: get().trips.map((t) => {
			if (t.id !== tripId) return t;
			const continuousMin = policy.restResetsDriving ? 0 : t.continuousMin;
			return replan({
				...t,
				status: "enroute",
				enrouteSince: nowIso,
				restStartedAt: null,
				events: [event("rest-done", `พักครบ ${policy.restMin} นาที — ออกเดินทางต่อ ${formatClock(nowIso)}`), ...t.events]
			}, policy, {
				continuousMin,
				delayMin: 0,
				clock: nowIso
			});
		}) });
	},
	completeTrip: (tripId) => {
		set({ trips: get().trips.map((t) => {
			if (t.id !== tripId) return t;
			const folded = t.enrouteSince ? t.continuousMin + (Date.now() - new Date(t.enrouteSince).getTime()) / 6e4 : t.continuousMin;
			return {
				...t,
				status: "completed",
				continuousMin: Math.round(folded),
				enrouteSince: null,
				restStartedAt: null,
				events: [event("arrive", "ถึงปลายทาง"), ...t.events]
			};
		}) });
	},
	advanceClock: (tripId, minutes) => {
		const policy = get().policy;
		set({ trips: get().trips.map((t) => {
			if (t.id !== tripId || t.status === "completed") return t;
			const clock = addMinutes(new Date(t.clock), minutes).toISOString();
			if (t.status === "resting") {
				const restStartedAt = t.restStartedAt ? (/* @__PURE__ */ new Date(new Date(t.restStartedAt).getTime() - minutes * 6e4)).toISOString() : t.restStartedAt;
				return {
					...t,
					clock,
					restStartedAt,
					events: [event("progress", `จำลองเวลาพัก +${minutes} นาที`), ...t.events]
				};
			}
			const enrouteSince = t.enrouteSince ? (/* @__PURE__ */ new Date(new Date(t.enrouteSince).getTime() - minutes * 6e4)).toISOString() : t.enrouteSince;
			const newCont = t.enrouteSince ? continuousNowOf(t) + minutes : t.continuousMin + minutes;
			const over = newCont >= policy.maxContinuousMin;
			return {
				...t,
				clock,
				enrouteSince,
				continuousMin: t.enrouteSince ? t.continuousMin : newCont,
				events: [event("progress", over ? `จำลอง +${minutes} นาที — เวลาขับถึงเพดานแล้ว ต้องพัก` : `จำลองเวลาขับ +${minutes} นาที`), ...t.events]
			};
		}) });
	},
	replaceNextRest: (tripId, newRest) => {
		const policy = get().policy;
		set({ trips: get().trips.map((t) => t.id === tripId ? applyRestReplacement(t, policy, newRest) : t) });
	},
	addChat: (role, content) => {
		set({ chat: [...get().chat, {
			id: uid("m"),
			role,
			content
		}] });
	},
	resetChat: () => set({ chat: [] }),
	resetDemo: () => {
		const policy = DEFAULT_POLICY;
		set({
			policy,
			trips: [seedSampleTrip(policy)],
			activeTripId: "trip-sample-north",
			chat: []
		});
	}
}), {
	name: "phaopanya-route-desk",
	partialize: (s) => ({
		policy: s.policy,
		trips: s.trips,
		savedRoutes: s.savedRoutes,
		activeTripId: s.activeTripId,
		chat: s.chat.slice(-20)
	}),
	onRehydrateStorage: () => (state) => {
		state?.setHydrated(true);
	}
}));
function useActiveTrip() {
	return useDesk((s) => s.trips.find((t) => t.id === s.activeTripId) ?? s.trips[0] ?? null);
}
/** เปลี่ยนจุดพักถัดไป (จุดพักแรกที่ยังไม่ถึง) เป็นจุดใหม่ แล้วเลื่อนเวลาช่วงหลังให้สอดคล้อง */
function applyRestReplacement(trip, policy, newRest) {
	const nowIso = (/* @__PURE__ */ new Date()).toISOString();
	const stops = [...trip.plan.stops];
	const idx = stops.findIndex((s) => s.type === "rest" && s.start > nowIso);
	if (idx < 0) return trip;
	const oldRest = stops[idx];
	const prevDrive = stops[idx - 1];
	const fromPlace = idx >= 2 ? stops[idx - 2].place : trip.origin;
	const roadKm = haversineKm(fromPlace, newRest) * 1.3;
	const newDriveMin = Math.max(5, roadKm / Math.max(30, policy.avgHighwayKmh) * 60);
	const oldDriveMin = prevDrive?.driveMin ?? 0;
	const deltaMin = newDriveMin + policy.restMin - (oldDriveMin + oldRest.restMin);
	if (prevDrive) stops[idx - 1] = {
		...prevDrive,
		title: `ขับ (ประมาณการ) → ${newRest.name}`,
		distanceKm: roadKm,
		driveMin: newDriveMin,
		confidence: "estimated",
		note: "ระยะประมาณการหลังเปลี่ยนจุดพัก ณ เวลาที่ยืนยัน"
	};
	const driveEnd = prevDrive ? addMinutes(new Date(stops[idx - 1].start), newDriveMin).toISOString() : oldRest.start;
	const restEnd = addMinutes(new Date(driveEnd), policy.restMin).toISOString();
	stops[idx] = {
		...oldRest,
		title: `พัก ${policy.restMin} นาที · ${newRest.name}`,
		place: {
			...newRest,
			kind: "rest"
		},
		start: driveEnd,
		end: restEnd,
		note: `เปลี่ยนจุดพักจาก ${oldRest.place.name} — ตัวเลขหลังจากนี้เป็นประมาณการ`,
		confidence: newRest.verification === "routed" ? "routed" : "must-verify",
		onRoute: true
	};
	let prevEnd = restEnd;
	for (let j = idx + 1; j < stops.length; j++) {
		const s = stops[j];
		const dur = (new Date(s.end).getTime() - new Date(s.start).getTime()) / 6e4;
		const start = prevEnd;
		const end = addMinutes(new Date(start), dur).toISOString();
		stops[j] = {
			...s,
			start,
			end
		};
		prevEnd = end;
	}
	const plan = {
		...trip.plan,
		stops,
		totalDistanceKm: stops.reduce((sum, x) => sum + x.distanceKm, 0),
		totalDriveMin: stops.reduce((sum, x) => sum + x.driveMin, 0),
		eta: stops[stops.length - 1]?.end ?? trip.plan.eta,
		risk: "watch",
		riskNote: "เปลี่ยนจุดพักกลางทางแล้ว — ตัวเลขช่วงหลังเป็นประมาณการ ควรยืนยันจุดพักจริงอีกครั้ง"
	};
	return {
		...trip,
		plan,
		delayMin: trip.delayMin + Math.max(0, deltaMin),
		events: [event("replan", `เปลี่ยนจุดพักเป็น ${newRest.name} (เดิม: ${oldRest.place.name})`, Math.max(0, Math.round(deltaMin))), ...trip.events]
	};
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-opacity duration-150 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:opacity-90",
			navy: "bg-navy text-navy-fg hover:opacity-90",
			outline: "border border-border bg-surface text-fg hover:bg-surface-2",
			ghost: "text-fg hover:bg-surface-2",
			danger: "bg-danger text-danger-fg hover:opacity-90",
			warn: "bg-warn-fg text-warn border border-warn/20 hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DCm_HuB2.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var NAV = [
	{
		to: "/drive",
		label: "โหมดคนขับ",
		short: "คนขับ",
		icon: Truck
	},
	{
		to: "/",
		label: "โต๊ะปฏิบัติการ",
		short: "โต๊ะ",
		icon: ClipboardList
	},
	{
		to: "/plan",
		label: "วางแผนเที่ยว",
		short: "วางแผน",
		icon: Compass
	},
	{
		to: "/agent",
		label: "Agent",
		short: "Agent",
		icon: MessageSquareText
	},
	{
		to: "/readiness",
		label: "ความพร้อมใช้จริง",
		short: "พร้อมไหม",
		icon: ClipboardCheck
	},
	{
		to: "/policy",
		label: "นโยบาย / ช่องว่าง",
		short: "นโยบาย",
		icon: ShieldAlert
	}
];
function AppShell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const policy = useDesk((s) => s.policy);
	const setHydrated = useDesk((s) => s.setHydrated);
	const gaps = incompleteGapCount(policy);
	(0, import_react.useEffect)(() => {
		setHydrated(true);
	}, [setHydrated]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh lg:grid lg:grid-cols-[248px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "hidden bg-navy text-navy-fg lg:flex lg:flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-white/10 px-5 py-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/logo-phaopanya.png",
							alt: "เผ่าปัญญา ทรานสปอร์ต",
							className: "h-14 w-14 rounded-lg bg-navy-fg object-contain p-1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-sm font-semibold leading-tight",
							children: "เผ่าปัญญา"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-wide text-navy-fg/70",
							children: "Route Desk"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] uppercase tracking-wider text-navy-fg/55",
							children: "งานลูกค้า"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium",
							children: "SCGJWD Logistics"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/logo-scgjwd.png",
							alt: "SCGJWD",
							className: "h-7 w-auto rounded-sm bg-navy-fg px-1.5 py-1"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex flex-1 flex-col gap-1 p-3",
					children: NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" || pathname.startsWith("/trip") : pathname === item.to;
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors", active ? "bg-navy-fg text-navy" : "text-navy-fg/80 hover:bg-white/10 hover:text-navy-fg"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1",
									children: item.label
								}),
								item.to === "/policy" && gaps > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full bg-danger-fg px-1.5 text-[10px] font-semibold text-danger",
									children: gaps
								}) : null
							]
						}, item.to);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-5 py-4 text-[11px] leading-relaxed text-navy-fg/45",
					children: "กฎปฏิบัติการเที่ยวนี้: ขับต่อเนื่องไม่เกิน 4 ชม. พัก 30 นาที ไม่ใช่ข้อสรุปกฎหมาย"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-dvh flex-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm lg:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/logo-phaopanya.png",
							alt: "",
							className: "h-10 w-10 rounded-md bg-navy object-contain"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-sm font-semibold",
								children: "เผ่าปัญญา Route Desk"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[11px] text-muted",
								children: "งาน SCGJWD"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/logo-scgjwd.png",
							alt: "",
							className: "h-6 w-auto"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 px-4 py-5 pb-24 lg:px-8 lg:py-7 lg:pb-7",
					children
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "fixed inset-x-0 bottom-0 z-20 grid grid-cols-6 border-t border-border bg-surface/95 backdrop-blur-sm lg:hidden",
					children: NAV.map((item) => {
						const active = item.to === "/" ? pathname === "/" || pathname.startsWith("/trip") : pathname === item.to;
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[10px]", active ? "text-primary" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.short]
						}, item.to);
					})
				})
			]
		})]
	});
}
var styles_default = "/assets/styles-CcKanrya.css";
var APP_NAME = "เผ่าปัญญา Route Desk";
var Route$8 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "ระบบวางแผนเส้นทางและจุดพักรถของหจก.เผ่าปัญญา ทรานสปอร์ต สำหรับงาน SCGJWD — ขับไม่เกิน 4 ชั่วโมง พัก 30 นาที"
			},
			{
				name: "theme-color",
				content: "#12233A"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Prompt:wght@500;600;700&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "th",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "paper-grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var $$splitComponentImporter$5 = () => import("./routes-Dhd4a5Q2.mjs");
var Route$7 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./agent-D54YYD8Q.mjs");
var Route$6 = createFileRoute("/agent")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./drive-CQL3Vdig.mjs");
var Route$5 = createFileRoute("/drive")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./plan-Bhe69KNS.mjs");
var Route$4 = createFileRoute("/plan")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./policy-CB07wH3o.mjs");
var Route$3 = createFileRoute("/policy")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
function Badge({ className, tone = "navy", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
			navy: "bg-navy text-navy-fg",
			primary: "bg-primary text-primary-fg",
			ok: "bg-ok-fg text-ok",
			warn: "bg-warn-fg text-warn",
			danger: "bg-danger-fg text-danger",
			rest: "bg-rest-fg text-rest",
			muted: "bg-surface-2 text-muted"
		}[tone], className),
		...props
	});
}
var DEFAULT_GPS_API_CONFIG = {
	url: "",
	method: "GET",
	headersJson: "",
	bodyJson: "",
	latPath: "lat",
	lngPath: "lng",
	speedPath: "speed",
	accuracyPath: ""
};
function gpsQuality(pos, now) {
	const ageMin = Math.max(0, (now.getTime() - new Date(pos.at).getTime()) / 6e4);
	const acc = pos.accuracyM ?? null;
	let quality = "fresh";
	if (ageMin > 10 || acc != null && acc > 300) quality = "unusable";
	else if (ageMin > 3 || acc != null && acc > 100) quality = "stale";
	return {
		quality,
		ageMin
	};
}
function tripPolyline(trip) {
	const pts = [];
	const legs = trip.legs && trip.legs.length > 0 ? trip.legs : straightLegs(trip);
	for (const leg of legs) for (const p of leg.geometry) {
		const last = pts[pts.length - 1];
		if (!last || last[0] !== p[0] || last[1] !== p[1]) pts.push(p);
	}
	return pts.length >= 2 ? pts : [[trip.origin.lat, trip.origin.lng], [trip.destination.lat, trip.destination.lng]];
}
function straightLegs(trip) {
	const nodes = [
		trip.origin,
		...trip.waypoints,
		trip.destination
	];
	const legs = [];
	for (let i = 0; i < nodes.length - 1; i++) {
		const a = nodes[i];
		const b = nodes[i + 1];
		legs.push({
			fromId: a.id,
			toId: b.id,
			distanceKm: haversineKm(a, b),
			durationMin: haversineKm(a, b) / 55 * 60,
			geometry: [[a.lat, a.lng], [b.lat, b.lng]],
			source: "estimated"
		});
	}
	return legs;
}
/** โหมดจำลอง: รถวิ่งตามเส้นทางตามนาฬิกาเที่ยว (trip.clock) หน่วงด้วย factor */
function demoPosition(trip, at, factor) {
	const geom = tripPolyline(trip);
	const startMs = new Date(trip.startTime).getTime();
	const totalPlanMin = Math.max(1, (new Date(trip.plan.eta).getTime() - startMs) / 6e4);
	const elapsedMin = (at.getTime() - startMs) / 6e4;
	const frac = Math.min(1, Math.max(0, elapsedMin / Math.max(.5, factor) / totalPlanMin));
	const [lat, lng] = pointAlongPolyline(geom, frac);
	return {
		lat,
		lng,
		speedKmh: null,
		at: at.toISOString(),
		source: "demo"
	};
}
/** โหมดเครื่องนี้: GPS จากมือถือคนขับ */
function devicePosition() {
	return new Promise((resolve, reject) => {
		if (typeof navigator === "undefined" || !navigator.geolocation) {
			reject(/* @__PURE__ */ new Error("เบราว์เซอร์นี้ไม่รองรับ GPS"));
			return;
		}
		navigator.geolocation.getCurrentPosition((p) => resolve({
			lat: p.coords.latitude,
			lng: p.coords.longitude,
			speedKmh: p.coords.speed != null ? p.coords.speed * 3.6 : null,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			source: "device",
			accuracyM: p.coords.accuracy ?? null
		}), (err) => reject(/* @__PURE__ */ new Error(`อ่าน GPS เครื่องนี้ไม่ได้ (${err.message})`)), {
			enableHighAccuracy: true,
			timeout: 12e3,
			maximumAge: 3e4
		});
	});
}
function extractPath(obj, path) {
	const parts = path.split(".").filter(Boolean);
	let cur = obj;
	for (const key of parts) {
		if (cur == null) return void 0;
		if (Array.isArray(cur)) {
			const i = Number(key);
			cur = Number.isNaN(i) ? void 0 : cur[i];
		} else if (typeof cur === "object") cur = cur[key];
		else return;
	}
	return cur;
}
/** โหมด API: ดึงจากระบบ GPS ผู้ให้บริการ (REST polling) */
async function apiPosition(cfg) {
	if (!cfg.url) throw new Error("ยังไม่ได้ตั้งค่า URL ของระบบ GPS");
	const headers = {};
	if (cfg.headersJson.trim()) try {
		Object.assign(headers, JSON.parse(cfg.headersJson));
	} catch {
		throw new Error("Headers ต้องเป็น JSON ที่ถูกต้อง");
	}
	const init = {
		method: cfg.method,
		headers,
		signal: AbortSignal.timeout(1e4)
	};
	if (cfg.method === "POST" && cfg.bodyJson.trim()) {
		init.body = cfg.bodyJson;
		if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
	}
	const res = await fetch(cfg.url, init);
	if (!res.ok) throw new Error(`ระบบ GPS ตอบกลับ HTTP ${res.status}`);
	const body = await res.json();
	const lat = Number(extractPath(body, cfg.latPath || "lat"));
	const lng = Number(extractPath(body, cfg.lngPath || "lng"));
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("อ่านพิกัดจากผลลัพธ์ไม่ได้ — ตรวจ lat/lng path อีกครั้ง");
	const speedRaw = cfg.speedPath ? Number(extractPath(body, cfg.speedPath)) : NaN;
	const accRaw = cfg.accuracyPath ? Number(extractPath(body, cfg.accuracyPath)) : NaN;
	return {
		lat,
		lng,
		speedKmh: Number.isFinite(speedRaw) ? speedRaw : null,
		at: (/* @__PURE__ */ new Date()).toISOString(),
		source: "api",
		accuracyM: Number.isFinite(accRaw) ? accRaw : null
	};
}
function runWatchdog(trip, pos, policy, continuousNow, now) {
	const geom = tripPolyline(trip);
	const totalKm = polylineLengthKm(geom);
	const proj = nearestOnPolyline(geom, pos);
	const startMs = new Date(trip.startTime).getTime();
	const totalPlanMin = Math.max(1, (new Date(trip.plan.eta).getTime() - startMs) / 6e4);
	const elapsedMin = (now.getTime() - startMs) / 6e4;
	const expectedFrac = Math.min(1, Math.max(0, elapsedMin / totalPlanMin));
	const delayMin = Math.max(0, (expectedFrac - proj.fraction) * totalPlanMin);
	const remainingDriveMin = Math.max(0, policy.maxContinuousMin - continuousNow);
	const speed = Math.max(20, policy.avgHighwayKmh);
	const next = trip.plan.stops.filter((s) => s.type === "rest").map((s) => ({
		stop: s,
		frac: nearestOnPolyline(geom, s.place).fraction
	})).sort((a, b) => a.frac - b.frac).find((r) => r.frac > proj.fraction + .004);
	const etaTo = (frac) => (frac - proj.fraction) * totalKm / speed * 60;
	const nextRestEtaMin = next ? etaTo(next.frac) : null;
	const nextRestReachable = next ? nextRestEtaMin + policy.bufferMin <= remainingDriveMin : true;
	const etaDestinationMin = etaTo(1);
	const destinationReachable = etaDestinationMin + policy.bufferMin <= remainingDriveMin;
	let level = "ok";
	let message = "ตำแหน่งรถอยู่ตามแผน — เฝ้าระวังต่อเนื่อง";
	if (delayMin > 10) {
		level = "watch";
		message = `ล่าช้าสะสมประมาณ ${Math.round(delayMin)} นาที — เฝ้าดูจุดพักถัดไปให้แน่น`;
	}
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
	const alternatives = [];
	if (level === "act") {
		const targetFrac = next ? next.frac : Math.min(1, proj.fraction + .5);
		const budgetFrac = proj.fraction + Math.max(0, (remainingDriveMin - policy.bufferMin) * (speed / 60)) / Math.max(1, totalKm);
		const ceiling = Math.max(proj.fraction + .01, Math.min(targetFrac, budgetFrac));
		const scored = REST_STOPS.filter((s) => policy.vehicleType !== "6-wheel" ? s.truckOk : true).map((s) => ({
			s,
			proj: nearestOnPolyline(geom, s)
		})).filter((x) => x.proj.fraction > proj.fraction + .004 && x.proj.fraction <= ceiling + .02).filter((x) => x.proj.distKm <= 12).sort((a, b) => a.proj.fraction - b.proj.fraction).slice(0, 4);
		for (const x of scored) alternatives.push({
			...x.s,
			note: `ไปทันในเวลาที่เหลือ · เบี่ยง ~${x.proj.distKm.toFixed(1)} กม.`
		});
		if (alternatives.length === 0) {
			const coord = pointAlongPolyline(geom, Math.min(ceiling, .999));
			alternatives.push({
				id: "unverified-emergency",
				name: "จุดปลอดภัยริมทาง (ยังไม่ยืนยัน)",
				lat: coord[0],
				lng: coord[1],
				truckOk: false,
				facilities: [],
				verification: "unverified",
				note: "ไม่มีจุดพักในคลังที่ไปทัน — ให้คนขับเลือกจุดจอดที่ปลอดภัยเอง",
				kind: "rest"
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
		offRouteStreak: 0
	};
}
function googleKeyOrNull() {
	const s = useGpsSettings.getState();
	if (!s.googleEnabled) return void 0;
	return s.googleMapsKey.trim() || void 0;
}
/** จุดพักถัดไปที่ยังไม่ผ่านตำแหน่งรถ (ตรรกะเดียวกับ runWatchdog) */
function nextRestAhead(trip, projFrac) {
	const geom = tripPolyline(trip);
	return trip.plan.stops.filter((s) => s.type === "rest").map((s) => ({
		stop: s,
		frac: nearestOnPolyline(geom, s.place).fraction
	})).sort((a, b) => a.frac - b.frac).find((r) => r.frac > projFrac + .004) ?? null;
}
/**
* ค้นหาจุดพักจริงจาก Google Places บนช่วงเส้นทางที่รถไปทันภายในเวลาขับที่เหลือ
* แล้วรวมกับจุดพักจากคลังข้อมูลเดิม (ตัดซ้ำระยะใกล้กัน < 1.5 กม.)
*/
async function googleAlternatives(trip, projFrac, remainingDriveMin, policy, geom, totalKm, existing) {
	const speed = Math.max(20, policy.avgHighwayKmh);
	const budgetKm = Math.max(0, remainingDriveMin - policy.bufferMin) * (speed / 60);
	const ceilingFrac = Math.min(.999, projFrac + budgetKm / Math.max(1, totalKm));
	if (ceilingFrac <= projFrac + .005) return existing;
	const midFrac = (projFrac + ceilingFrac) / 2;
	const probeA = pointAlongPolyline(geom, midFrac);
	const probeB = pointAlongPolyline(geom, ceilingFrac);
	const apiKey = googleKeyOrNull();
	const results = await Promise.all([googleRestStops({ data: {
		lat: probeA[0],
		lng: probeA[1],
		radiusM: 1e4,
		apiKey
	} }).catch(() => null), googleRestStops({ data: {
		lat: probeB[0],
		lng: probeB[1],
		radiusM: 1e4,
		apiKey
	} }).catch(() => null)]);
	const byId = /* @__PURE__ */ new Map();
	for (const r of results) if (r && r.ok) for (const s of r.stops) byId.set(s.id, s);
	const candidates = [];
	for (const s of byId.values()) {
		const proj = nearestOnPolyline(geom, {
			lat: s.lat,
			lng: s.lng
		});
		if (proj.fraction <= projFrac + .004 || proj.fraction > ceilingFrac + .02) continue;
		if (proj.distKm > 12) continue;
		if (existing.some((c) => haversineKm({
			lat: s.lat,
			lng: s.lng
		}, c) < 1.5)) continue;
		const etaMin = (proj.fraction - projFrac) * totalKm / speed;
		const bits = [
			`ไปทันในเวลาที่เหลือ · เบี่ยง ~${proj.distKm.toFixed(1)} กม. · ~${Math.round(etaMin)} นาที`,
			s.rating != null ? `★ ${s.rating.toFixed(1)}` : null,
			s.openNow != null ? s.openNow ? "เปิดอยู่" : "ปิดแล้ว" : null
		].filter(Boolean);
		candidates.push({
			frac: proj.fraction,
			stop: {
				id: `g-${s.id}`,
				name: s.name,
				address: s.address || void 0,
				lat: s.lat,
				lng: s.lng,
				truckOk: false,
				facilities: ["ปั๊มน้ำมัน"],
				verification: "must-verify",
				note: bits.join(" · "),
				kind: "rest"
			}
		});
	}
	const existingWithFrac = existing.map((s) => ({
		frac: nearestOnPolyline(geom, s).fraction,
		stop: s
	}));
	return [...candidates, ...existingWithFrac].sort((a, b) => a.frac - b.frac).slice(0, 6).map((x) => x.stop);
}
/**
* เรียก Google Routes API ตรวจเวลาถึงจุดพักถัดไป/ปลายทางด้วยข้อมูลรถติดจริง
* ถ้าไปไม่ทัน → ยกระดับเตือนเป็น act + หาจุดพักจริงจาก Google Places ให้ทันที
* ทุกกรณีถ้า Google ล่ม/key มีปัญหา ระบบยังใช้ผลคำนวณจากเส้นทางเดิม (fallback ปลอดภัย)
*/
async function enrichWithGoogle(trip, pos, wd, policy, continuousNow) {
	const apiKey = googleKeyOrNull();
	const geom = tripPolyline(trip);
	const totalKm = polylineLengthKm(geom);
	const proj = nearestOnPolyline(geom, pos);
	const remainingDriveMin = Math.max(0, policy.maxContinuousMin - continuousNow);
	const next = nextRestAhead(trip, proj.fraction);
	const target = next ? next.stop.place : trip.destination;
	const r = await googleRouteEta({ data: {
		origin: {
			lat: pos.lat,
			lng: pos.lng
		},
		destination: {
			lat: target.lat,
			lng: target.lng
		},
		apiKey
	} }).catch(() => null);
	if (!r) return {
		...wd,
		googleError: "เรียก Google Routes API ไม่สำเร็จ"
	};
	if (!r.ok) return {
		...wd,
		googleError: r.error
	};
	const etaMin = r.durationMin;
	const out = {
		...wd,
		etaSource: "google",
		googleError: void 0
	};
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
	if (out.level === "act") out.alternatives = await googleAlternatives(trip, proj.fraction, remainingDriveMin, policy, geom, totalKm, out.alternatives);
	return out;
}
function getApiConfig() {
	return useGpsSettings.getState().apiConfig ?? DEFAULT_GPS_API_CONFIG;
}
var useGpsSettings = create()(persist((set) => ({
	mode: "off",
	apiConfig: DEFAULT_GPS_API_CONFIG,
	telegramBotToken: "",
	telegramChatId: "",
	googleMapsKey: "",
	googleEnabled: false,
	setMode: (mode) => set({ mode }),
	setApiConfig: (c) => set({ apiConfig: {
		...getApiConfig(),
		...c
	} }),
	setTelegram: (telegramBotToken, telegramChatId) => set({
		telegramBotToken,
		telegramChatId
	}),
	setGoogle: (googleMapsKey, googleEnabled) => set({
		googleMapsKey,
		googleEnabled
	})
}), {
	name: "phaopanya-gps-settings",
	partialize: (s) => ({
		mode: s.mode,
		apiConfig: s.apiConfig,
		telegramBotToken: s.telegramBotToken,
		telegramChatId: s.telegramChatId,
		googleMapsKey: s.googleMapsKey,
		googleEnabled: s.googleEnabled
	})
}));
var useGpsLive = create()((set) => ({
	status: "idle",
	error: null,
	pos: null,
	watchdog: null,
	lastCheckAt: null,
	demoFactor: 1,
	offRouteStreak: 0,
	setStatus: (status, error = null) => set({
		status,
		error
	}),
	setPosition: (pos) => set({ pos }),
	setWatchdog: (watchdog) => set({ watchdog }),
	setDemoFactor: (demoFactor) => set({ demoFactor: Math.min(3, Math.max(1, demoFactor)) }),
	setOffRouteStreak: (offRouteStreak) => set({ offRouteStreak }),
	reset: () => set({
		status: "idle",
		error: null,
		pos: null,
		watchdog: null,
		lastCheckAt: null,
		demoFactor: 1,
		offRouteStreak: 0
	})
}));
/** ดึงตำแหน่งรถตามโหมดที่เลือก + รัน watchdog แล้วเก็บผลลง live store */
async function checkGpsNow(trip, policy, continuousNow, at) {
	const { mode, apiConfig } = useGpsSettings.getState();
	const live = useGpsLive.getState();
	if (mode === "off") {
		live.setWatchdog(null);
		return null;
	}
	const nowAt = at ?? /* @__PURE__ */ new Date();
	live.setStatus("polling");
	try {
		let pos;
		if (mode === "demo") pos = demoPosition(trip, trip.status === "planned" ? nowAt : new Date(trip.clock), live.demoFactor);
		else if (mode === "device") pos = await devicePosition();
		else pos = await apiPosition(apiConfig);
		const wdBase = runWatchdog(trip, pos, policy, continuousNow, mode === "demo" ? new Date(trip.clock) : nowAt);
		const { quality, ageMin } = gpsQuality(pos, mode === "demo" ? new Date(trip.clock) : nowAt);
		wdBase.gpsQuality = quality;
		wdBase.gpsAgeMin = ageMin;
		const offNow = wdBase.offRouteKm > 1.5 && trip.status === "enroute";
		const live2 = useGpsLive.getState();
		const streak = offNow ? live2.offRouteStreak + 1 : 0;
		live2.setOffRouteStreak(streak);
		wdBase.offRouteStreak = streak;
		wdBase.offRoute = offNow && streak >= 2;
		const wd = useGpsSettings.getState().googleEnabled ? await enrichWithGoogle(trip, pos, wdBase, policy, continuousNow) : wdBase;
		live.setPosition(pos);
		live.setWatchdog(wd);
		live.setStatus("idle", null);
		return wd;
	} catch (e) {
		live.setStatus("error", e instanceof Error ? e.message : "เชื่อมต่อ GPS ไม่สำเร็จ");
		return null;
	}
}
var Route$2 = createFileRoute("/readiness")({ component: ReadinessPage });
var STATUS_META = {
	ready: {
		label: "พร้อมแล้ว",
		tone: "ok"
	},
	partial: {
		label: "พร้อมบางส่วน",
		tone: "warn"
	},
	missing: {
		label: "ยังไม่พร้อม",
		tone: "danger"
	},
	manual: {
		label: "ต้องทำเอง",
		tone: "muted"
	}
};
function StatusIcon({ status }) {
	if (status === "ready") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-ok" });
	if (status === "partial") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-warn" });
	if (status === "missing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-danger" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDashed, { className: "size-4 text-muted" });
}
function ReadinessPage() {
	const gpsMode = useGpsSettings((s) => s.mode);
	const googleEnabled = useGpsSettings((s) => s.googleEnabled);
	const googleMapsKey = useGpsSettings((s) => s.googleMapsKey);
	const telegramBotToken = useGpsSettings((s) => s.telegramBotToken);
	const telegramChatId = useGpsSettings((s) => s.telegramChatId);
	const [envStatus, setEnvStatus] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		integrationEnvStatus().then(setEnvStatus).catch(() => setEnvStatus(null));
	}, []);
	const googleOk = googleEnabled && (googleMapsKey.trim() !== "" || (envStatus?.googleEnvKey ?? false));
	const telegramOk = telegramBotToken.trim() !== "" && telegramChatId.trim() !== "" || envStatus?.telegramEnvToken && envStatus?.telegramEnvChat;
	const gpsOk = gpsMode === "api";
	const gpsPartial = gpsMode === "device";
	const stopsTotal = REST_STOPS.length;
	const stopsVerified = REST_STOPS.filter((s) => s.verification !== "must-verify" && s.verification !== "unverified").length;
	const rows = [
		{
			area: "Google Routes API (เวลาตามรถติดจริง)",
			status: googleOk ? "ready" : "missing",
			detail: googleOk ? "เปิดใช้แล้ว — เวลาคำนวณเส้นทาง/จุดพักใช้ข้อมูลรถติดจริง ณ ตอนกดคำนวณ" : "ยังไม่เปิด — ตอนนี้คำนวณด้วย OSRM ซึ่งไม่มีข้อมูลรถติด",
			how: "เปิดในหน้า โหมดคนขับ → เฝ้าระวัง GPS → ตั้งค่า → Google Maps (กรอก key หรือตั้ง env GOOGLE_MAPS_API_KEY ฝั่งเซิร์ฟเวอร์) พร้อมเปิด Routes API ใน Google Cloud Console"
		},
		{
			area: "Google Places API (จุดพักจริงริมทาง)",
			status: googleOk ? "ready" : "missing",
			detail: googleOk ? "พร้อม — ตอนรถติดจนไปไม่ถึงจุดพักเดิม ระบบจะค้นหาปั๊มน้ำมันจริงใกล้เส้นทางให้ด้วย" : "ยังไม่เปิด — จุดพักสำรองมาจากคลังข้อมูลภายในเท่านั้น",
			how: "ใช้ key เดียวกับ Routes API — เปิด Places API (New) ใน Google Cloud Console แล้วกด \"ทดสอบ key\" ในหน้าตั้งค่า"
		},
		{
			area: "ระบบ GPS ของรถจริง",
			status: gpsOk ? "ready" : gpsPartial ? "partial" : "missing",
			detail: gpsMode === "api" ? "ต่อระบบ GPS ผู้ให้บริการแล้ว (REST polling)" : gpsMode === "device" ? "ใช้ GPS มือถือคนขับ — พอสำหรับเที่ยวทดลอง แต่ไม่ครอบคลุมเวลารถหลายคัน" : gpsMode === "demo" ? "ยังใช้โหมดจำลองอยู่ — ห้ามใช้ตัดสินงานจริง" : "เฝ้าระวังปิดอยู่",
			how: "ข้อมูลจากผู้ให้บริการ GPS ของบริษัท (URL + header + ชื่อ field) กรอกในหน้าตั้งค่าเดียวกัน — token ของผู้ให้บริการควรอยู่ฝั่งเซิร์ฟเวอร์ ไม่ควรให้คนขับกรอกเอง"
		},
		{
			area: "Telegram แจ้งเตือนผู้ดูแล",
			status: telegramOk ? "ready" : envStatus ? "missing" : "partial",
			detail: telegramOk ? "ตั้งค่าแล้ว — เมื่อรถติดจนไปไม่ถึงจุดพักตามเวลา ระบบจะแจ้งเข้า Telegram ทันที" : "ยังไม่ตั้งค่า — เตือนเฉพาะเสียง/หน้าจอในเครื่องคนขับ",
			how: "สร้างบอทจาก @BotFather → token + chat id (ใส่ในหน้าตั้งค่า หรือตั้ง env TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID ฝั่งเซิร์ฟเวอร์แทนเพื่อความปลอดภัย)"
		},
		{
			area: `คลังจุดพัก (${stopsTotal} จุด) — ตรวจสอบรองรับรถจริง`,
			status: stopsVerified >= stopsTotal ? "ready" : stopsVerified > 0 ? "partial" : "manual",
			detail: `ยืนยันแล้ว ${stopsVerified}/${stopsTotal} จุด — Google รู้ว่าสถานที่อยู่ไหน แต่ไม่ได้รับประกันว่าลานรองรับรถ 10 ล้อ/พ่วง`,
			how: "ทีมปฏิบัติการลงพื้นที่/โทรยืนยันทีละจุด: ทางเข้า-ออกรถใหญ่, ที่จอด, ห้องน้ำ, ระยะเบี่ยงจากทางหลวง แล้วแก้ truckOk ใน src/lib/data/rest-stops.ts"
		},
		{
			area: "Google Cloud — ความปลอดภัยของ key และค่าใช้จ่าย",
			status: "manual",
			detail: "แอปเรียก Google ผ่านเซิร์ฟเวอร์เท่านั้น (key ไม่โผล่ในเบราว์เซอร์) และเรียกเฉพาะตอนคำนวณแผน/ตอนแจ้งเตือน — แต่การจำกัดสิทธิ์และโควตาต้องตั้งใน Google Cloud",
			how: "ตั้ง API restrictions (เปิดเฉพาะ Routes + Places), Application restrictions, Quota รายวัน และ Budget alert — แยก key dev/production"
		},
		{
			area: "ทดสอบเส้นทางจริง 3 เส้นทาง (pilot)",
			status: "manual",
			detail: "เทียบระยะทาง/เวลา OSRM vs Google vs เวลาจริง, จุดพักที่ไปถึงทัน, ค่าใช้จ่าย API ต่อเที่ยว",
			how: "1) วังน้อย → แหลมฉบัง 2) วังน้อย → นครสวรรค์ → เชียงใหม่ 3) เส้นที่รถติดประจำ — บันทึกผลแล้วปรับ buffer/ความเร็วเฉลี่ยในหน้านโยบาย"
		},
		{
			area: "Database กลาง + audit log (ใช้หลายคัน)",
			status: "manual",
			detail: "ตอนนี้ข้อมูลเที่ยววิ่ง/การตั้งค่าอยู่ในเครื่องแต่ละคน (localStorage) — ยังไม่เห็นข้อมูลข้ามเครื่องและยังไม่มี audit log เหตุการณ์",
			how: "ขยับไปเก็บ trips/events/settings บนฐานข้อมูลกลางที่มี auth เดียวต่อบริษัท ก่อนเปิดระบบหลายคัน"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "ข้อมูลที่ต้องเติมก่อนใช้งานจริง"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-relaxed text-muted",
				children: "ตารางนี้ตรวจสถานะอัตโนมัติจากระบบ (สีเขียว = พร้อม) ร่วมกับรายการที่ฝ่ายปฏิบัติการต้องทำเอง ปิดรายการให้ครบก่อนใช้กับรถจริงของ หจก.เผ่าปัญญา ทรานสปอร์ต ในงาน SCGJWD"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 space-y-3",
				children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "waybill rounded-2xl p-4 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusIcon, { status: r.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display font-semibold",
									children: r.area
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: STATUS_META[r.status].tone,
								children: STATUS_META[r.status].label
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed",
							children: r.detail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs leading-relaxed text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-primary",
								children: "วิธีเติม: "
							}), r.how]
						})
					]
				}, r.area))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "navy",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/drive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "size-4" }), "ไปหน้าโหมดคนขับ (ตั้งค่า Google/GPS ที่นั่น)"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/policy",
						children: "เปิดตารางช่องว่างนโยบาย"
					})
				})]
			})
		]
	});
}
var $$splitComponentImporter = () => import("./trip._id-Bn9vqEXE.mjs");
var Route$1 = createFileRoute("/trip/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$7.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$8
	}),
	AgentRoute: Route$6.update({
		id: "/agent",
		path: "/agent",
		getParentRoute: () => Route$8
	}),
	DriveRoute: Route$5.update({
		id: "/drive",
		path: "/drive",
		getParentRoute: () => Route$8
	}),
	PlanRoute: Route$4.update({
		id: "/plan",
		path: "/plan",
		getParentRoute: () => Route$8
	}),
	PolicyRoute: Route$3.update({
		id: "/policy",
		path: "/policy",
		getParentRoute: () => Route$8
	}),
	ReadinessRoute: Route$2.update({
		id: "/readiness",
		path: "/readiness",
		getParentRoute: () => Route$8
	}),
	TripIdRoute: Route$1.update({
		id: "/trip/$id",
		path: "/trip/$id",
		getParentRoute: () => Route$8
	})
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { useGpsSettings as a, PLACES as c, restRemainingMin as d, uid as f, useGpsLive as i, cn as l, useDesk as m, Route$1 as n, Badge as o, useActiveTrip as p, checkGpsNow as r, Button as s, router_exports as t, continuousNowOf as u };
