import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as incompleteGapCount, i as buildGaps, n as VEHICLE_LABEL, o as formatDateTime, s as formatDuration } from "./format-DF9o8tht.mjs";
import { i as summarizeRisk } from "./rest-engine-DPAQxAYi.mjs";
import { _ as ArrowRight, a as Shield, d as MapPinned, h as Clock3 } from "../_libs/lucide-react.mjs";
import { i as useDesk } from "./router-CAHuqkNc.mjs";
import { t as Button } from "./button-BjrnTrlu.mjs";
import { t as Badge } from "./badge-B0oyUcO8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-5xa11Bys.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const trips = useDesk((s) => s.trips);
	const policy = useDesk((s) => s.policy);
	const setActive = useDesk((s) => s.setActive);
	const gaps = incompleteGapCount(policy);
	const gapList = buildGaps(policy);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-[1.15fr_0.85fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "waybill rounded-[32px] p-6 sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "navy",
								children: "หจก.เผ่าปัญญา ทรานสปอร์ต"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "primary",
								children: "ลูกค้า SCGJWD"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl",
							children: [
								"โต๊ะวางแผนเส้นทาง",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"และจุดพักคนขับ"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base",
							children: "เครื่องคำนวณยึดกฎปฏิบัติการ: ขับต่อเนื่องไม่เกิน 4 ชั่วโมง แล้วพัก 30 นาที ถ้ารถติดจนจุดพักเดิมไปไม่ทัน ระบบจะทิ้งจุดเดิม — Agent ช่วยอ่านแผน ไม่ได้แต่งตัวเลขเอง"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "navy",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/plan",
									children: "วางแผนเที่ยวใหม่"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/agent",
									children: "คุยกับผู้เชี่ยวชาญ"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-8 grid grid-cols-3 gap-3 border-t border-border pt-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									k: "เพดานขับ",
									v: `${policy.maxContinuousMin / 60} ชม.`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									k: "พักครั้งละ",
									v: `${policy.restMin} นาที`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									k: "ระยะเผื่อ",
									v: `${policy.bufferMin} นาที`
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "waybill rounded-[32px] bg-navy p-6 text-navy-fg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wider text-navy-fg/60",
							children: "ก่อนใช้จริง"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 font-display text-2xl font-semibold",
							children: [
								"เหลือ ",
								gaps,
								" ช่องว่าง"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-navy-fg/75",
							children: "buffer, ประเภทรถ, นโยบายพักบริษัท และแหล่งแผนที่ยังต้องยืนยัน แอปนี้ใช้ OSM/OSRM เป็นค่าประมาณ ไม่มีจราจรสด"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-5 space-y-2 text-sm",
							children: gapList.slice(0, 4).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-3 border-b border-white/10 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: g.topic }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-navy-fg/55",
									children: g.status === "set" ? "กำหนดแล้ว" : "ต้องปิด"
								})]
							}, g.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "mt-5 border-white/20 bg-transparent text-navy-fg hover:bg-white/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/policy",
								children: "เปิดตารางช่องว่าง"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-semibold",
					children: "เที่ยวบนโต๊ะ"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: ["รถตั้งต้น: ", VEHICLE_LABEL[policy.vehicleType]]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: trips.map((trip) => {
					const risk = summarizeRisk(trip.plan);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "waybill rounded-[28px] p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-xs tracking-wide text-muted",
									children: trip.code
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-1 font-display text-lg font-semibold",
									children: trip.title
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									tone: trip.plan.risk === "normal" ? "ok" : trip.plan.risk === "act" ? "danger" : "warn",
									children: risk.label
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm text-muted",
								children: [
									trip.origin.name,
									" → ",
									trip.waypoints.map((w) => w.name).join(" → "),
									trip.waypoints.length ? " → " : "",
									trip.destination.name
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 grid grid-cols-2 gap-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted",
										children: "ออก"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "tabular-nums",
										children: formatDateTime(trip.startTime)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted",
										children: "ถึงโดยประมาณ"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "tabular-nums",
										children: formatDateTime(trip.plan.eta)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted",
										children: "ระยะทาง / ขับ"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
										className: "tabular-nums",
										children: [
											trip.plan.totalDistanceKm.toFixed(0),
											" กม. · ",
											formatDuration(trip.plan.totalDriveMin)
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "text-xs text-muted",
										children: "จุดพัก"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
										trip.plan.restCount,
										" จุด · รวม ",
										formatDuration(trip.plan.totalRestMin)
									] })] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "navy",
								className: "mt-5",
								onClick: () => setActive(trip.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/trip/$id",
									params: { id: trip.id },
									children: ["เปิดโต๊ะเที่ยว", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
								})
							})
						]
					}, trip.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
						icon: MapPinned,
						title: "1. วางจุด",
						text: "ต้นทางคลัง SCGJWD จุดแวะ และปลายทาง — ห้ามสมมติพิกัดเอง"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
						icon: Clock3,
						title: "2. เครื่องคำนวณแทรกพัก",
						text: "ถ้าช่วงขับจะเกิน 4 ชั่วโมง ระบบแทรกพัก 30 นาทีก่อนถึงเพดานตาม buffer"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Note, {
						icon: Shield,
						title: "3. ปรับเมื่อรถติด",
						text: "รายงานความล่าช้าแล้วให้ Agent + เครื่องคำนวณประเมินจุดพักใหม่"
					})
				]
			})
		]
	});
}
function Stat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-xs text-muted",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "font-display text-lg font-semibold tabular-nums",
		children: v
	})] });
}
function Note({ icon: Icon, title, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "waybill rounded-[22px] p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 text-primary" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-medium",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm leading-relaxed text-muted",
				children: text
			})
		]
	});
}
//#endregion
export { Home as component };
