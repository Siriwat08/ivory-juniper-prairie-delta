import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as require_leaflet_src } from "../_libs/leaflet.mjs";
import { a as MapContainer, i as Marker, n as Popup, o as useMap, r as Polyline, t as TileLayer } from "../_libs/react-leaflet.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/LeafletMap-DLWodR90.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_leaflet_src = /* @__PURE__ */ __toESM(require_leaflet_src());
function makeIcon(label, color) {
	return import_leaflet_src.default.divIcon({
		className: "",
		html: `<div class="desk-marker" style="background:${color}">${label}</div>`,
		iconSize: [28, 28],
		iconAnchor: [14, 14]
	});
}
function Fit({ points }) {
	const map = useMap();
	(0, import_react.useEffect)(() => {
		if (points.length < 2) return;
		const b = import_leaflet_src.default.latLngBounds(points);
		map.fitBounds(b, {
			padding: [32, 32],
			maxZoom: 9
		});
	}, [map, points]);
	return null;
}
function LeafletMap({ origin, destination, waypoints, stops }) {
	const nodes = (0, import_react.useMemo)(() => [
		[origin.lat, origin.lng],
		...waypoints.map((w) => [w.lat, w.lng]),
		[destination.lat, destination.lng]
	], [
		origin,
		destination,
		waypoints
	]);
	const restStops = stops.filter((s) => s.type === "rest");
	const center = nodes[0] ?? [15.5, 100.2];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MapContainer, {
		center,
		zoom: 7,
		className: "h-full min-h-72 w-full rounded-[22px]",
		scrollWheelZoom: false,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileLayer, {
				attribution: "© OpenStreetMap © CARTO",
				url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fit, { points: nodes }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Polyline, {
				positions: nodes,
				pathOptions: {
					color: "#12233a",
					weight: 4,
					opacity: .85
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
				position: nodes[0],
				icon: makeIcon("ต้น", "#12233a"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, { children: origin.name })
			}),
			waypoints.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
				position: [w.lat, w.lng],
				icon: makeIcon("แวะ", "#0b5bd3"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, { children: w.name })
			}, w.id)),
			restStops.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
				position: [s.place.lat, s.place.lng],
				icon: makeIcon("พัก", s.confidence === "unverified" ? "#a61b1b" : "#1f4d7a"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popup, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: s.place.name }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					s.confidence === "unverified" ? "ยังไม่ยืนยันสถานที่" : "ต้องตรวจสอบจุดจอด"
				] })
			}, `rest-${s.seq}`)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Marker, {
				position: nodes[nodes.length - 1],
				icon: makeIcon("ถึง", "#1b6b46"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, { children: destination.name })
			})
		]
	});
}
//#endregion
export { LeafletMap };
