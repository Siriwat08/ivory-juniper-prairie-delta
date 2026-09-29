import { t as DEFAULT_POLICY } from "./format-C_chUSPy.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { i as fallbackLeg, s as googleRouteLegs } from "./google-B27hyiqN.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-N5x2ZqUl.js
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
/**
* ลำดับการคำนวณเส้นทาง (fallback chain):
*   1. Google Routes API (TRAFFIC_AWARE) — เมื่อมี key บนเซิร์ฟเวอร์ หรือคนขับเปิดใช้ในหน้าตั้งค่า
*      ได้เวลาตามสภาพจราจรจริง + trafficDelayMin
*   2. OSRM (โอเพนซอร์ส) — ไม่มีข้อมูลรถติด แต่ได้เส้นทางจริง
*   3. ประมาณการจากระยะตรง — ใช้ก่อนชั่วคราวเมื่อเรียกแผนที่ไม่ได้ทั้งคู่
* ทุกผลลัพธ์แนบ meta: แหล่งที่มา, trafficAware, เวลาที่คำนวณ, trafficDelayMin
*/
var computeRouteLegs_createServerFn_handler = createServerRpc({
	id: "9e7c68d5485256129afeeada5f656ae7e6bcbf2e35f6d5c6773255a734e4c420",
	name: "computeRouteLegs",
	filename: "src/lib/maps/route.ts"
}, (opts) => computeRouteLegs.__executeServer(opts));
var computeRouteLegs = createServerFn({ method: "POST" }).validator((input) => input).handler(computeRouteLegs_createServerFn_handler, async ({ data }) => {
	const policy = data.policy ?? DEFAULT_POLICY;
	const nodes = data.nodes;
	try {
		const g = await googleRouteLegs({ data: {
			nodes,
			apiKey: data.apiKey
		} });
		if (g.ok && g.legs.length > 0) {
			const legs = g.legs.map((l, i) => ({
				fromId: nodes[i].id,
				toId: nodes[i + 1].id,
				distanceKm: l.distanceKm,
				durationMin: l.durationMin,
				geometry: l.geometry,
				source: "routed"
			}));
			const trafficDelayMin = g.legs.reduce((s, l) => s + Math.max(0, l.durationMin - l.noTrafficMin), 0);
			return {
				ok: true,
				legs,
				source: "routed",
				meta: {
					source: "google-routes",
					trafficAware: true,
					calculatedAt: g.calculatedAt,
					trafficDelayMin
				}
			};
		}
	} catch {}
	try {
		const routed = await osrmLegs(nodes);
		if (routed && routed.length > 0) return {
			ok: true,
			legs: routed,
			source: "routed",
			meta: {
				source: "osrm",
				trafficAware: false,
				calculatedAt: (/* @__PURE__ */ new Date()).toISOString(),
				trafficDelayMin: null
			}
		};
	} catch {}
	return {
		ok: true,
		legs: nodes.slice(0, -1).map((from, i) => fallbackLeg(from, nodes[i + 1], policy)),
		source: "estimated",
		meta: {
			source: "estimated",
			trafficAware: false,
			calculatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			trafficDelayMin: null
		}
	};
});
//#endregion
export { computeRouteLegs_createServerFn_handler };
