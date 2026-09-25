import type { GapItem, Policy, VehicleType } from "./types";

export const DEFAULT_POLICY: Policy = {
  maxContinuousMin: 240,
  restMin: 30,
  bufferMin: 45,
  serviceMin: 30,
  restResetsDriving: true,
  vehicleType: "10-wheel",
  mapSource: "osm-osrm",
  trafficSource: "driver-report",
  avgHighwayKmh: 55,
};

export const VEHICLE_LABEL: Record<VehicleType, string> = {
  "6-wheel": "รถ 6 ล้อ",
  "10-wheel": "รถ 10 ล้อ",
  trailer: "รถพ่วง",
};

export const VEHICLE_SPEED: Record<VehicleType, number> = {
  "6-wheel": 60,
  "10-wheel": 55,
  trailer: 50,
};

export function policyFromPartial(p: Partial<Policy> | undefined): Policy {
  const next = { ...DEFAULT_POLICY, ...p };
  next.avgHighwayKmh = VEHICLE_SPEED[next.vehicleType] ?? DEFAULT_POLICY.avgHighwayKmh;
  return next;
}

export function buildGaps(policy: Policy): GapItem[] {
  const bufferIsDefault = policy.bufferMin === DEFAULT_POLICY.bufferMin;
  return [
    {
      id: "buffer",
      topic: "ระยะเผื่อก่อนถึงขีดจำกัด",
      field: "bufferMin",
      status: bufferIsDefault ? "default" : "set",
      current: `${policy.bufferMin} นาที`,
      needed: "ค่านโยบายบริษัท เช่น 30 / 45 / 60 นาที ก่อนครบ 4 ชั่วโมง",
      owner: "ฝ่ายปฏิบัติการ เผ่าปัญญา",
      risk: "ถ้าไม่ตั้ง buffer จุดพักจะชิดขีดจำกัด เมื่อรถติดจะไปไม่ทัน",
    },
    {
      id: "vehicle",
      topic: "ประเภทรถ",
      field: "vehicleType",
      status: "set",
      current: VEHICLE_LABEL[policy.vehicleType],
      needed: "ระบุต่อเที่ยว — มีผลต่อความเร็วเฉลี่ยและจุดพักที่เข้าจอดได้",
      owner: "หัวหน้างาน / คนขับ",
      risk: "จุดพักบางแห่งรับได้เฉพาะ 6 ล้อ รถพ่วงเข้าไม่ได้",
    },
    {
      id: "rest-policy",
      topic: "นโยบายพักของบริษัท",
      field: "maxContinuousMin / restMin / restResetsDriving",
      status: "default",
      current: `ขับต่อเนื่องไม่เกิน ${policy.maxContinuousMin / 60} ชม. · พัก ${policy.restMin} นาที · รีเซ็ตหลังพักครบ: ${policy.restResetsDriving ? "ใช่" : "ไม่"}`,
      needed: "ยืนยันกับระเบียบบริษัทและกฎหมายที่ใช้จริง ไม่ใช้ค่านี้เป็นข้อกฎหมายอัตโนมัติ",
      owner: "ผู้บริหาร / ฝ่ายความปลอดภัย",
      risk: "รีเซ็ตเวลาขับผิดนโยบาย = แผนที่ดูปลอดภัยแต่ผิดกฎ",
    },
    {
      id: "map",
      topic: "แหล่งแผนที่และจราจร",
      field: "mapSource / trafficSource",
      status: "demo-only",
      current: "OpenStreetMap + OSRM (ประมาณการ) · จราจรจากรายงานคนขับ",
      needed: "Google Maps / Maps Platform หรือบริการจราจรสดของบริษัท",
      owner: "ไอที + ลูกค้า SCGJWD",
      risk: "เวลาในแอปนี้เป็นค่าประมาณ ไม่ใช่เวลาจริงบนถนน",
    },
    {
      id: "rest-verify",
      topic: "จุดพักรองรับรถขนส่ง",
      field: "restStops.verification",
      status: "missing",
      current: "คลังจุดพักตามทางหลวง (ต้องตรวจสอบ)",
      needed: "ยืนยันลานจอด ปั๊ม น้ำหนัก ทางเข้า-ออก กับคนขับที่คุ้นเส้น",
      owner: "คนขับอาวุโส / ฝ่ายจัดรถ",
      risk: "เข้าจุดพักไม่ได้ตอนเหลือเวลาน้อย",
    },
    {
      id: "service",
      topic: "เวลาขนถ่าย / รอคิว",
      field: "serviceMin",
      status: policy.serviceMin === DEFAULT_POLICY.serviceMin ? "default" : "set",
      current: `${policy.serviceMin} นาทีต่อจุดแวะ`,
      needed: "เวลาจริงของคลัง SCGJWD และร้านค้าแต่ละจุด",
      owner: "ลูกค้า SCGJWD + ฝ่ายปฏิบัติการ",
      risk: "เวลารอคิวไม่นับเป็นพัก ถ้านับผิดจะรีเซ็ตเวลาขับมั่ว",
    },
    {
      id: "legal",
      topic: "กฎหมายเวลาขับขี่",
      field: "legalHoursOfService",
      status: "missing",
      current: "ยังไม่ผูกกฎหมายไทยหรือเงื่อนไขใบอนุญาต",
      needed: "ตรวจสอบ พ.ร.บ. จราจร / เงื่อนไขใบขับขี่รถบรรทุก / นโยบายลูกค้า",
      owner: "ฝ่ายกฎหมาย / ความปลอดภัย",
      risk: "กฎ 4 ชม. ในแอปเป็นกฎปฏิบัติการของเที่ยวนี้ ไม่ใช่ข้อสรุปกฎหมาย",
    },
    {
      id: "traffic-live",
      topic: "ข้อมูลจราจรสด",
      field: "trafficSource",
      status: "demo-only",
      current: "คนขับรายงานเอง (รถติด +15/+30/+45 นาที)",
      needed: "ฟีดจราจรสดตามเส้นทางจริง",
      owner: "ไอที",
      risk: "แผนเดิมอาจพังจากรถติดโดยที่ระบบยังไม่รู้",
    },
  ];
}

export function incompleteGapCount(policy: Policy) {
  return buildGaps(policy).filter((g) => g.status !== "set").length;
}
