import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as useRouter, Y as require_jsx_runtime, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as incompleteGapCount, l as policyFromPartial, r as addMinutes, t as DEFAULT_POLICY } from "./format-DF9o8tht.mjs";
import { r as planTrip, t as buildFallbackLegs } from "./rest-engine-DPAQxAYi.mjs";
import { g as ClipboardList, o as ShieldAlert, p as Compass, t as TriangleAlert, u as MessageSquareText } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CAHuqkNc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
var useDesk = create()(persist((set, get) => ({
	policy: DEFAULT_POLICY,
	trips: [seedSampleTrip(DEFAULT_POLICY)],
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
			events: [event("planned", "สร้างแผนเดินทาง")],
			continuousMin: 0,
			clock: startTime,
			currentStopSeq: 1,
			delayMin: 0,
			policySnapshot: policy
		};
		set({
			trips: [trip, ...get().trips],
			activeTripId: trip.id
		});
		return trip;
	},
	applyLegsAndPlan: (tripId, legs) => {
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
				plan
			};
		}) });
	},
	setActive: (id) => set({ activeTripId: id }),
	pushEvent: (tripId, type, label, extraMin) => {
		set({ trips: get().trips.map((t) => t.id === tripId ? {
			...t,
			events: [event(type, label, extraMin), ...t.events]
		} : t) });
	},
	startTrip: (tripId) => {
		set({ trips: get().trips.map((t) => t.id === tripId ? {
			...t,
			status: "enroute",
			continuousMin: 0,
			events: [event("depart", "เริ่มออกเดินทาง"), ...t.events]
		} : t) });
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
		set({ trips: get().trips.map((t) => t.id === tripId ? {
			...t,
			status: "resting",
			events: [event("rest-start", "เริ่มพัก — ยังไม่รีเซ็ตเวลาขับจนกว่าจะครบ"), ...t.events]
		} : t) });
	},
	finishRest: (tripId) => {
		const policy = get().policy;
		set({ trips: get().trips.map((t) => {
			if (t.id !== tripId) return t;
			const continuousMin = policy.restResetsDriving ? 0 : t.continuousMin;
			const clock = addMinutes(new Date(t.clock), policy.restMin).toISOString();
			return replan({
				...t,
				status: "enroute",
				delayMin: 0,
				events: [event("rest-done", `พักครบ ${policy.restMin} นาที — เริ่มรอบขับใหม่`), ...t.events]
			}, policy, {
				continuousMin,
				delayMin: 0,
				clock
			});
		}) });
	},
	completeTrip: (tripId) => {
		set({ trips: get().trips.map((t) => t.id === tripId ? {
			...t,
			status: "completed",
			events: [event("arrive", "ถึงปลายทาง"), ...t.events]
		} : t) });
	},
	advanceClock: (tripId, minutes) => {
		const policy = get().policy;
		set({ trips: get().trips.map((t) => {
			if (t.id !== tripId || t.status === "completed") return t;
			if (t.status === "resting") {
				const clock = addMinutes(new Date(t.clock), minutes).toISOString();
				return {
					...t,
					clock,
					events: [event("progress", `จำลองเวลาพัก +${minutes} นาที`), ...t.events]
				};
			}
			const continuousMin = t.continuousMin + minutes;
			const clock = addMinutes(new Date(t.clock), minutes).toISOString();
			const over = continuousMin >= policy.maxContinuousMin;
			return {
				...t,
				continuousMin,
				clock,
				events: [event("progress", over ? `จำลอง +${minutes} นาที — เวลาขับถึงเพดานแล้ว ต้องพัก` : `จำลองเวลาขับ +${minutes} นาที`), ...t.events]
			};
		}) });
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
var NAV = [
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
					className: "fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-surface/95 backdrop-blur-sm lg:hidden",
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
var styles_default = "/assets/styles-BPzRJzOh.css";
var APP_NAME = "เผ่าปัญญา Route Desk";
var Route$5 = createRootRoute({
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
var $$splitComponentImporter$4 = () => import("./routes-5xa11Bys.mjs");
var Route$4 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./agent-zsg-bRh3.mjs");
var Route$3 = createFileRoute("/agent")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./plan-BEGiZIEK.mjs");
var Route$2 = createFileRoute("/plan")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./policy-BP7O9aoI.mjs");
var Route$1 = createFileRoute("/policy")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./trip._id-DFP_xo74.mjs");
var Route = createFileRoute("/trip/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	AgentRoute: Route$3.update({
		id: "/agent",
		path: "/agent",
		getParentRoute: () => Route$5
	}),
	PlanRoute: Route$2.update({
		id: "/plan",
		path: "/plan",
		getParentRoute: () => Route$5
	}),
	PolicyRoute: Route$1.update({
		id: "/policy",
		path: "/policy",
		getParentRoute: () => Route$5
	}),
	TripIdRoute: Route.update({
		id: "/trip/$id",
		path: "/trip/$id",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { PLACES as a, useDesk as i, Route as n, cn as o, useActiveTrip as r, uid as s, router_exports as t };
