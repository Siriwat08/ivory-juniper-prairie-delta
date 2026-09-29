import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AgentPanel } from "./AgentPanel-CrfLOWSA.mjs";
import { p as useActiveTrip } from "./router-DCm_HuB2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agent-D54YYD8Q.js
var import_jsx_runtime = require_jsx_runtime();
function AgentPage() {
	const trip = useActiveTrip();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "ผู้เชี่ยวชาญเส้นทางและเวลาพัก"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: trip ? `กำลังดูบริบทเที่ยว ${trip.code} · ${trip.title}` : "ยังไม่มีเที่ยวบนโต๊ะ — วางแผนก่อนเพื่อให้คำตอบอิงตัวเลขจริง"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentPanel, {})
			})
		]
	});
}
//#endregion
export { AgentPage as component };
