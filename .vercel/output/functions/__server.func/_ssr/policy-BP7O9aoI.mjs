import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as buildGaps, n as VEHICLE_LABEL } from "./format-DF9o8tht.mjs";
import { i as useDesk } from "./router-CAHuqkNc.mjs";
import { t as Button } from "./button-BjrnTrlu.mjs";
import { n as Label, t as Input } from "./input-CyZrzklA.mjs";
import { t as Badge } from "./badge-B0oyUcO8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/policy-BP7O9aoI.js
var import_jsx_runtime = require_jsx_runtime();
var STATUS = {
	set: {
		label: "กำหนดแล้ว",
		tone: "ok"
	},
	default: {
		label: "ใช้ค่าเริ่มต้น",
		tone: "warn"
	},
	missing: {
		label: "ยังไม่มี",
		tone: "danger"
	},
	"demo-only": {
		label: "โหมดทดลอง",
		tone: "muted"
	}
};
function GapsTable() {
	const policy = useDesk((s) => s.policy);
	const setPolicy = useDesk((s) => s.setPolicy);
	const resetDemo = useDesk((s) => s.resetDemo);
	const gaps = buildGaps(policy);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "waybill rounded-[28px] p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "นโยบายเที่ยวนี้"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "ค่าเหล่านี้เป็นกฎปฏิบัติการของหจก.เผ่าปัญญา สำหรับงาน SCGJWD ในแอปนี้ ไม่ใช่ข้อสรุปกฎหมาย"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "เพดานขับต่อเนื่อง (นาที)",
							type: "number",
							value: policy.maxContinuousMin,
							onChange: (v) => setPolicy({ maxContinuousMin: Number(v) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "เวลาพัก (นาที)",
							type: "number",
							value: policy.restMin,
							onChange: (v) => setPolicy({ restMin: Number(v) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "ระยะเผื่อ buffer (นาที)",
							type: "number",
							value: policy.bufferMin,
							onChange: (v) => setPolicy({ bufferMin: Number(v) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "เวลาขนถ่ายต่อจุด (นาที)",
							type: "number",
							value: policy.serviceMin,
							onChange: (v) => setPolicy({ serviceMin: Number(v) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "ประเภทรถ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm",
								value: policy.vehicleType,
								onChange: (e) => setPolicy({ vehicleType: e.target.value }),
								children: Object.keys(VEHICLE_LABEL).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: k,
									children: VEHICLE_LABEL[k]
								}, k))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "รีเซ็ตเวลาขับหลังพักครบ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm",
								value: policy.restResetsDriving ? "yes" : "no",
								onChange: (e) => setPolicy({ restResetsDriving: e.target.value === "yes" }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "yes",
									children: "ใช่ — ตามนโยบายเที่ยวนี้"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "no",
									children: "ไม่ — ต้องให้ฝ่ายปฏิบัติการยืนยัน"
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: resetDemo,
						children: "คืนค่าทดลอง"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "waybill overflow-hidden rounded-[28px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "ช่องว่างที่ต้องเติมก่อนใช้จริง"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "ตารางนี้คือรายการที่ยังห้ามถือว่าโปรดักชันพร้อม — ให้ฝ่ายปฏิบัติการปิดทีละข้อ"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[860px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-surface-2/70 text-xs uppercase tracking-wide text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "หัวข้อ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "สถานะ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "ค่าปัจจุบัน"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "ต้องได้จาก"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "เจ้าของ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 font-medium",
								children: "ความเสี่ยงถ้าข้าม"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: gaps.map((g) => {
						const st = STATUS[g.status] ?? STATUS.missing;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border/80 align-top",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-medium",
									children: g.topic
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										tone: st.tone,
										children: st.label
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-xs leading-relaxed",
									children: g.current
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-xs leading-relaxed text-muted",
									children: g.needed
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-xs",
									children: g.owner
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-xs leading-relaxed text-muted",
									children: g.risk
								})
							]
						}, g.id);
					}) })]
				})
			})]
		})]
	});
}
function Field({ label, value, onChange, type }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			type,
			value,
			min: 0,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
function PolicyPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "นโยบายบริษัทและช่องว่างก่อนใช้จริง"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-3xl text-sm leading-relaxed text-muted",
				children: "ฝั่งปฏิบัติการคือหจก.เผ่าปัญญา ทรานสปอร์ต งานจ้างจาก SCGJWD กรุณายืนยัน buffer ประเภทรถ นิยามพักครบ และแหล่งแผนที่ก่อนปล่อยคนขับใช้เป็นระบบหลัก"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GapsTable, {})
			})
		]
	});
}
//#endregion
export { PolicyPage as component };
