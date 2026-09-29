import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as formatClock, n as VEHICLE_LABEL, o as formatDateTime, s as formatDuration, u as routeMetaText } from "./format-C_chUSPy.mjs";
import { h as summarizeRisk } from "./google-B27hyiqN.mjs";
import { D as Coffee, T as Flag, _ as Play, a as TimerReset, i as TrafficCone } from "../_libs/lucide-react.mjs";
import { t as AgentPanel } from "./AgentPanel-CrfLOWSA.mjs";
import { l as cn, m as useDesk, n as Route$1, o as Badge, s as Button } from "./router-DCm_HuB2.mjs";
import { t as RouteMap } from "./RouteMap-BYZnwrg-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trip._id-Bn9vqEXE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LiveDesk({ trip }) {
	const startTrip = useDesk((s) => s.startTrip);
	const addDelay = useDesk((s) => s.addDelay);
	const startRest = useDesk((s) => s.startRest);
	const finishRest = useDesk((s) => s.finishRest);
	const completeTrip = useDesk((s) => s.completeTrip);
	const advanceClock = useDesk((s) => s.advanceClock);
	const disabled = trip.status === "completed";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "waybill rounded-[28px] p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wider text-muted",
					children: "ติดตามเที่ยว"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "สถานะคนขับ"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs tabular-nums text-muted",
					children: ["นาฬิกาแผน ", formatDateTime(trip.clock)]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "navy",
						disabled: disabled || trip.status !== "planned",
						onClick: () => startTrip(trip.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, {}), "เริ่มเดินทาง"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						disabled: disabled || trip.status === "planned",
						onClick: () => advanceClock(trip.id, 30),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimerReset, {}), "จำลอง +30 นาที"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "warn",
						disabled: disabled || trip.status === "planned",
						onClick: () => addDelay(trip.id, 30),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrafficCone, {}), "รถติด +30"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						disabled: disabled || trip.status !== "enroute",
						onClick: () => startRest(trip.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, {}), "เริ่มพัก"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						disabled: disabled || trip.status !== "resting",
						onClick: () => finishRest(trip.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coffee, {}), "พักครบแล้ว"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						disabled,
						onClick: () => completeTrip(trip.id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {}), "ถึงปลายทาง"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: trip.events.slice(0, 5).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-3 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-fg",
						children: e.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 tabular-nums text-muted",
						children: formatDateTime(e.at)
					})]
				}, e.id))
			})
		]
	});
}
function RestGauge({ continuousMin, policy, status }) {
	const remain = Math.max(0, policy.maxContinuousMin - continuousMin);
	const used = Math.min(1, continuousMin / policy.maxContinuousMin);
	const inBuffer = remain <= policy.bufferMin;
	const over = continuousMin >= policy.maxContinuousMin;
	const tone = over ? "danger" : inBuffer ? "warn" : "ok";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "waybill overflow-hidden rounded-[28px] p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-medium uppercase tracking-wider text-muted",
					children: "เวลาขับต่อเนื่อง"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-3xl font-semibold tabular-nums",
					children: formatDuration(continuousMin)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("rounded-full px-2.5 py-1 text-xs font-medium", tone === "ok" && "bg-ok-fg text-ok", tone === "warn" && "bg-warn-fg text-warn", tone === "danger" && "bg-danger-fg text-danger"),
					children: over ? "ถึงเพดาน" : inBuffer ? "เข้าช่วงเผื่อ" : "ปกติ"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 h-2 overflow-hidden rounded-full bg-surface-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("h-full rounded-full transition-[width] duration-300", tone === "ok" && "bg-ok", tone === "warn" && "bg-warn", tone === "danger" && "bg-danger"),
					style: { width: `${Math.round(used * 100)}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid grid-cols-2 gap-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "เหลือก่อนพัก"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium tabular-nums",
					children: formatDuration(remain)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "เพดาน / ระยะเผื่อ"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-medium tabular-nums",
					children: [
						policy.maxContinuousMin / 60,
						" ชม. / ",
						policy.bufferMin,
						" นาที"
					]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs leading-relaxed text-muted",
				children: [
					"สถานะเที่ยว: ",
					statusLabel(status),
					" · พัก ",
					policy.restMin,
					" นาทีแล้วจึงรีเซ็ตรอบขับ ตามนโยบายที่ตั้งไว้ รถติดและขนถ่ายไม่นับเป็นพัก"
				]
			})
		]
	});
}
function statusLabel(s) {
	if (s === "enroute") return "กำลังเดินทาง";
	if (s === "resting") return "กำลังพัก";
	if (s === "completed") return "จบเที่ยว";
	return "ยังไม่ออกเดินทาง";
}
var TYPE_LABEL = {
	depart: "ออก",
	drive: "ขับ",
	waypoint: "ส่งของ",
	rest: "พัก",
	arrive: "ถึง",
	delay: "ล่าช้า"
};
function Timeline({ stops }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "waybill overflow-hidden rounded-[28px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border px-5 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "ตารางแผนการเดินทาง"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "ตัวเลขจากเครื่องคำนวณตามนโยบายบริษัท — ไม่ใช่จราจรสด"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[720px] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-surface-2/70 text-xs uppercase tracking-wide text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "ลำดับ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "จุด / สถานที่"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "ประเภท"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "เวลา"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "ขับสะสม"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "พัก"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 font-medium",
							children: "หมายเหตุ"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: stops.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: cn("border-t border-border/80", s.type === "rest" && "bg-rest-fg/40", s.confidence === "unverified" && "bg-danger-fg/40"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 tabular-nums text-muted",
							children: s.seq
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: s.place.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: s.title
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: s.type === "rest" ? "rest" : s.type === "arrive" ? "ok" : s.type === "delay" ? "danger" : "muted",
								children: TYPE_LABEL[s.type]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 tabular-nums",
							children: [formatClock(s.start), s.end !== s.start ? `–${formatClock(s.end)}` : ""]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 tabular-nums",
							children: formatDuration(s.continuousAfterMin)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 tabular-nums",
							children: s.restMin ? formatDuration(s.restMin) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-xs leading-relaxed text-muted",
							children: s.note
						})
					]
				}, s.seq)) })]
			})
		})]
	});
}
function TripPage() {
	const { id } = Route$1.useParams();
	const trip = useDesk((s) => s.trips.find((t) => t.id === id));
	const setActive = useDesk((s) => s.setActive);
	const policy = useDesk((s) => s.policy);
	(0, import_react.useEffect)(() => {
		if (trip) setActive(trip.id);
	}, [trip, setActive]);
	if (!trip) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-lg waybill rounded-[28px] p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xl font-semibold",
			children: "ไม่พบเที่ยวนี้"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: "mt-3 inline-block text-sm text-primary",
			children: "กลับโต๊ะปฏิบัติการ"
		})]
	});
	const risk = summarizeRisk(trip.plan);
	const remain = Math.max(0, policy.maxContinuousMin - trip.continuousMin);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-xs text-muted",
						children: [
							trip.code,
							" · งาน ",
							trip.client
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl font-semibold",
						children: trip.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							VEHICLE_LABEL[trip.vehicleType],
							" · ออก ",
							formatDateTime(trip.startTime),
							" · ถึงประมาณ",
							" ",
							formatDateTime(trip.plan.eta)
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: trip.plan.risk === "normal" ? "ok" : trip.plan.risk === "act" ? "danger" : "warn",
					children: risk.label
				})]
			}),
			remain <= policy.bufferMin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[18px] border border-danger/20 bg-danger-fg px-4 py-3 text-sm text-danger",
				children: [
					"เหลือเวลาขับ ",
					formatDuration(remain),
					" ก่อนเพดาน ",
					policy.maxContinuousMin / 60,
					" ชั่วโมง — อย่ายึดจุดพักเดิมถ้ารถติด ให้หาที่ปลอดภัยก่อน"
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[1.15fr_0.85fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden rounded-[28px] border border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-[340px] sm:h-[420px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RouteMap, {
							origin: trip.origin,
							destination: trip.destination,
							waypoints: trip.waypoints,
							stops: trip.plan.stops
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RestGauge, {
						continuousMin: trip.continuousMin,
						policy,
						status: trip.status
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveDesk, { trip })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "ระยะทางรวม",
						v: `${trip.plan.totalDistanceKm.toFixed(0)} กม.`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "เวลาขับ",
						v: formatDuration(trip.plan.totalDriveMin)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "เวลาพัก",
						v: formatDuration(trip.plan.totalRestMin)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
						k: "ขนถ่าย",
						v: formatDuration(trip.plan.totalServiceMin)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted",
				children: [
					risk.detail,
					" · แหล่งข้อมูลเส้นทาง: ",
					routeMetaText(trip.routeMeta) ?? (trip.plan.source === "routed" ? "OSRM" : "ประมาณการ")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { stops: trip.plan.stops }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentPanel, { compact: true })
		]
	});
}
function Mini({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "waybill rounded-[18px] px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-display text-lg font-semibold tabular-nums",
			children: v
		})]
	});
}
//#endregion
export { TripPage as component };
