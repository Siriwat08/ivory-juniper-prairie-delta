import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RouteMap-BYZnwrg-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RouteMap(props) {
	const [Comp, setComp] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		import("./LeafletMap-DLWodR90.mjs").then((m) => {
			if (live) setComp(() => m.LeafletMap);
		});
		return () => {
			live = false;
		};
	}, []);
	if (!Comp) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full min-h-72 items-center justify-center rounded-[22px] bg-surface-2 text-sm text-muted",
		children: "กำลังเปิดแผนที่เส้นทาง"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Comp, { ...props });
}
//#endregion
export { RouteMap as t };
