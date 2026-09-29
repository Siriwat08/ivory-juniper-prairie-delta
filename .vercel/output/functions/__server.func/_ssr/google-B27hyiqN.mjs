import { r as addMinutes } from "./format-C_chUSPy.mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/google-B27hyiqN.js
/** Catalog along AH1 / AH2 corridors. Every entry is labeled must-verify. */
var REST_STOPS = [
	{
		id: "rest-wangnoi-ptt",
		name: "ปตท. วังน้อย (ทล.1)",
		address: "วังน้อย อยุธยา",
		lat: 14.251,
		lng: 100.731,
		truckOk: true,
		facilities: [
			"น้ำมัน",
			"ที่จอด",
			"ร้านสะดวกซื้อ"
		],
		verification: "must-verify",
		highway: "ทล.1",
		note: "ใกล้คลังต้นทาง ใช้ยืนยันทางเข้าก่อนพักจริง"
	},
	{
		id: "rest-saraburi-ptt",
		name: "ปตท. สระบุรี ริมทล.1",
		address: "สระบุรี",
		lat: 14.545,
		lng: 100.917,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.1"
	},
	{
		id: "rest-lopburi",
		name: "จุดพักรถลพบุรี (ทล.1)",
		address: "ลพบุรี",
		lat: 14.81,
		lng: 100.651,
		truckOk: true,
		facilities: ["ที่จอด", "ห้องน้ำ"],
		verification: "must-verify",
		highway: "ทล.1"
	},
	{
		id: "rest-ns-ptt",
		name: "ปตท. นครสวรรค์ ริมทล.1",
		address: "เมืองนครสวรรค์",
		lat: 15.678,
		lng: 100.119,
		truckOk: true,
		facilities: [
			"น้ำมัน",
			"ที่จอด",
			"อาหาร"
		],
		verification: "must-verify",
		highway: "ทล.1",
		note: "เหมาะพักหลังส่งของนครสวรรค์ก่อนขึ้นเหนือ"
	},
	{
		id: "rest-kps",
		name: "ปตท. กำแพงเพชร",
		address: "กำแพงเพชร",
		lat: 16.472,
		lng: 99.529,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.1"
	},
	{
		id: "rest-tak",
		name: "ปตท. ตาก (ทล.1)",
		address: "เมืองตาก",
		lat: 16.869,
		lng: 99.129,
		truckOk: true,
		facilities: [
			"น้ำมัน",
			"ที่จอด",
			"อาหาร"
		],
		verification: "must-verify",
		highway: "ทล.1"
	},
	{
		id: "rest-thoen",
		name: "ปตท. เถิน",
		address: "เถิน ลำปาง",
		lat: 17.887,
		lng: 99.218,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.1"
	},
	{
		id: "rest-lampang",
		name: "ปตท. ลำปาง ริมทล.11",
		address: "เมืองลำปาง",
		lat: 18.276,
		lng: 99.478,
		truckOk: true,
		facilities: [
			"น้ำมัน",
			"ที่จอด",
			"อาหาร"
		],
		verification: "must-verify",
		highway: "ทล.11",
		note: "จุดพักหลักช่วงนครสวรรค์–เชียงใหม่"
	},
	{
		id: "rest-hangchat",
		name: "ลานจอดห้างฉัตร",
		address: "ห้างฉัตร ลำปาง",
		lat: 18.336,
		lng: 99.352,
		truckOk: true,
		facilities: ["ที่จอด"],
		verification: "must-verify",
		highway: "ทล.11"
	},
	{
		id: "rest-lamphun",
		name: "ปตท. ลำพูน",
		address: "ลำพูน",
		lat: 18.574,
		lng: 99.008,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.11"
	},
	{
		id: "rest-bangpa-in",
		name: "ปตท. บางปะอิน",
		address: "บางปะอิน อยุธยา",
		lat: 14.232,
		lng: 100.575,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.32"
	},
	{
		id: "rest-kk-ptt",
		name: "ปตท. ขอนแก่น มิตรภาพ",
		address: "ขอนแก่น",
		lat: 16.432,
		lng: 102.823,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.2"
	},
	{
		id: "rest-saraburi-mittraphap",
		name: "ปตท. สระบุรี มิตรภาพ",
		address: "สระบุรี ทล.2",
		lat: 14.561,
		lng: 100.951,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.2"
	},
	{
		id: "rest-nakhonratchasima",
		name: "ปตท. นครราชสีมา มิตรภาพ",
		address: "นครราชสีมา",
		lat: 14.971,
		lng: 102.083,
		truckOk: true,
		facilities: [
			"น้ำมัน",
			"ที่จอด",
			"อาหาร"
		],
		verification: "must-verify",
		highway: "ทล.2"
	},
	{
		id: "rest-chachoengsao",
		name: "ปตท. ฉะเชิงเทรา",
		address: "ฉะเชิงเทรา",
		lat: 13.69,
		lng: 101.077,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.304"
	},
	{
		id: "rest-chonburi",
		name: "ปตท. ชลบุรี มอเตอร์เวย์",
		address: "ชลบุรี",
		lat: 13.361,
		lng: 100.984,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.7"
	},
	{
		id: "rest-phetchaburi",
		name: "ปตท. เพชรบุรี เพชรเกษม",
		address: "เพชรบุรี",
		lat: 13.111,
		lng: 99.939,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.4"
	},
	{
		id: "rest-prachuap",
		name: "ปตท. ประจวบคีรีขันธ์",
		address: "ประจวบคีรีขันธ์",
		lat: 11.81,
		lng: 99.797,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.4"
	},
	{
		id: "rest-chumpon",
		name: "ปตท. ชุมพร เพชรเกษม",
		address: "ชุมพร",
		lat: 10.496,
		lng: 99.18,
		truckOk: true,
		facilities: [
			"น้ำมัน",
			"ที่จอด",
			"อาหาร"
		],
		verification: "must-verify",
		highway: "ทล.4"
	},
	{
		id: "rest-surat",
		name: "ปตท. สุราษฎร์ธานี",
		address: "สุราษฎร์ธานี",
		lat: 9.138,
		lng: 99.333,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.41"
	},
	{
		id: "rest-nakhon-si",
		name: "ปตท. นครศรีธรรมราช",
		address: "นครศรีธรรมราช",
		lat: 8.432,
		lng: 99.963,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.401"
	},
	{
		id: "rest-phatthalung",
		name: "ปตท. พัทลุง",
		address: "พัทลุง",
		lat: 7.616,
		lng: 100.074,
		truckOk: true,
		facilities: ["น้ำมัน", "ที่จอด"],
		verification: "must-verify",
		highway: "ทล.41"
	}
];
function haversineKm(a, b) {
	const R = 6371;
	const dLat = deg(b.lat - a.lat);
	const dLng = deg(b.lng - a.lng);
	const s = Math.sin(dLat / 2) ** 2 + Math.cos(deg(a.lat)) * Math.cos(deg(b.lat)) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
function deg(n) {
	return n * Math.PI / 180;
}
function polylineLengthKm(geometry) {
	let d = 0;
	for (let i = 1; i < geometry.length; i++) {
		const a = geometry[i - 1];
		const b = geometry[i];
		if (!a || !b) continue;
		d += haversineKm({
			lat: a[0],
			lng: a[1]
		}, {
			lat: b[0],
			lng: b[1]
		});
	}
	return d;
}
function pointAlongPolyline(geometry, fraction) {
	if (geometry.length === 0) return [0, 0];
	if (geometry.length === 1) return geometry[0];
	const t = Math.min(1, Math.max(0, fraction));
	const total = polylineLengthKm(geometry);
	if (total === 0) return geometry[0];
	let remain = total * t;
	for (let i = 1; i < geometry.length; i++) {
		const a = geometry[i - 1];
		const b = geometry[i];
		const seg = haversineKm({
			lat: a[0],
			lng: a[1]
		}, {
			lat: b[0],
			lng: b[1]
		});
		if (remain <= seg || i === geometry.length - 1) {
			const u = seg === 0 ? 0 : remain / seg;
			return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
		}
		remain -= seg;
	}
	return geometry[geometry.length - 1];
}
function nearestOnPolyline(geometry, point) {
	let best = {
		distKm: Infinity,
		fraction: 0,
		coord: geometry[0] ?? [point.lat, point.lng]
	};
	const total = polylineLengthKm(geometry);
	if (total === 0) return {
		...best,
		distKm: 0,
		fraction: 0
	};
	let walked = 0;
	for (let i = 1; i < geometry.length; i++) {
		const a = geometry[i - 1];
		const b = geometry[i];
		const seg = haversineKm({
			lat: a[0],
			lng: a[1]
		}, {
			lat: b[0],
			lng: b[1]
		});
		const proj = projectOnSegment(a, b, point);
		if (proj.distKm < best.distKm) best = {
			distKm: proj.distKm,
			fraction: total === 0 ? 0 : (walked + seg * proj.t) / total,
			coord: proj.coord
		};
		walked += seg;
	}
	return best;
}
function projectOnSegment(a, b, p) {
	const ax = a[1];
	const ay = a[0];
	const bx = b[1];
	const by = b[0];
	const px = p.lng;
	const py = p.lat;
	const dx = bx - ax;
	const dy = by - ay;
	const len2 = dx * dx + dy * dy;
	const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
	const coord = [ay + dy * t, ax + dx * t];
	return {
		t,
		coord,
		distKm: haversineKm({
			lat: coord[0],
			lng: coord[1]
		}, p)
	};
}
function clonePlace(p, kind) {
	return {
		...p,
		kind: kind ?? p.kind
	};
}
function riskRank(r) {
	return [
		"normal",
		"watch",
		"act",
		"insufficient",
		"infeasible"
	].indexOf(r);
}
function worstRisk(a, b) {
	return riskRank(b) > riskRank(a) ? b : a;
}
function remaining(policy, continuous) {
	return Math.max(0, policy.maxContinuousMin - continuous);
}
function pushStop(stops, cursor, partial) {
	const start = cursor.clock;
	const end = addMinutes(start, partial.durationMin);
	stops.push({
		seq: cursor.seq++,
		start: start.toISOString(),
		end: end.toISOString(),
		title: partial.title,
		type: partial.type,
		place: partial.place,
		distanceKm: partial.distanceKm,
		driveMin: partial.driveMin,
		restMin: partial.restMin,
		serviceMin: partial.serviceMin,
		delayMin: partial.delayMin,
		continuousAfterMin: partial.continuousAfterMin,
		remainingBeforeRestMin: partial.remainingBeforeRestMin,
		note: partial.note,
		confidence: partial.confidence,
		onRoute: partial.onRoute
	});
	cursor.clock = end;
}
function pickRestAlongLeg(leg, fromFrac, targetFrac, restStops, vehicleNeedsTruck) {
	const windowLow = Math.min(fromFrac, targetFrac);
	const windowHigh = Math.max(fromFrac, targetFrac);
	let best = null;
	for (const stop of restStops) {
		if (vehicleNeedsTruck && !stop.truckOk) continue;
		const proj = nearestOnPolyline(leg.geometry, stop);
		if (proj.distKm > 12) continue;
		if (proj.fraction < windowLow - .02 || proj.fraction > windowHigh + .02) continue;
		const detour = proj.distKm;
		const closenessToTarget = Math.abs(proj.fraction - targetFrac);
		const score = detour * 4 + closenessToTarget * 30;
		if (!best || score < best.score) best = {
			stop,
			frac: Math.min(Math.max(proj.fraction, fromFrac), targetFrac),
			detourKm: detour,
			score
		};
	}
	return best ? {
		stop: best.stop,
		frac: best.frac,
		detourKm: best.detourKm
	} : null;
}
function unverifiedRest(coord, label) {
	return {
		id: `unverified-${coord[0].toFixed(3)}-${coord[1].toFixed(3)}`,
		name: label,
		lat: coord[0],
		lng: coord[1],
		truckOk: false,
		facilities: [],
		verification: "unverified",
		note: "ยังไม่มีจุดพักที่ยืนยันได้ที่พิกัดนี้ — ต้องให้คนขับหาที่ปลอดภัย",
		kind: "rest"
	};
}
function driveChunk(stops, cursor, policy, from, to, driveMin, distanceKm, confidence, note) {
	cursor.continuous += driveMin;
	pushStop(stops, cursor, {
		type: "drive",
		title: `ขับ ${from.name} → ${to.name}`,
		place: clonePlace(to),
		durationMin: driveMin,
		distanceKm,
		driveMin,
		restMin: 0,
		serviceMin: 0,
		delayMin: 0,
		continuousAfterMin: cursor.continuous,
		remainingBeforeRestMin: remaining(policy, cursor.continuous),
		note,
		confidence,
		onRoute: true
	});
}
function insertRest(stops, cursor, policy, rest, note) {
	const confidence = rest.verification === "unverified" ? "unverified" : "must-verify";
	pushStop(stops, cursor, {
		type: "rest",
		title: `พัก ${policy.restMin} นาที · ${rest.name}`,
		place: {
			...rest,
			kind: "rest"
		},
		durationMin: policy.restMin,
		distanceKm: 0,
		driveMin: 0,
		restMin: policy.restMin,
		serviceMin: 0,
		delayMin: 0,
		continuousAfterMin: policy.restResetsDriving ? 0 : cursor.continuous,
		remainingBeforeRestMin: policy.restResetsDriving ? policy.maxContinuousMin : remaining(policy, cursor.continuous),
		note,
		confidence,
		onRoute: rest.verification !== "unverified"
	});
	if (policy.restResetsDriving) cursor.continuous = 0;
}
function traverseLeg(stops, cursor, policy, from, to, leg, restStops, risk, delayMin) {
	const duration = leg.durationMin + (delayMin > 0 ? delayMin : 0);
	const distance = leg.distanceKm;
	let frac = 0;
	let remainMin = duration;
	let remainKm = distance;
	const truck = policy.vehicleType !== "6-wheel";
	if (delayMin > 0) pushStop(stops, cursor, {
		type: "delay",
		title: `ความล่าช้า ${delayMin} นาที`,
		place: clonePlace(from),
		durationMin: 0,
		distanceKm: 0,
		driveMin: 0,
		restMin: 0,
		serviceMin: 0,
		delayMin,
		continuousAfterMin: cursor.continuous,
		remainingBeforeRestMin: remaining(policy, cursor.continuous),
		note: "ความล่าช้าถูกรวมในเวลาขับช่วงนี้แล้ว — รถติดไม่นับเป็นพัก",
		confidence: "estimated",
		onRoute: true
	});
	while (remainMin > .6) {
		const left = remaining(policy, cursor.continuous);
		const comfortable = left - policy.bufferMin;
		if (remainMin <= left) {
			const fitsComfortably = remainMin <= Math.max(0, comfortable);
			driveChunk(stops, cursor, policy, from, to, remainMin, remainKm, leg.source, fitsComfortably ? "ช่วงนี้ถึงจุดหมายก่อนขีดจำกัดพร้อมระยะเผื่อ" : `ถึงจุดหมายได้ก่อนครบ ${policy.maxContinuousMin / 60} ชม. แต่เข้าช่วงระยะเผื่อ ${policy.bufferMin} นาที`);
			if (!fitsComfortably) {
				risk.current = worstRisk(risk.current, "watch");
				risk.notes.push(`ช่วงเข้า ${to.name} อยู่ในระยะเผื่อ — อย่าต่อช่วงถัดไปโดยไม่พัก`);
			}
			remainMin = 0;
			remainKm = 0;
			break;
		}
		if (left <= 8) {
			risk.current = worstRisk(risk.current, "act");
			insertRest(stops, cursor, policy, unverifiedRest(pointAlongPolyline(leg.geometry, frac), "จุดปลอดภัยใกล้ตำแหน่งปัจจุบัน"), "เวลาขับเหลือไม่พอไปต่อ — ต้องจอดในที่ปลอดภัยทันที ห้ามเร่งไปจุดพักเดิม");
			continue;
		}
		const hardCap = Math.max(8, left - 5);
		const targetDrive = Math.min(remainMin * .92, Math.min(hardCap, Math.max(12, left - policy.bufferMin)));
		const targetFrac = frac + (duration <= 0 ? 0 : targetDrive / duration * (1 - frac) || .15);
		const picked = pickRestAlongLeg(leg, frac, targetFrac, restStops, truck);
		let restPlace;
		let usedFrac = targetFrac;
		let extra = "";
		if (picked) {
			restPlace = picked.stop;
			usedFrac = Math.max(frac + .01, picked.frac);
			extra = picked.detourKm > 3 ? `เบี่ยงประมาณ ${picked.detourKm.toFixed(1)} กม. จากเส้นทาง · ${restPlace.note ?? "ต้องตรวจว่ารถเข้าจอดได้"}` : restPlace.note ?? "จุดจากคลังทางหลวง — ต้องตรวจสอบก่อนใช้จริง";
			if (restPlace.verification !== "routed") risk.current = worstRisk(risk.current, "watch");
		} else {
			restPlace = unverifiedRest(pointAlongPolyline(leg.geometry, targetFrac), "จุดพักตามเส้นทาง (ยังไม่ยืนยันสถานที่)");
			extra = "ไม่พบจุดพักในคลังที่อยู่ในระยะ — ห้ามยืนยันว่ามีลานจอดจริง";
			risk.current = worstRisk(risk.current, "act");
			risk.notes.push("ไม่มีจุดพักที่ยืนยันได้ในช่วงเวลาที่ปลอดภัย");
		}
		const usedRatio = Math.max(0, usedFrac - frac);
		const chunkMin = duration * usedRatio;
		const chunkKm = distance * usedRatio;
		if (chunkMin > .4) driveChunk(stops, cursor, policy, from, restPlace, chunkMin, chunkKm, picked ? "must-verify" : "unverified", `แทรกจุดพักก่อนครบ ${policy.maxContinuousMin / 60} ชม. (เผื่อ ${policy.bufferMin} นาที)`);
		insertRest(stops, cursor, policy, restPlace, extra);
		const nextFrac = Math.max(frac + .04, usedFrac);
		frac = Math.min(.98, nextFrac);
		remainMin = duration * (1 - frac);
		remainKm = distance * (1 - frac);
		from = restPlace;
		if (stops.length > 80) {
			risk.current = worstRisk(risk.current, "infeasible");
			risk.notes.push("แผนยาวผิดปกติ — หยุดคำนวณ");
			break;
		}
	}
}
function planTrip(input) {
	const policy = input.policy;
	const restStops = input.restStops ?? REST_STOPS;
	const nodes = [
		input.origin,
		...input.waypoints,
		input.destination
	];
	const stops = [];
	const cursor = {
		clock: new Date(input.startTime),
		continuous: input.continuousMin ?? 0,
		seq: 1
	};
	const risk = {
		current: "normal",
		notes: []
	};
	const source = input.legs.every((l) => l.source === "routed") ? "routed" : "estimated";
	pushStop(stops, cursor, {
		type: "depart",
		title: `ออกจาก ${input.origin.name}`,
		place: clonePlace(input.origin, "origin"),
		durationMin: 0,
		distanceKm: 0,
		driveMin: 0,
		restMin: 0,
		serviceMin: 0,
		delayMin: 0,
		continuousAfterMin: cursor.continuous,
		remainingBeforeRestMin: remaining(policy, cursor.continuous),
		note: cursor.continuous > 0 ? `เริ่มด้วยเวลาขับสะสม ${cursor.continuous} นาที` : "เริ่มนับเวลาขับต่อเนื่องจาก 0",
		confidence: source,
		onRoute: true
	});
	for (let i = 0; i < nodes.length - 1; i++) {
		const from = nodes[i];
		const to = nodes[i + 1];
		traverseLeg(stops, cursor, policy, from, to, input.legs[i] ?? fallbackLeg(from, to, policy), restStops, risk, i === 0 ? input.delayMin ?? 0 : 0);
		if (i === nodes.length - 2) pushStop(stops, cursor, {
			type: "arrive",
			title: `ถึงปลายทาง ${to.name}`,
			place: clonePlace(to, "destination"),
			durationMin: 0,
			distanceKm: 0,
			driveMin: 0,
			restMin: 0,
			serviceMin: 0,
			delayMin: 0,
			continuousAfterMin: cursor.continuous,
			remainingBeforeRestMin: remaining(policy, cursor.continuous),
			note: "สิ้นสุดภารกิจ — ตรวจเวลาขับสะสมก่อนรับงานต่อ",
			confidence: source,
			onRoute: true
		});
		else {
			pushStop(stops, cursor, {
				type: "waypoint",
				title: `ส่งของ · ${to.name}`,
				place: clonePlace(to, "waypoint"),
				durationMin: policy.serviceMin,
				distanceKm: 0,
				driveMin: 0,
				restMin: 0,
				serviceMin: policy.serviceMin,
				delayMin: 0,
				continuousAfterMin: cursor.continuous,
				remainingBeforeRestMin: remaining(policy, cursor.continuous),
				note: `เวลาขนถ่าย ${policy.serviceMin} นาที ไม่นับเป็นเวลาขับรถ และไม่นับเป็นพักตามกฎ`,
				confidence: "estimated",
				onRoute: true
			});
			const next = nodes[i + 2];
			const nextLeg = input.legs[i + 1];
			if (next && nextLeg) {
				const left = remaining(policy, cursor.continuous);
				if (nextLeg.durationMin > left - policy.bufferMin) {
					insertRest(stops, cursor, policy, pickRestAlongLeg({
						...nextLeg,
						geometry: [[to.lat, to.lng], [to.lat, to.lng]]
					}, 0, 1, restStops.filter((s) => haversineKm(s, to) < 8), policy.vehicleType !== "6-wheel")?.stop ?? restStops.filter((s) => haversineKm(s, to) < 10).sort((a, b) => haversineKm(a, to) - haversineKm(b, to))[0] ?? {
						...to,
						truckOk: true,
						facilities: ["ที่จอดจุดส่ง"],
						verification: "must-verify",
						note: "พักที่จุดแวะเพราะช่วงถัดไปยาวเกินเวลาที่เหลือ",
						kind: "rest"
					}, `ช่วงถัดไปไป ${next.name} ใช้ประมาณ ${Math.round(nextLeg.durationMin)} นาที แต่เหลือเวลาขับ ${Math.round(left)} นาที — พักที่จุดแวะก่อนออก`);
					risk.current = worstRisk(risk.current, "watch");
				}
			}
		}
	}
	const totalDistanceKm = stops.reduce((s, x) => s + x.distanceKm, 0);
	const totalDriveMin = stops.reduce((s, x) => s + x.driveMin, 0);
	const totalRestMin = stops.reduce((s, x) => s + x.restMin, 0);
	const totalServiceMin = stops.reduce((s, x) => s + x.serviceMin, 0);
	const totalDelayMin = stops.reduce((s, x) => s + x.delayMin, 0);
	const restCount = stops.filter((s) => s.type === "rest").length;
	const unverifiedRestCount = stops.filter((s) => s.type === "rest" && (s.confidence === "unverified" || s.confidence === "must-verify")).length;
	if (unverifiedRestCount > 0) {
		risk.current = worstRisk(risk.current, "watch");
		risk.notes.push("มีจุดพักที่ยังต้องตรวจสอบสถานที่จริง");
	}
	if (input.legs.length === 0) {
		risk.current = worstRisk(risk.current, "insufficient");
		risk.notes.push("ใช้ระยะทางประมาณ ไม่มีเส้นทางจากบริการแผนที่");
	}
	const eta = stops[stops.length - 1]?.end ?? input.startTime.toISOString();
	const riskNote = risk.notes[0] ?? (risk.current === "normal" ? "แผนอยู่ในกรอบ 4 ชั่วโมง/พัก 30 นาที ตามนโยบายที่ตั้งไว้" : "ตรวจจุดพักและความล่าช้าก่อนออกเดินทาง");
	return {
		stops,
		totalDistanceKm,
		totalDriveMin,
		totalRestMin,
		totalServiceMin,
		totalDelayMin,
		eta,
		risk: risk.current,
		riskNote,
		restCount,
		unverifiedRestCount,
		source
	};
}
function fallbackLeg(from, to, policy) {
	const via = corridorVia(from, to);
	const geometry = [
		[from.lat, from.lng],
		...via.map((p) => [p.lat, p.lng]),
		[to.lat, to.lng]
	];
	const distanceKm = polylineLengthKm(geometry);
	const durationMin = distanceKm / Math.max(30, policy.avgHighwayKmh) * 60;
	return {
		fromId: from.id,
		toId: to.id,
		distanceKm,
		durationMin,
		geometry,
		source: "estimated"
	};
}
function corridorVia(from, to) {
	const north = to.lat > 16 && from.lat < 16;
	const south = to.lat < 10 && from.lat > 12;
	if (north) return [
		{
			id: "v-saraburi",
			name: "สระบุรี",
			lat: 14.529,
			lng: 100.91
		},
		{
			id: "v-lopburi",
			name: "ลพบุรี",
			lat: 14.8,
			lng: 100.653
		},
		{
			id: "v-ns",
			name: "นครสวรรค์",
			lat: 15.694,
			lng: 100.123
		},
		{
			id: "v-kps",
			name: "กำแพงเพชร",
			lat: 16.483,
			lng: 99.522
		},
		{
			id: "v-tak",
			name: "ตาก",
			lat: 16.884,
			lng: 99.126
		},
		{
			id: "v-thoen",
			name: "เถิน",
			lat: 17.889,
			lng: 99.216
		},
		{
			id: "v-lampang",
			name: "ลำปาง",
			lat: 18.288,
			lng: 99.491
		}
	].filter((p) => p.lat > from.lat + .15 && p.lat < to.lat - .15);
	if (south) return [
		{
			id: "v-phet",
			name: "เพชรบุรี",
			lat: 13.111,
			lng: 99.939
		},
		{
			id: "v-prachuap",
			name: "ประจวบ",
			lat: 11.81,
			lng: 99.797
		},
		{
			id: "v-chumpon",
			name: "ชุมพร",
			lat: 10.496,
			lng: 99.18
		},
		{
			id: "v-surat",
			name: "สุราษฎร์",
			lat: 9.138,
			lng: 99.333
		}
	].filter((p) => p.lat < from.lat - .2 && p.lat > to.lat + .2);
	return [];
}
function buildFallbackLegs(origin, waypoints, destination, policy) {
	const nodes = [
		origin,
		...waypoints,
		destination
	];
	const legs = [];
	for (let i = 0; i < nodes.length - 1; i++) legs.push(fallbackLeg(nodes[i], nodes[i + 1], policy));
	return legs;
}
function summarizeRisk(plan) {
	switch (plan.risk) {
		case "normal": return {
			label: "ปกติ",
			detail: plan.riskNote
		};
		case "watch": return {
			label: "เฝ้าระวัง",
			detail: plan.riskNote
		};
		case "act": return {
			label: "ต้องจัดการทันที",
			detail: plan.riskNote
		};
		case "insufficient": return {
			label: "ข้อมูลไม่เพียงพอ",
			detail: plan.riskNote
		};
		case "infeasible": return {
			label: "ยืนยันความเป็นไปไม่ได้",
			detail: plan.riskNote
		};
	}
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* เวลาเดินทางจากตำแหน่งรถ → จุดหมาย โดยใช้ข้อมูลรถติดจริงของ Google
* durationMin = เวลาตามสภาพจราจรปัจจุบัน / noTrafficMin = เวลาโดยไม่มีรถติด
*/
var googleRouteEta = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("d1042ebe7abc63b5bd2847affd55e0012ae132685d7eebf97474ebe70e3d8973"));
/**
* คำนวณเส้นทางเต็มแยกช่วงด้วย Google Routes API (TRAFFIC_AWARE) ณ เวลาที่เรียก
* ใช้ตอน "คำนวณเส้นทาง" ครั้งเดียวต่อเที่ยว — ไม่เรียกซ้ำระหว่าง render
* เรียกไม่สำเร็จให้ผู้เรียก fallback ไป OSRM → ประมาณการตามลำดับ
*/
var googleRouteLegs = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("c7a88f0b97325a77ac422141c90f7ec510ace42c05a29886e44bb00ee1d7eb44"));
/**
* ค้นหาจุดพักจริง (ปั๊มน้ำมัน ฯลฯ) รอบพิกัดหนึ่ง ๆ — ใช้เสนอเป็นจุดพักแนะนำ
* เมื่อรถติดจนไปไม่ถึงจุดพักเดิม
*/
var googleRestStops = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("28c758c1be18b8b64a81aa4c7f1a12703689f3d1e956cdb0d2091eae70cbaaf0"));
/** ปุ่มทดสอบในหน้าตั้งค่า: ค้นหาจุดพักรอบ ปตท. วังน้อย (ทล.1) เป็นตัวตรวจว่า key ใช้ได้ */
var googleTestConnection = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("62ffd6edc1cc4243deb2b890d5d800194452bf0bf1c37776a0b3ed3367af6317"));
/** ตรวจว่าเซิร์ฟเวอร์ตั้ง env ที่จำเป็นไว้หรือยัง (ใช้ในหน้า "ความพร้อมใช้งานจริง") */
var integrationEnvStatus = createServerFn({ method: "POST" }).handler(createSsrRpc("6d90837f0ba939673b7b59e23608e55ecc51b47a0e17ba62e20008f351dfeffe"));
//#endregion
export { googleRestStops as a, googleTestConnection as c, nearestOnPolyline as d, planTrip as f, summarizeRisk as h, fallbackLeg as i, haversineKm as l, polylineLengthKm as m, buildFallbackLegs as n, googleRouteEta as o, pointAlongPolyline as p, createSsrRpc as r, googleRouteLegs as s, REST_STOPS as t, integrationEnvStatus as u };
