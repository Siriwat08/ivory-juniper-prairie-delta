import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Label, t as Input } from "./input-DgQMbaJy.mjs";
import { g as Plus, r as Trash2 } from "../_libs/lucide-react.mjs";
import { a as useGpsSettings, c as PLACES, f as uid, m as useDesk, s as Button } from "./router-DCm_HuB2.mjs";
import { t as computeRouteLegs } from "./route-B_NxLims.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-Bhe69KNS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function copyPlace(p, kind) {
	return {
		...p,
		id: uid(p.id),
		kind
	};
}
function PlannerForm() {
	const navigate = useNavigate();
	const createTrip = useDesk((s) => s.createTrip);
	const applyLegsAndPlan = useDesk((s) => s.applyLegsAndPlan);
	const [originId, setOriginId] = (0, import_react.useState)("scgjwd-wangnoi");
	const [destId, setDestId] = (0, import_react.useState)("chiangmai");
	const [waypointIds, setWaypointIds] = (0, import_react.useState)(["nakhonsawan"]);
	const [startLocal, setStartLocal] = (0, import_react.useState)("06:00");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	function place(id) {
		return PLACES.find((p) => p.id === id);
	}
	async function submit() {
		setError(null);
		const origin = copyPlace(place(originId), "origin");
		const destination = copyPlace(place(destId), "destination");
		const waypoints = waypointIds.filter(Boolean).map((id) => copyPlace(place(id), "waypoint"));
		if (origin.name === destination.name) {
			setError("ต้นทางกับปลายทางซ้ำกัน");
			return;
		}
		const startTime = toStartIso(startLocal);
		setBusy(true);
		const trip = createTrip({
			origin,
			waypoints,
			destination,
			startTime,
			title: `${origin.name} → ${destination.name}`
		});
		try {
			const gps = useGpsSettings.getState();
			const apiKey = gps.googleEnabled ? gps.googleMapsKey.trim() || void 0 : void 0;
			const routed = await computeRouteLegs({ data: {
				nodes: [
					origin,
					...waypoints,
					destination
				],
				apiKey
			} });
			if (routed.ok) applyLegsAndPlan(trip.id, routed.legs, routed.meta);
		} catch {} finally {
			setBusy(false);
			navigate({
				to: "/trip/$id",
				params: { id: trip.id }
			});
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "waybill space-y-5 rounded-[28px] p-5",
		onSubmit: (e) => {
			e.preventDefault();
			submit();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceSelect, {
				label: "ต้นทาง",
				value: originId,
				onChange: setOriginId,
				hint: "คลังลูกค้า SCGJWD ขึ้นก่อน"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "จุดแวะระหว่างทาง" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "inline-flex items-center gap-1 text-xs text-primary",
						onClick: () => setWaypointIds((w) => [...w, "khonkaen"]),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), "เพิ่มจุดแวะ"]
					})]
				}), waypointIds.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "ไม่มีจุดแวะ — วิ่งตรงไปปลายทาง"
				}) : waypointIds.map((id, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "h-11 flex-1 rounded-md border border-border bg-surface px-3 text-sm",
						value: id,
						onChange: (e) => setWaypointIds((w) => w.map((x, j) => j === i ? e.target.value : x)),
						children: PLACES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.clientSite ? `SCGJWD · ${p.name}` : p.name
						}, p.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						size: "icon",
						onClick: () => setWaypointIds((w) => w.filter((_, j) => j !== i)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
					})]
				}, `${id}-${i}`))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceSelect, {
				label: "ปลายทาง",
				value: destId,
				onChange: setDestId
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "เวลาเริ่มเดินทาง" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "time",
						value: startLocal,
						onChange: (e) => setStartLocal(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "ใช้เขตเวลาไทย · วันที่เป็นวันนี้หรือพรุ่งนี้ตามเวลาจริง"
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				variant: "navy",
				disabled: busy,
				className: "w-full sm:w-auto",
				children: busy ? "กำลังคำนวณเส้นทาง…" : "สร้างแผนตามกฎ 4 ชม. / 30 นาที"
			})
		]
	});
}
function PlaceSelect({ label, value, onChange, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				className: "flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm",
				value,
				onChange: (e) => onChange(e.target.value),
				children: PLACES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: p.id,
					children: p.clientSite ? `SCGJWD · ${p.name}` : p.name
				}, p.id))
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
function toStartIso(hhmm) {
	const [h, m] = hhmm.split(":").map(Number);
	const th = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
	const y = th.getFullYear();
	const mo = String(th.getMonth() + 1).padStart(2, "0");
	const d = String(th.getDate()).padStart(2, "0");
	return (/* @__PURE__ */ new Date(`${y}-${mo}-${d}T${String(h ?? 6).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}:00+07:00`)).toISOString();
}
function PlanPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_280px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "วางแผนเที่ยวขนส่ง"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-2xl text-sm text-muted",
				children: "เลือกคลังต้นทางของ SCGJWD จุดแวะ และปลายทาง เครื่องคำนวณจะแทรกจุดพักให้เอง ตามเพดาน 4 ชั่วโมง และพัก 30 นาที"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlannerForm, {})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "waybill h-fit rounded-[24px] p-5 text-sm leading-relaxed text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium text-fg",
				children: "สิ่งที่ระบบไม่ทำ"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 list-disc space-y-2 pl-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "ไม่ยืนยันว่าจุดพักในคลังมีที่จอดรถบรรทุกจริง" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "ไม่ใช้จราจรสด — ถ้าติดให้กดรายงานบนโต๊ะเที่ยว" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "ไม่แนะนำให้เร่งความเร็วเพื่อชดเชยเวลา" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "ไม่ถือว่ารอคิวหรือรถติดเป็นการพัก" })
				]
			})]
		})]
	});
}
//#endregion
export { PlanPage as component };
