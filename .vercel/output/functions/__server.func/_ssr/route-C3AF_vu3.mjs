import { t as DEFAULT_POLICY } from "./format-DF9o8tht.mjs";
import { n as fallbackLeg } from "./rest-engine-DPAQxAYi.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-C3AF_vu3.js
async function osrmLegs(nodes) {
	if (nodes.length < 2) return [];
	const url = `https://router.project-osrm.org/route/v1/driving/${nodes.map((n) => `${n.lng},${n.lat}`).join(";")}?overview=full&geometries=geojson&steps=false&annotations=false`;
	const res = await fetch(url, {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) return null;
	const body = await res.json();
	if (body.code !== "Ok" || !body.routes?.[0]) return null;
	const route = body.routes[0];
	const latlng = (route.geometry?.coordinates ?? []).map(([lng, lat]) => [lat, lng]);
	const legs = route.legs ?? [];
	if (legs.length !== nodes.length - 1) return null;
	const totalDist = legs.reduce((s, l) => s + l.distance, 0);
	let walked = 0;
	return legs.map((leg, i) => {
		const startFrac = totalDist === 0 ? 0 : walked / totalDist;
		walked += leg.distance;
		const endFrac = totalDist === 0 ? 1 : walked / totalDist;
		const slice = sliceByFraction(latlng, startFrac, endFrac);
		const from = nodes[i];
		const to = nodes[i + 1];
		return {
			fromId: from.id,
			toId: to.id,
			distanceKm: leg.distance / 1e3,
			durationMin: leg.duration / 60,
			geometry: slice.length >= 2 ? slice : [[from.lat, from.lng], [to.lat, to.lng]],
			source: "routed"
		};
	});
}
function sliceByFraction(geometry, from, to) {
	if (geometry.length < 2) return geometry;
	const start = Math.floor(from * (geometry.length - 1));
	const end = Math.max(start + 1, Math.ceil(to * (geometry.length - 1)));
	return geometry.slice(start, end + 1);
}
var computeRouteLegs_createServerFn_handler = createServerRpc({
	id: "9e7c68d5485256129afeeada5f656ae7e6bcbf2e35f6d5c6773255a734e4c420",
	name: "computeRouteLegs",
	filename: "src/lib/maps/route.ts"
}, (opts) => computeRouteLegs.__executeServer(opts));
var computeRouteLegs = createServerFn({ method: "POST" }).validator((input) => input).handler(computeRouteLegs_createServerFn_handler, async ({ data }) => {
	const policy = data.policy ?? DEFAULT_POLICY;
	const nodes = data.nodes;
	try {
		const routed = await osrmLegs(nodes);
		if (routed && routed.length > 0) return {
			ok: true,
			legs: routed,
			source: "routed"
		};
	} catch {}
	return {
		ok: true,
		legs: nodes.slice(0, -1).map((from, i) => fallbackLeg(from, nodes[i + 1], policy)),
		source: "estimated"
	};
});
//#endregion
export { computeRouteLegs_createServerFn_handler };
