import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as cn } from "./router-CAHuqkNc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/badge-B0oyUcO8.js
var import_jsx_runtime = require_jsx_runtime();
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
//#endregion
export { Badge as t };
