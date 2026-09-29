import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as createServerFn } from "./ssr.mjs";
import { r as createSsrRpc } from "./google-B27hyiqN.mjs";
import { n as localAgentReply, r as tripContext } from "./prompt-CEZ74sGI.mjs";
import { r as Textarea } from "./input-DgQMbaJy.mjs";
import { d as Send } from "../_libs/lucide-react.mjs";
import { l as cn, m as useDesk, p as useActiveTrip, s as Button } from "./router-DCm_HuB2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AgentPanel-CrfLOWSA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var askRouteAgent = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("081c4b3ee2d8d52d01e076e1621a10e1d70a3a069a0c9ad08298cb9ddbab5c28"));
var SUGGEST = [
	"สรุปแผนเที่ยวนี้ให้คนขับ",
	"รถติดหนัก จุดพักเดิมอาจไปไม่ทัน",
	"เหลือเวลากี่นาทีก่อนต้องพัก",
	"จุดพักถัดไปคือที่ไหน และยืนยันได้แค่ไหน"
];
function AgentPanel({ compact = false }) {
	const trip = useActiveTrip();
	const policy = useDesk((s) => s.policy);
	const chat = useDesk((s) => s.chat);
	const addChat = useDesk((s) => s.addChat);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function send(text) {
		const q = text.trim();
		if (!q || busy) return;
		addChat("user", q);
		setDraft("");
		setBusy(true);
		const fallback = localAgentReply(q, trip, policy);
		try {
			const res = await askRouteAgent({ data: {
				messages: [...useDesk.getState().chat].filter((m) => m.role === "user" || m.role === "assistant").slice(-8).map((m) => ({
					role: m.role,
					content: m.content
				})),
				context: tripContext(trip, policy)
			} });
			addChat("assistant", res.ok ? res.text : fallback);
		} catch {
			addChat("assistant", fallback);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("waybill flex flex-col rounded-[28px]", compact ? "h-[520px]" : "h-[min(720px,calc(100dvh-8rem))]"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "ผู้เชี่ยวชาญเส้นทาง"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "Agent ใช้ตัวเลขจากเครื่องคำนวณของโต๊ะนี้ — ไม่แต่งจุดพักเอง"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-3 overflow-y-auto px-4 py-4",
				children: [chat.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("max-w-[92%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed", m.role === "assistant" ? "bg-navy text-navy-fg" : "ml-auto bg-surface-2 text-fg"),
					children: m.content
				}, m.id)), busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "กำลังวิเคราะห์จากแผนปัจจุบัน…"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-2 flex flex-wrap gap-1.5",
					children: SUGGEST.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted hover:text-fg",
						onClick: () => send(s),
						children: s
					}, s))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						send(draft);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						placeholder: "เช่น เริ่มออกเดินทางแล้ว เวลาขับมา 3 ชม. 15 นาที…",
						className: "min-h-12 flex-1",
						rows: 2
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy || !draft.trim(),
						className: "self-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {})
					})]
				})]
			})
		]
	});
}
//#endregion
export { AgentPanel as t };
