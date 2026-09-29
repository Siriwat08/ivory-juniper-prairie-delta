//#region node_modules/.nitro/vite/services/ssr/assets/format-C_chUSPy.js
var DEFAULT_POLICY = {
	maxContinuousMin: 240,
	restMin: 30,
	bufferMin: 45,
	serviceMin: 30,
	restResetsDriving: true,
	vehicleType: "10-wheel",
	mapSource: "osm-osrm",
	trafficSource: "driver-report",
	avgHighwayKmh: 55
};
var VEHICLE_LABEL = {
	"6-wheel": "รถ 6 ล้อ",
	"10-wheel": "รถ 10 ล้อ",
	trailer: "รถพ่วง"
};
var VEHICLE_SPEED = {
	"6-wheel": 60,
	"10-wheel": 55,
	trailer: 50
};
function policyFromPartial(p) {
	const next = {
		...DEFAULT_POLICY,
		...p
	};
	next.avgHighwayKmh = VEHICLE_SPEED[next.vehicleType] ?? DEFAULT_POLICY.avgHighwayKmh;
	return next;
}
function buildGaps(policy) {
	return [
		{
			id: "buffer",
			topic: "ระยะเผื่อก่อนถึงขีดจำกัด",
			field: "bufferMin",
			status: policy.bufferMin === DEFAULT_POLICY.bufferMin ? "default" : "set",
			current: `${policy.bufferMin} นาที`,
			needed: "ค่านโยบายบริษัท เช่น 30 / 45 / 60 นาที ก่อนครบ 4 ชั่วโมง",
			owner: "ฝ่ายปฏิบัติการ เผ่าปัญญา",
			risk: "ถ้าไม่ตั้ง buffer จุดพักจะชิดขีดจำกัด เมื่อรถติดจะไปไม่ทัน"
		},
		{
			id: "vehicle",
			topic: "ประเภทรถ",
			field: "vehicleType",
			status: "set",
			current: VEHICLE_LABEL[policy.vehicleType],
			needed: "ระบุต่อเที่ยว — มีผลต่อความเร็วเฉลี่ยและจุดพักที่เข้าจอดได้",
			owner: "หัวหน้างาน / คนขับ",
			risk: "จุดพักบางแห่งรับได้เฉพาะ 6 ล้อ รถพ่วงเข้าไม่ได้"
		},
		{
			id: "rest-policy",
			topic: "นโยบายพักของบริษัท",
			field: "maxContinuousMin / restMin / restResetsDriving",
			status: "default",
			current: `ขับต่อเนื่องไม่เกิน ${policy.maxContinuousMin / 60} ชม. · พัก ${policy.restMin} นาที · รีเซ็ตหลังพักครบ: ${policy.restResetsDriving ? "ใช่" : "ไม่"}`,
			needed: "ยืนยันกับระเบียบบริษัทและกฎหมายที่ใช้จริง ไม่ใช้ค่านี้เป็นข้อกฎหมายอัตโนมัติ",
			owner: "ผู้บริหาร / ฝ่ายความปลอดภัย",
			risk: "รีเซ็ตเวลาขับผิดนโยบาย = แผนที่ดูปลอดภัยแต่ผิดกฎ"
		},
		{
			id: "map",
			topic: "แหล่งแผนที่และจราจร",
			field: "mapSource / trafficSource",
			status: "demo-only",
			current: "OpenStreetMap + OSRM (ประมาณการ) · จราจรจากรายงานคนขับ",
			needed: "Google Maps / Maps Platform หรือบริการจราจรสดของบริษัท",
			owner: "ไอที + ลูกค้า SCGJWD",
			risk: "เวลาในแอปนี้เป็นค่าประมาณ ไม่ใช่เวลาจริงบนถนน"
		},
		{
			id: "rest-verify",
			topic: "จุดพักรองรับรถขนส่ง",
			field: "restStops.verification",
			status: "missing",
			current: "คลังจุดพักตามทางหลวง (ต้องตรวจสอบ)",
			needed: "ยืนยันลานจอด ปั๊ม น้ำหนัก ทางเข้า-ออก กับคนขับที่คุ้นเส้น",
			owner: "คนขับอาวุโส / ฝ่ายจัดรถ",
			risk: "เข้าจุดพักไม่ได้ตอนเหลือเวลาน้อย"
		},
		{
			id: "service",
			topic: "เวลาขนถ่าย / รอคิว",
			field: "serviceMin",
			status: policy.serviceMin === DEFAULT_POLICY.serviceMin ? "default" : "set",
			current: `${policy.serviceMin} นาทีต่อจุดแวะ`,
			needed: "เวลาจริงของคลัง SCGJWD และร้านค้าแต่ละจุด",
			owner: "ลูกค้า SCGJWD + ฝ่ายปฏิบัติการ",
			risk: "เวลารอคิวไม่นับเป็นพัก ถ้านับผิดจะรีเซ็ตเวลาขับมั่ว"
		},
		{
			id: "legal",
			topic: "กฎหมายเวลาขับขี่",
			field: "legalHoursOfService",
			status: "missing",
			current: "ยังไม่ผูกกฎหมายไทยหรือเงื่อนไขใบอนุญาต",
			needed: "ตรวจสอบ พ.ร.บ. จราจร / เงื่อนไขใบขับขี่รถบรรทุก / นโยบายลูกค้า",
			owner: "ฝ่ายกฎหมาย / ความปลอดภัย",
			risk: "กฎ 4 ชม. ในแอปเป็นกฎปฏิบัติการของเที่ยวนี้ ไม่ใช่ข้อสรุปกฎหมาย"
		},
		{
			id: "traffic-live",
			topic: "ข้อมูลจราจรสด",
			field: "trafficSource",
			status: "demo-only",
			current: "คนขับรายงานเอง (รถติด +15/+30/+45 นาที)",
			needed: "ฟีดจราจรสดตามเส้นทางจริง",
			owner: "ไอที",
			risk: "แผนเดิมอาจพังจากรถติดโดยที่ระบบยังไม่รู้"
		}
	];
}
function incompleteGapCount(policy) {
	return buildGaps(policy).filter((g) => g.status !== "set").length;
}
var BKK = "Asia/Bangkok";
function formatClock(date) {
	return (typeof date === "string" ? new Date(date) : date).toLocaleTimeString("th-TH", {
		timeZone: BKK,
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	});
}
function formatDateTime(date) {
	return (typeof date === "string" ? new Date(date) : date).toLocaleString("th-TH", {
		timeZone: BKK,
		weekday: "short",
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false
	});
}
function formatDuration(totalMin) {
	const sign = totalMin < 0 ? "-" : "";
	const min = Math.round(Math.abs(totalMin));
	const h = Math.floor(min / 60);
	const m = min % 60;
	if (h === 0) return `${sign}${m} นาที`;
	if (m === 0) return `${sign}${h} ชม.`;
	return `${sign}${h} ชม. ${m} นาที`;
}
function addMinutes(date, minutes) {
	return new Date(date.getTime() + minutes * 6e4);
}
/** ข้อความอธิบายแหล่งที่มาของเส้นทางจาก routeMeta (ใช้แสดงในหน้าเที่ยววิ่ง/โหมดคนขับ) */
function routeMetaText(meta) {
	if (!meta) return null;
	return `${meta.source === "google-routes" ? "Google Routes (รถติดจริง)" : meta.source === "osrm" ? "OSRM (ไม่มีข้อมูลรถติด)" : "ประมาณจากระยะตรง (เรียกแผนที่ไม่ได้)"}${meta.source === "google-routes" && meta.trafficDelayMin != null ? ` · รถติดเพิ่ม ~${Math.round(meta.trafficDelayMin)} นาที` : ""}${` · คำนวณ ${formatDateTime(meta.calculatedAt)}`}`;
}
//#endregion
export { formatClock as a, incompleteGapCount as c, buildGaps as i, policyFromPartial as l, VEHICLE_LABEL as n, formatDateTime as o, addMinutes as r, formatDuration as s, DEFAULT_POLICY as t, routeMetaText as u };
