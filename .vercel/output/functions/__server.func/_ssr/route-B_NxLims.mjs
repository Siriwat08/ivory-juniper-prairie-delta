import { t as createServerFn } from "./ssr.mjs";
import { r as createSsrRpc } from "./google-B27hyiqN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-B_NxLims.js
/**
* ลำดับการคำนวณเส้นทาง (fallback chain):
*   1. Google Routes API (TRAFFIC_AWARE) — เมื่อมี key บนเซิร์ฟเวอร์ หรือคนขับเปิดใช้ในหน้าตั้งค่า
*      ได้เวลาตามสภาพจราจรจริง + trafficDelayMin
*   2. OSRM (โอเพนซอร์ส) — ไม่มีข้อมูลรถติด แต่ได้เส้นทางจริง
*   3. ประมาณการจากระยะตรง — ใช้ก่อนชั่วคราวเมื่อเรียกแผนที่ไม่ได้ทั้งคู่
* ทุกผลลัพธ์แนบ meta: แหล่งที่มา, trafficAware, เวลาที่คำนวณ, trafficDelayMin
*/
var computeRouteLegs = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("9e7c68d5485256129afeeada5f656ae7e6bcbf2e35f6d5c6773255a734e4c420"));
//#endregion
export { computeRouteLegs as t };
