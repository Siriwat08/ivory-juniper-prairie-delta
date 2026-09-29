import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as formatDateTime, s as formatDuration, u as routeMetaText } from "./format-C_chUSPy.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { c as googleTestConnection, r as createSsrRpc } from "./google-B27hyiqN.mjs";
import { n as Label, t as Input } from "./input-DgQMbaJy.mjs";
import { D as Coffee, E as Compass, F as BookMarked, O as Clock3, P as CarFront, S as Map, T as Flag, _ as Play, b as Navigation, f as Save, h as RefreshCw, m as Route, n as TriangleAlert, o as Timer, p as Satellite, r as Trash2, s as Siren, u as Settings2, v as PenLine, w as MapPin, y as Pause } from "../_libs/lucide-react.mjs";
import { a as useGpsSettings, c as PLACES, d as restRemainingMin, i as useGpsLive, m as useDesk, o as Badge, r as checkGpsNow, s as Button, u as continuousNowOf } from "./router-DCm_HuB2.mjs";
import { t as computeRouteLegs } from "./route-B_NxLims.mjs";
import { t as RouteMap } from "./RouteMap-BYZnwrg-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/drive-CQL3Vdig.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ctx = null;
function ensureCtx() {
	if (typeof window === "undefined") return null;
	try {
		const AC = window.AudioContext ?? window.webkitAudioContext;
		if (!AC) return null;
		ctx ??= new AC();
		if (ctx.state === "suspended") ctx.resume();
		return ctx;
	} catch {
		return null;
	}
}
function beepOnce(startAt, freq = 880, durMs = 180, volume = .22) {
	const c = ensureCtx();
	if (!c) return;
	const osc = c.createOscillator();
	const gain = c.createGain();
	osc.type = "sine";
	osc.frequency.value = freq;
	const t0 = c.currentTime + startAt;
	gain.gain.setValueAtTime(1e-4, t0);
	gain.gain.exponentialRampToValueAtTime(volume, t0 + .02);
	gain.gain.exponentialRampToValueAtTime(1e-4, t0 + durMs / 1e3);
	osc.connect(gain).connect(c.destination);
	osc.start(t0);
	osc.stop(t0 + durMs / 1e3 + .05);
}
/** เสียงเตือนระดับเฝ้าระวัง (บีบสั้น 1 ครั้ง) */
function alertWatchBeep() {
	beepOnce(0, 760, 150, .15);
}
/** เสียงเตือนระดับต้องดำเนินการ (บีบ 3 ครั้ง เสียงสูง) + สั่นเครื่อง */
function alertActBeep() {
	beepOnce(0, 960, 200);
	beepOnce(.28, 960, 200);
	beepOnce(.56, 1180, 320);
	vibrate();
}
function vibrate(pattern = [
	350,
	150,
	350,
	150,
	700
]) {
	try {
		if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
	} catch {}
}
/**
* ส่งข้อความแจ้งเตือนเข้า Telegram (ทางเซิร์ฟเวอร์ — token ไม่โผล่ในฝั่งคนขับถ้าตั้ง env)
* ตั้งค่าบนเซิร์ฟเวอร์ได้ที่ env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
*/
var sendTelegram = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("29928070137f19f70d54ef51d806d8976f73f77f0bcdeaa6d0e5d4c9d28d1dbb"));
var POLL_MS = 42e4;
function mmss(min) {
	const total = Math.max(0, Math.round(min * 60));
	return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
/**
* Wake Lock: กันมือถือคนขับปิดหน้าจอเองระหว่างเที่ยววิ่ง
* นาฬิกาขับต่อเนื่อง/นับถอยหลังพัก 30:00 จะได้เห็นตลอด
* (เบราว์เซอร์ที่ไม่รองรับจะเงียบ ๆ ไม่มีผลอะไร)
*/
function useWakeLock(active) {
	const [held, setHeld] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!active || typeof navigator === "undefined") return;
		const wakeLock = navigator.wakeLock;
		if (!wakeLock) return;
		let lock = null;
		let cancelled = false;
		const request = async () => {
			try {
				if (cancelled || lock || document.visibilityState !== "visible") return;
				lock = await wakeLock.request("screen");
				lock.addEventListener("release", () => {
					lock = null;
					setHeld(false);
				});
				setHeld(true);
			} catch {
				setHeld(false);
			}
		};
		const onVisible = () => {
			if (document.visibilityState === "visible") request();
		};
		document.addEventListener("visibilitychange", onVisible);
		request();
		return () => {
			cancelled = true;
			document.removeEventListener("visibilitychange", onVisible);
			lock?.release().catch(() => {});
			lock = null;
		};
	}, [active]);
	return held;
}
function DrivingStep({ trip, policy, onDone }) {
	const startRest = useDesk((s) => s.startRest);
	const finishRest = useDesk((s) => s.finishRest);
	const completeTrip = useDesk((s) => s.completeTrip);
	const advanceClock = useDesk((s) => s.advanceClock);
	const replaceNextRest = useDesk((s) => s.replaceNextRest);
	const gpsMode = useGpsSettings((s) => s.mode);
	const setGpsMode = useGpsSettings((s) => s.setMode);
	const wd = useGpsLive((s) => s.watchdog);
	const gpsStatus = useGpsLive((s) => s.status);
	const gpsError = useGpsLive((s) => s.error);
	const lastCheckAt = useGpsLive((s) => s.lastCheckAt);
	const demoFactor = useGpsLive((s) => s.demoFactor);
	const setDemoFactor = useGpsLive((s) => s.setDemoFactor);
	const pos = useGpsLive((s) => s.pos);
	const [nowMs, setNowMs] = (0, import_react.useState)(() => Date.now());
	const [showAlt, setShowAlt] = (0, import_react.useState)(false);
	const [altChoice, setAltChoice] = (0, import_react.useState)(null);
	const [showSettings, setShowSettings] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)(null);
	const lastLevel = (0, import_react.useRef)("off");
	const wakeHeld = useWakeLock(trip.status === "enroute" || trip.status === "resting");
	const continuousNow = continuousNowOf(trip);
	const restLeft = restRemainingMin(trip, policy);
	const remainingDrive = Math.max(0, policy.maxContinuousMin - continuousNow);
	const budgetPct = Math.min(100, Math.max(0, continuousNow / policy.maxContinuousMin * 100));
	(0, import_react.useEffect)(() => {
		const t = setInterval(() => setNowMs(Date.now()), 1e3);
		return () => clearInterval(t);
	}, []);
	(0, import_react.useEffect)(() => {
		if (trip.status === "completed" || gpsMode === "off") return;
		let alive = true;
		const run = async () => {
			const result = await checkGpsNow(trip, policy, continuousNowOf(trip));
			if (!alive || !result) return;
			if (lastLevel.current !== "act" && result.level === "act") {
				alertActBeep();
				notifyOwner(trip, result);
				setShowAlt(true);
			} else if (lastLevel.current !== "watch" && result.level === "watch") alertWatchBeep();
			lastLevel.current = result.level;
		};
		run();
		const t = setInterval(run, POLL_MS);
		return () => {
			alive = false;
			clearInterval(t);
		};
	}, [
		trip.id,
		trip.status,
		gpsMode
	]);
	const nextRest = trip.plan.stops.find((s) => s.type === "rest" && s.start > new Date(nowMs).toISOString()) ?? null;
	async function manualCheck() {
		const result = await checkGpsNow(trip, policy, continuousNowOf(trip));
		if (!result) return;
		if (lastLevel.current !== "act" && result.level === "act") {
			alertActBeep();
			notifyOwner(trip, result);
			setShowAlt(true);
		} else if (lastLevel.current !== "watch" && result.level === "watch") alertWatchBeep();
		lastLevel.current = result.level;
	}
	function simulateMinutes() {
		advanceClock(trip.id, 30);
		setTimeout(() => void manualCheck(), 60);
	}
	function simulateTraffic() {
		setDemoFactor(demoFactor + .4);
		setNote("จำลองรถหน่วงขึ้นแล้ว — กด \"เช็คตอนนี้\" เพื่อดูผลเฝ้าระวัง");
		setTimeout(() => void manualCheck(), 60);
	}
	function confirmAlternative() {
		const chosen = wd?.alternatives.find((a) => a.id === altChoice) ?? wd?.alternatives[0];
		if (!chosen) return;
		replaceNextRest(trip.id, chosen);
		setShowAlt(false);
		setAltChoice(null);
		setNote(`เปลี่ยนจุดพักเป็น "${chosen.name}" แล้ว — แผนถัดไปเป็นประมาณการ`);
		sendTelegram({ data: { text: `✅ [Route Desk] เที่ยว ${trip.code}\nเปลี่ยนจุดพักเป็น ${chosen.name} แล้ว` } }).then((r) => {
			if (!r.ok) setNote(`เปลี่ยนจุดพักแล้ว (แต่แจ้ง Telegram ไม่สำเร็จ: ${r.error})`);
		});
		setTimeout(() => void manualCheck(), 80);
	}
	const modeChip = {
		off: {
			label: "เฝ้าระวังปิดอยู่",
			tone: "muted"
		},
		demo: {
			label: "โหมดจำลอง",
			tone: "warn"
		},
		device: {
			label: "GPS เครื่องนี้",
			tone: "ok"
		},
		api: {
			label: "ระบบ GPS ผู้ให้บริการ",
			tone: "ok"
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill rounded-[28px] p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-medium uppercase tracking-wider text-muted",
							children: [trip.code, " · กำลังเดินทาง"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: trip.title
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: trip.status === "resting" ? "rest" : "primary",
							children: trip.status === "resting" ? "พักอยู่" : trip.status === "enroute" ? "ขับอยู่" : trip.status === "completed" ? "ถึงปลายทางแล้ว" : "ยังไม่เริ่ม"
						})]
					}),
					wakeHeld ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 inline-flex items-center gap-1 rounded-full bg-ok-fg px-2 py-0.5 text-[11px] text-ok",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-3" }), "ป้องกันหน้าจอปิดอยู่ — นาฬิกาจะเดินต่อเนื่องระหว่างเที่ยว"]
					}) : null,
					trip.status === "resting" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 rounded-2xl bg-rest-fg p-5 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-rest",
								children: "กำลังพัก — ห้ามออกเดินทางก่อนครบ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-display text-5xl font-semibold tabular-nums text-rest",
								children: mmss(restLeft ?? 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-rest/80",
								children: restLeft !== null && restLeft <= 0 ? "พักครบ 30 นาทีแล้ว — ยืนยันออกเดินทางต่อได้เลย" : "เมื่อครบ 30 นาที ปุ่ม \"ออกเดินทางต่อ\" จะเปิดให้กด"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-end justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted",
									children: "เวลาขับต่อเนื่องที่เหลือ (เพดาน 4 ชม.)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs tabular-nums text-muted",
									children: [
										"ขับแล้ว ",
										Math.round(continuousNow),
										" นาที"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `font-display text-6xl font-semibold tabular-nums leading-none ${remainingDrive <= 15 ? "text-danger" : remainingDrive <= 60 ? "text-warn" : "text-fg"}`,
								children: mmss(remainingDrive)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: `h-full rounded-full transition-all ${budgetPct > 90 ? "bg-danger" : budgetPct > 70 ? "bg-warn-fg" : "bg-primary"}`,
									style: { width: `${budgetPct}%` }
								})
							})
						]
					}),
					nextRest && trip.status !== "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex items-start gap-3 rounded-2xl border border-border bg-surface-2/60 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, { className: "mt-0.5 size-5 text-rest" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs uppercase tracking-wider text-muted",
									children: "จุดพักถัดไปที่ต้องแวะ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: nextRest.place.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										"ถึงโดยประมาณ ",
										formatDateTime(nextRest.start),
										" · พัก ",
										nextRest.restMin,
										" นาที"
									]
								})
							]
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid gap-2 sm:grid-cols-2",
						children: [
							trip.status === "enroute" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "navy",
								size: "lg",
								onClick: () => startRest(trip.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, {}), "เริ่มพัก 30 นาที"]
							}) : null,
							trip.status === "resting" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "navy",
								size: "lg",
								disabled: (restLeft ?? 0) > 0,
								onClick: () => finishRest(trip.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), "ออกเดินทางต่อ"]
							}) : null,
							trip.status !== "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "lg",
								onClick: () => completeTrip(trip.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {}), "ถึงปลายทางแล้ว"]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "navy",
								size: "lg",
								onClick: onDone,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {}), "สรุปเที่ยววิ่ง & กลับหน้าหลัก"]
							})
						]
					}),
					note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-primary",
						children: note
					}) : null
				]
			}),
			gpsMode !== "off" && wd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: `rounded-[28px] border p-5 ${wd.level === "act" ? "border-danger/40 bg-danger-fg" : wd.level === "watch" ? "border-warn/40 bg-warn-fg" : "border-border bg-surface"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [wd.level === "act" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Siren, { className: "mt-0.5 size-5 text-danger" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: `mt-0.5 size-5 ${wd.level === "watch" ? "text-warn" : "text-ok-fg"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold",
									children: wd.level === "act" ? "ต้องดำเนินการทันที" : wd.level === "watch" ? "เฝ้าระวัง" : "สถานะปกติ"
								}), wd.etaSource === "google" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: "primary",
									children: "เวลาจากข้อมูลรถติดจริง (Google)"
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed",
								children: wd.message
							}),
							wd.googleError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									"Google: ",
									wd.googleError,
									" — ชั่วคราวใช้การประมาณจากเส้นทางแทน"
								]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-2 text-xs text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"ความคืบหน้า ",
										Math.round(wd.progressFrac * 100),
										"%"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"· ล่าช้า ~",
										Math.round(wd.delayMin),
										" นาที"
									] }),
									wd.nextRestName ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"· จุดพักถัดไป ",
										Math.round(wd.nextRestEtaMin ?? 0),
										" นาที"
									] }) : null
								]
							}),
							wd.offRoute ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-xl border border-warn/40 bg-warn-fg p-3 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium text-warn",
									children: [
										"ตรวจพบออกนอกเส้นทาง (ยืนยันจาก ",
										wd.offRouteStreak,
										" รอบเช็คต่อเนื่อง)"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-muted",
									children: [
										"เหลื่อมจากเส้นทาง ~",
										wd.offRouteKm.toFixed(1),
										" กม. — อาจเบี่ยงไปแวะ/เลี่ยงถนน ให้ตรวจสอบตำแหน่งจริงก่อนตัดสินใจ (ระบบจะเตือนเมื่อกลับเข้าเส้นทางหรือเหลื่อมต่อเนื่อง)"
									]
								})]
							}) : null,
							wd.level === "act" && wd.alternatives.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "danger",
								className: "mt-3",
								onClick: () => setShowAlt(true),
								children: [
									"ดูจุดพักแนะนำ (",
									wd.alternatives.length,
									")"
								]
							}) : null
						]
					})]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill rounded-[28px] p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Satellite, { className: "size-4 text-muted" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display font-semibold",
									children: "เฝ้าระวังรถติด (GPS)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: modeChip[gpsMode].tone,
									children: modeChip[gpsMode].label
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "inline-flex items-center gap-1 text-xs text-primary",
							onClick: () => setShowSettings((v) => !v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-3.5" }), "ตั้งค่า"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: [
							["off", "ปิด"],
							["demo", "จำลอง (ทดสอบ)"],
							["device", "GPS เครื่องนี้"],
							["api", "ระบบ GPS จริง"]
						].map(([m, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: gpsMode === m ? "navy" : "outline",
							onClick: () => {
								setGpsMode(m);
								lastLevel.current = "off";
							},
							children: label
						}, m))
					}),
					gpsMode !== "off" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 space-y-1 text-sm",
						children: [
							gpsStatus === "error" && gpsError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-danger",
								children: ["ผิดพลาด: ", gpsError]
							}) : null,
							pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted",
								children: [
									"ตำแหน่งล่าสุด ",
									pos.lat.toFixed(4),
									", ",
									pos.lng.toFixed(4),
									" · เช็คเมื่อ",
									" ",
									lastCheckAt ? formatDateTime(lastCheckAt) : "-"
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-muted",
								children: "ยังไม่มีตำแหน่ง — กด \\\"เช็คตอนนี้\\\" เพื่อดึงครั้งแรก"
							}),
							pos && wd ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: wd.gpsQuality === "fresh" ? "ok" : wd.gpsQuality === "stale" ? "warn" : "danger",
									children: wd.gpsQuality === "fresh" ? "GPS สด" : wd.gpsQuality === "stale" ? "GPS เก่า" : "GPS ใช้ไม่ได้"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted",
									children: [
										"อายุ ",
										wd.gpsAgeMin < 1 ? "ไม่ถึง 1" : Math.round(wd.gpsAgeMin),
										" นาที",
										wd.gpsAccuracyM != null ? ` · ความแม่น ±${Math.round(wd.gpsAccuracyM)} ม.` : "",
										wd.gpsQuality !== "fresh" ? " — ระบบจะไม่ตัดสินแผนจากตำแหน่งนี้จนกว่า GPS จะกลับมาสด" : ""
									]
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: "เช็คอัตโนมัติทุก 7 นาทีระหว่างเที่ยววิ่ง"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => void manualCheck(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, {}), "เช็คตอนนี้"]
						}), gpsMode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: simulateMinutes,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timer, {}), "จำลอง +30 นาที"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "warn",
							onClick: simulateTraffic,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CarFront, {}), "จำลองรถติดขึ้น"]
						})] }) : null]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "เปิดเพื่อให้ระบบคอยเทียบตำแหน่งรถกับแผน — ถ้ารถติดจนไปไม่ถึงจุดพักเดิมตามเวลา ระบบจะเตือนพร้อมจุดพักแนะนำทันที"
					}),
					showSettings ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GpsSettingsPanel, { onSaved: () => setNote("บันทึกการตั้งค่าแล้ว") }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill rounded-[28px] p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display font-semibold",
					children: "บันทึกเหตุการณ์ล่าสุด"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: trip.events.slice(0, 6).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 tabular-nums text-muted",
							children: formatDateTime(e.at)
						})]
					}, e.id))
				})]
			}),
			showAlt && wd && wd.alternatives.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "waybill w-full max-w-lg rounded-[24px] bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "mt-0.5 size-5 text-danger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg font-semibold text-danger",
								children: "จะไปไม่ถึงจุดพักเดิมตามเวลา"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: "เลือกจุดพักใหม่ที่ระบบคำนวณแล้วว่าไปทันภายในเวลาขับที่เหลือ จากนั้นแผนจะปรับให้ทันที"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2",
							children: wd.alternatives.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: `flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${altChoice === a.id || !altChoice && a === wd.alternatives[0] ? "border-primary bg-primary/5" : "border-border"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "alt-rest",
									className: "mt-1",
									checked: altChoice === a.id || !altChoice && a === wd.alternatives[0],
									onChange: () => setAltChoice(a.id)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-medium",
										children: a.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block text-xs text-muted",
										children: [
											a.note,
											a.address ? ` · ${a.address}` : "",
											a.highway ? ` · ${a.highway}` : ""
										]
									})]
								})]
							}) }, a.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "navy",
								className: "flex-1",
								onClick: confirmAlternative,
								children: "ยืนยันจุดพักใหม่"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setShowAlt(false),
								children: "ปิด"
							})]
						})
					]
				})
			}) : null
		]
	});
}
async function notifyOwner(trip, result) {
	const pos = useGpsLive.getState().pos;
	await sendTelegram({ data: { text: [
		`🚨 [Route Desk] เที่ยว ${trip.code}`,
		`รถติด! คาดว่าจะไปไม่ถึงจุดพักเดิมตามเวลา`,
		result.nextRestName ? `จุดพักเดิม: ${result.nextRestName}` : "",
		`ล่าช้าสะสม ~${Math.round(result.delayMin)} นาที · เวลาขับที่เหลือ ${Math.round(result.remainingDriveMin)} นาที`,
		pos ? `พิกัดรถ: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : "",
		pos ? `แผนที่: https://maps.google.com/?q=${pos.lat},${pos.lng}` : ""
	].filter(Boolean).join("\n") } });
}
function GpsSettingsPanel({ onSaved }) {
	const apiConfig = useGpsSettings((s) => s.apiConfig);
	const setApiConfig = useGpsSettings((s) => s.setApiConfig);
	const botToken = useGpsSettings((s) => s.telegramBotToken);
	const chatId = useGpsSettings((s) => s.telegramChatId);
	const setTelegram = useGpsSettings((s) => s.setTelegram);
	const googleMapsKey = useGpsSettings((s) => s.googleMapsKey);
	const googleEnabled = useGpsSettings((s) => s.googleEnabled);
	const setGoogle = useGpsSettings((s) => s.setGoogle);
	const [url, setUrl] = (0, import_react.useState)(apiConfig.url);
	const [method, setMethod] = (0, import_react.useState)(apiConfig.method);
	const [headersJson, setHeadersJson] = (0, import_react.useState)(apiConfig.headersJson);
	const [bodyJson, setBodyJson] = (0, import_react.useState)(apiConfig.bodyJson);
	const [latPath, setLatPath] = (0, import_react.useState)(apiConfig.latPath);
	const [lngPath, setLngPath] = (0, import_react.useState)(apiConfig.lngPath);
	const [speedPath, setSpeedPath] = (0, import_react.useState)(apiConfig.speedPath);
	const [accuracyPath, setAccuracyPath] = (0, import_react.useState)(apiConfig.accuracyPath);
	const [token, setToken] = (0, import_react.useState)(botToken);
	const [chat, setChat] = (0, import_react.useState)(chatId);
	const [googleKey, setGoogleKey] = (0, import_react.useState)(googleMapsKey);
	const [googleOn, setGoogleOn] = (0, import_react.useState)(googleEnabled);
	const [googleTesting, setGoogleTesting] = (0, import_react.useState)(false);
	const [googleTestNote, setGoogleTestNote] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 space-y-4 rounded-2xl border border-border bg-surface-2/40 p-4 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "ต่อระบบ GPS ผู้ให้บริการ (REST)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "กรอกตามเอกสาร API ของผู้ให้บริการ — เช่น URL ตำแหน่งล่าสุดของรถ, header สำหรับ key และชื่อ field ของพิกัดในผลลัพธ์ JSON"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:grid-cols-[1fr_110px]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "https://api.example.com/positions?vehicle=...",
								value: url,
								onChange: (e) => setUrl(e.target.value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "h-11 rounded-md border border-border bg-surface px-3 text-sm",
								value: method,
								onChange: (e) => setMethod(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "GET",
									children: "GET"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "POST",
									children: "POST"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Headers (JSON) เช่น {\"Authorization\": \"Bearer xxx\"}",
							value: headersJson,
							onChange: (e) => setHeadersJson(e.target.value)
						}),
						method === "POST" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Body (JSON) เช่น {\"vehicleId\":\"รถ-01\"}",
							value: bodyJson,
							onChange: (e) => setBodyJson(e.target.value)
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "lat path",
									value: latPath,
									onChange: (e) => setLatPath(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "lng path",
									value: lngPath,
									onChange: (e) => setLngPath(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "speed path (ถ้ามี)",
									value: speedPath,
									onChange: (e) => setSpeedPath(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "accuracy path (ถ้ามี)",
									value: accuracyPath,
									onChange: (e) => setAccuracyPath(e.target.value)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								"ตัวอย่าง: ถ้า API ตอบ ",
								"{",
								"\"d\":[",
								"{",
								"\"lat\":14.2,\"lng\":100.7",
								"}",
								"]",
								"}",
								" → ใส่ lat path เป็น d.0.lat · accuracy หน่วยเมตร (เช่น acc) ช่วยให้ระบบรู้ว่า GPS แม่นพอจะเชื่อได้ไหม"
							]
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: "แจ้งเจ้าของผ่าน Telegram"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "สร้างบอทจาก @BotFather → ได้ token → ส่งข้อความถึงบอท 1 ครั้ง → หา chat id จาก @userinfobot แล้ววางที่นี่ (หรือตั้ง env TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID บนเซิร์ฟเวอร์แทนได้)"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-2 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Bot token จาก @BotFather",
						value: token,
						onChange: (e) => setToken(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Chat id ของคุณ/กลุ่ม",
						value: chat,
						onChange: (e) => setChat(e.target.value)
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "Google Maps — รถติดจริง + จุดพักจริง"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex cursor-pointer items-center gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: googleOn,
							onChange: (e) => setGoogleOn(e.target.checked)
						}), "เปิดใช้งาน"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: "เปิดแล้วระบบจะเช็คเวลาถึงจุดพักด้วยข้อมูลรถติดจริง (Routes API) และค้นหาปั๊มน้ำมันจริง ใกล้เส้นทางตอนไปไม่ทัน (Places API) — ต้องเปิด API สองตัวนี้ใน Google Cloud Console สำหรับ key นี้ด้วย ถ้าไม่กรอก key ที่นี่ ระบบจะใช้ GOOGLE_MAPS_API_KEY จากฝั่งเซิร์ฟเวอร์แทน"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						placeholder: "Google Maps API key (AIza...)",
						value: googleKey,
						onChange: (e) => setGoogleKey(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							disabled: googleTesting,
							onClick: () => {
								setGoogleTesting(true);
								setGoogleTestNote(null);
								googleTestConnection({ data: { apiKey: googleKey.trim() || void 0 } }).then((r) => {
									setGoogleTestNote(r.ok ? `ผ่าน! เจอจุดพักจริง ${r.stops.length} จุดรอบพื้นที่ทดสอบ (ปตท. วังน้อย)` : `ยังไม่ผ่าน: ${r.error}`);
								}).catch(() => setGoogleTestNote("ยังไม่ผ่าน: เรียก Google API ไม่สำเร็จ")).finally(() => setGoogleTesting(false));
							},
							children: googleTesting ? "กำลังทดสอบ..." : "ทดสอบ key"
						}), googleTestNote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 text-xs text-muted",
							children: googleTestNote
						}) : null]
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "navy",
				size: "sm",
				onClick: () => {
					setApiConfig({
						url,
						method,
						headersJson,
						bodyJson,
						latPath,
						lngPath,
						speedPath,
						accuracyPath
					});
					setTelegram(token.trim(), chat.trim());
					setGoogle(googleKey.trim(), googleOn);
					onSaved();
				},
				children: "บันทึกการตั้งค่า"
			})
		]
	});
}
function copyPlace(p, kind) {
	return {
		...p,
		kind: kind ?? p.kind
	};
}
function bangkokNowHHMM() {
	return (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB", {
		timeZone: "Asia/Bangkok",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
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
function PlaceSelect({ label, value, onChange, hint, optional = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: "flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm",
				value,
				onChange: (e) => onChange(e.target.value),
				children: [optional ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: "— ไม่มี —"
				}) : null, PLACES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: p.id,
					children: p.clientSite ? `SCGJWD · ${p.name}` : p.name
				}, p.id))]
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
function DrivePage() {
	const navigate = useNavigate();
	const hydrated = useDesk((s) => s.hydrated);
	const trips = useDesk((s) => s.trips);
	const [step, setStep] = (0, import_react.useState)("select");
	const [tripId, setTripId] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const resumed = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!hydrated || resumed.current) return;
		resumed.current = true;
		const active = trips.find((t) => t.status === "enroute" || t.status === "resting");
		if (active) {
			setTripId(active.id);
			setStep("driving");
		}
	}, [hydrated, trips]);
	const trip = trips.find((t) => t.id === tripId) ?? null;
	if (!hydrated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "waybill rounded-[28px] p-8 text-center text-sm text-muted",
		children: "กำลังเปิดโหมดคนขับ…"
	});
	if (step === "driving" && trip) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DrivingStep, {
			trip,
			policy: trip.policySnapshot,
			onDone: () => {
				setTripId(null);
				setStep("select");
				navigate({ to: "/" });
			}
		})
	});
	if (step === "summary" && pending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryStep, {
			pending,
			onBack: () => setStep("select"),
			onCalculated: (id) => {
				setTripId(id);
				setStep("result");
			}
		})
	});
	if (step === "result" && trip) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultStep, {
			tripId: trip.id,
			onStart: () => setStep("driving"),
			onBack: () => setStep("select")
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-3xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectStep, { onUseSaved: (r) => {
			setPending(r);
			setStep("summary");
		} })
	});
}
function SelectStep({ onUseSaved }) {
	const savedRoutes = useDesk((s) => s.savedRoutes);
	const deleteSavedRoute = useDesk((s) => s.deleteSavedRoute);
	const [originId, setOriginId] = (0, import_react.useState)("scgjwd-wangnoi");
	const [destId, setDestId] = (0, import_react.useState)("scgjwd-lcb");
	const [waypointId, setWaypointId] = (0, import_react.useState)("");
	const [startLocal, setStartLocal] = (0, import_react.useState)(bangkokNowHHMM());
	const [error, setError] = (0, import_react.useState)(null);
	function place(id) {
		return PLACES.find((p) => p.id === id);
	}
	function startCustom() {
		setError(null);
		if (!originId || !destId) {
			setError("เลือกต้นทางและปลายทางก่อน");
			return;
		}
		const origin = copyPlace(place(originId), "origin");
		const destination = copyPlace(place(destId), "destination");
		const waypoints = waypointId ? [copyPlace(place(waypointId), "waypoint")] : [];
		if (origin.name === destination.name) {
			setError("ต้นทางกับปลายทางซ้ำกัน");
			return;
		}
		onUseSaved({
			origin,
			waypoints,
			destination,
			title: `${origin.name} → ${destination.name}`,
			startLocal
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill rounded-[28px] p-5 sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Route, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-semibold",
						children: "โหมดคนขับ"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: ["เลือกเส้นทางที่บันทึกไว้ หรือสร้างเส้นทางเอง — ระบบจะคำนวณระยะทาง เวลาเดินทาง และจุดพักบังคับ (ขับไม่เกิน 4 ชม. ต่อรอบ) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "ก็ต่อเมื่อกดปุ่ม \"คำนวณเส้นทาง\" เท่านั้น" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill rounded-[28px] p-5 sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookMarked, { className: "size-4 text-primary" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display font-semibold",
							children: "เส้นทางที่บันทึกไว้"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							tone: "muted",
							children: [savedRoutes.length, " เส้นทาง"]
						})
					]
				}), savedRoutes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "ยังไม่มีเส้นทางที่บันทึกไว้ — สร้างจากแบบกำหนดเองด้านล่าง แล้วกด \"บันทึกเส้นทางนี้\" ครั้งถัดไปจะเลือกใช้ซ้ำได้เลย"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-3",
					children: savedRoutes.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-2xl border border-border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: r.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted",
										children: [
											r.origin.name,
											r.waypoints.length > 0 ? ` → ${r.waypoints.map((w) => w.name).join(" → ")}` : "",
											" →",
											" ",
											r.destination.name
										]
									}),
									r.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted",
										children: r.note
									}) : null
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "ลบเส้นทางที่บันทึกไว้",
								className: "rounded-md p-1.5 text-muted hover:bg-surface-2",
								onClick: () => deleteSavedRoute(r.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "navy",
							size: "sm",
							className: "mt-3",
							onClick: () => onUseSaved({
								origin: r.origin,
								waypoints: r.waypoints,
								destination: r.destination,
								title: r.title,
								startLocal: bangkokNowHHMM()
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), "ใช้เส้นทางนี้"]
						})]
					}, r.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill rounded-[28px] p-5 sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display font-semibold",
						children: "สร้างเส้นทางเอง"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 space-y-4",
					onSubmit: (e) => {
						e.preventDefault();
						startCustom();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceSelect, {
							label: "ต้นทาง",
							value: originId,
							onChange: setOriginId,
							hint: "คลังลูกค้า SCGJWD ขึ้นก่อน"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceSelect, {
							label: "จุดแวะระหว่างทาง (ถ้ามี)",
							value: waypointId,
							onChange: setWaypointId,
							optional: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaceSelect, {
							label: "ปลายทาง",
							value: destId,
							onChange: setDestId
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "เวลาออกเดินทาง" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									value: startLocal,
									onChange: (e) => setStartLocal(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "เขตเวลาไทย · เมื่อกด \"เริ่มเดินทาง\" ระบบจะยึดเวลาจริงตอนนั้นเป็นหลัก"
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
							className: "w-full sm:w-auto",
							children: "ไปตรวจเส้นทาง"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-xs text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "underline",
					children: "กลับหน้าโต๊ะปฏิบัติการ"
				})
			})
		]
	});
}
function SummaryStep({ pending, onBack, onCalculated }) {
	const createTrip = useDesk((s) => s.createTrip);
	const applyLegsAndPlan = useDesk((s) => s.applyLegsAndPlan);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function calculate() {
		setBusy(true);
		try {
			const trip = createTrip({
				origin: pending.origin,
				waypoints: pending.waypoints,
				destination: pending.destination,
				startTime: toStartIso(pending.startLocal),
				title: pending.title
			});
			try {
				const gps = useGpsSettings.getState();
				const apiKey = gps.googleEnabled ? gps.googleMapsKey.trim() || void 0 : void 0;
				const routed = await computeRouteLegs({ data: {
					nodes: [
						pending.origin,
						...pending.waypoints,
						pending.destination
					],
					apiKey
				} });
				if (routed.ok) applyLegsAndPlan(trip.id, routed.legs, routed.meta);
			} catch {}
			onCalculated(trip.id);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "waybill rounded-[28px] p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-semibold",
						children: pending.title
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 size-4 text-muted" }),
								"ต้นทาง: ",
								pending.origin.name
							]
						}),
						pending.waypoints.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 size-4 text-muted" }),
								"จุดส่ง: ",
								w.name
							]
						}, w.id)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 size-4 text-muted" }),
								"ปลายทาง: ",
								pending.destination.name
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "mt-0.5 size-4 text-muted" }),
								"ขาออกช่วง ",
								pending.startLocal,
								" น. (ไทย)"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-2xl bg-surface-2/60 p-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: "ยังไม่มีการคำนวณใด ๆ ในขั้นนี้"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted",
						children: "กด \"คำนวณเส้นทาง\" — ระบบจะเรียกแผนที่ (Google ถ้าเปิดใช้ในหน้าตั้งค่า หรือ OSRM ถ้าไม่มี) คำนวณระยะทาง เวลาเดินทาง และจุดพักที่ต้องแวะตามกฎ ขับ 4 ชม. → พัก 30 นาที ให้ครั้งเดียว ณ ตอนนั้น"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "navy",
						size: "lg",
						disabled: busy,
						onClick: () => void calculate(),
						children: busy ? "กำลังคำนวณเส้นทาง…" : "คำนวณเส้นทาง"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "lg",
						onClick: onBack,
						disabled: busy,
						children: "เลือกเส้นทางใหม่"
					})]
				})
			]
		})
	});
}
function ResultStep({ tripId, onStart, onBack }) {
	const trip = useDesk((s) => s.trips.find((t) => t.id === tripId)) ?? null;
	const saveRouteFromTrip = useDesk((s) => s.saveRouteFromTrip);
	const startTrip = useDesk((s) => s.startTrip);
	const [saved, setSaved] = (0, import_react.useState)(false);
	if (!trip) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "waybill rounded-[28px] p-6 text-sm text-muted",
		children: "ไม่พบเที่ยววิ่งนี้"
	});
	const restStops = trip.plan.stops.filter((s) => s.type === "rest");
	const totalMin = (new Date(trip.plan.eta).getTime() - new Date(trip.startTime).getTime()) / 6e4;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill rounded-[28px] p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "navy",
							children: "ประมาณการ"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: trip.plan.source === "routed" ? "ok" : "warn",
							children: routeMetaText(trip.routeMeta)?.split(" · ")[0] ?? (trip.plan.source === "routed" ? "จากแผนที่ OSRM" : "ประมาณจากระยะตรง (เรียกแผนที่ไม่ได้)")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-xl font-semibold",
						children: trip.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-surface-2/60 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs text-muted",
									children: "ระยะทางรวม"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "font-display text-lg font-semibold",
									children: [Math.round(trip.plan.totalDistanceKm), " กม."]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-surface-2/60 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs text-muted",
									children: "เวลาเดินทางรวม"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "font-display text-lg font-semibold",
									children: formatDuration(totalMin)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-surface-2/60 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-xs text-muted",
									children: "จุดพักที่ต้องแวะ"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
									className: "font-display text-lg font-semibold",
									children: [restStops.length, " จุด"]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-muted",
						children: [
							"ถึงปลายทางโดยประมาณ ",
							formatDateTime(trip.plan.eta),
							" · ตัวเลขเป็นค่าประมาณ ไม่มีข้อมูลจราจรสด"
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill rounded-[28px] p-5 sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-semibold",
						children: "ลำดับการเดินทาง (จุดพักบังคับ)"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 space-y-3",
					children: trip.plan.stops.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-navy-fg",
							children: s.seq
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-medium",
								children: [s.type === "rest" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, { className: "mr-1 inline size-4 text-rest" }) : null, s.title]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									(new Date(s.end).getTime() - new Date(s.start).getTime()) / 6e4 > .5 ? `${formatDuration((new Date(s.end).getTime() - new Date(s.start).getTime()) / 6e4)} · ` : "",
									"เริ่ม ",
									formatDateTime(s.start),
									s.note ? ` · ${s.note}` : ""
								]
							})]
						})]
					}, s.seq))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill overflow-hidden rounded-[28px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-5 pb-0 sm:p-6 sm:pb-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display font-semibold",
						children: "แผนที่เส้นทาง"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[320px] p-4 sm:p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteMap, {
						origin: trip.origin,
						destination: trip.destination,
						waypoints: trip.waypoints,
						stops: trip.plan.stops
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "waybill rounded-[28px] p-5 sm:p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "navy",
							size: "lg",
							onClick: () => {
								startTrip(trip.id);
								onStart();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), "เริ่มเดินทาง"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "lg",
							onClick: () => {
								saveRouteFromTrip(trip.id);
								setSaved(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {}), saved ? "บันทึกแล้ว ✓" : "บันทึกเส้นทางนี้ไว้ใช้ซ้ำ"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "lg",
							onClick: onBack,
							children: "เลือกเส้นทางใหม่"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted",
					children: "กด \"เริ่มเดินทาง\" เมื่อออกรถจริง — ระบบจะเริ่มนับเวลาขับต่อเนื่องจาก 0 ทันที และแจ้งเตือนเมื่อใกล้ครบ 4 ชม."
				})]
			})
		]
	});
}
//#endregion
export { DrivePage as component };
