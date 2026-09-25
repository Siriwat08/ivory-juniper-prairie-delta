import type { Policy, Trip } from "@/lib/engine/types";
import { VEHICLE_LABEL } from "@/lib/engine/policy";
import { formatClock, formatDateTime, formatDuration } from "@/lib/format";

export const AGENT_SYSTEM = `คุณคือ Route Planning & Driver Rest Agent ของ หจก.เผ่าปัญญา ทรานสปอร์ต
ทำงานให้ลูกค้า SCGJWD

หน้าที่: วางแผนเส้นทางต้นทาง → จุดแวะ → ปลายทาง คุมเวลาขับต่อเนื่องไม่ให้เกินขีดจำกัดตามนโยบาย จัดจุดพัก และปรับแผนเมื่อรถติด

บุคลิก: มืออาชีพ รอบคอบ ภาษาไทยกระชับ คนขับอาจกำลังขับรถอยู่ ตัวเลขสำคัญก่อน อย่าเล่ารายงานยาว

กฎเหล็ก:
1. ห้ามละเลยเวลาขับรถสะสมของรอบปัจจุบัน
2. ห้ามวางแผนให้ขับต่อเนื่องเกิน maxContinuous ตามนโยบาย
3. ต้องมีระยะเผื่อ (buffer) ก่อนถึงจุดพัก — ห้ามรอจนชิดขีดจำกัด
4. เวลาพักมาตรฐานตามนโยบาย (ค่าเริ่ม 30 นาที) — ห้ามนับว่ารีเซ็ตจนกว่าสถานะพักครบ
5. แยก เวลาขับ / พัก / ขนถ่าย / รถติด ให้ชัด รถติดและรอคิวไม่ใช่พัก
6. เมื่อรถติด ต้องประเมินว่าจุดพักเดิมไปทันหรือไม่ ถ้าไม่ทันให้ทิ้งจุดเดิม
7. ห้ามแต่งระยะทาง จุดพัก จราจร เวลาเปิดปิด — ถ้าไม่มีข้อมูลให้บอกว่ายังยืนยันไม่ได้
8. ห้ามแนะนำให้เร่งความเร็ว ฝ่าฝืนกฎ หรือขับต่อทั้งที่ไม่ปลอดภัย
9. ความปลอดภัยมาก่อนเวลานัดส่ง
10. กฎ 4 ชั่วโมง / พัก 30 นาที เป็นกฎปฏิบัติการของเที่ยวนี้ ไม่ใช่ข้อสรุปกฎหมายทุกพื้นที่

เมื่อตอบ:
- ขึ้นต้นด้วยตัวเลขสำคัญ (เวลาขับสะสม, เวลาที่เหลือก่อนพัก, จุดพักถัดไป, ETA)
- ใช้ภาษาคนขับเข้าใจง่าย
- แยก ค่าจากเครื่องคำนวณ / ค่าประมาณ / ต้องตรวจสอบ
- ถ้าเป็นคำเตือน ให้ขึ้นคำเตือนก่อน
- อย่าสร้างชื่อจุดพักใหม่ที่ไม่มีในบริบท`;

export function tripContext(trip: Trip | null, policy: Policy) {
  if (!trip) {
    return `ยังไม่มีเที่ยวที่เปิดอยู่
นโยบายปัจจุบัน: ขับต่อเนื่องไม่เกิน ${policy.maxContinuousMin} นาที, พัก ${policy.restMin} นาที, buffer ${policy.bufferMin} นาที, รถ ${VEHICLE_LABEL[policy.vehicleType]}
แหล่งแผนที่: ${policy.mapSource} (ไม่มีจราจรสด)`;
  }
  const nextRest = trip.plan.stops.find(
    (s) => s.type === "rest" && s.seq >= trip.currentStopSeq,
  );
  const lines = [
    `เที่ยว ${trip.code} · ${trip.title} · ลูกค้า ${trip.client}`,
    `สถานะ: ${trip.status}`,
    `รถ: ${VEHICLE_LABEL[trip.vehicleType]}`,
    `ต้นทาง: ${trip.origin.name}`,
    `จุดแวะ: ${trip.waypoints.map((w) => w.name).join(" → ") || "-"}`,
    `ปลายทาง: ${trip.destination.name}`,
    `เวลาเริ่ม: ${formatDateTime(trip.startTime)}`,
    `นาฬิกาแผน: ${formatDateTime(trip.clock)}`,
    `เวลาขับต่อเนื่องสะสม: ${formatDuration(trip.continuousMin)}`,
    `เหลือก่อนครบ ${policy.maxContinuousMin / 60} ชม.: ${formatDuration(policy.maxContinuousMin - trip.continuousMin)}`,
    `ความล่าช้าสะสม: ${formatDuration(trip.delayMin)}`,
    `ความเสี่ยงแผน: ${trip.plan.risk} — ${trip.plan.riskNote}`,
    `ระยะทางรวม (ประมาณ): ${trip.plan.totalDistanceKm.toFixed(0)} กม.`,
    `เวลาขับรวม: ${formatDuration(trip.plan.totalDriveMin)} · พักรวม ${formatDuration(trip.plan.totalRestMin)}`,
    `ETA ปลายทาง: ${formatDateTime(trip.plan.eta)}`,
    nextRest
      ? `จุดพักถัดไป: ${nextRest.place.name} ถึงประมาณ ${formatClock(nextRest.start)} (${nextRest.confidence})`
      : "ไม่มีจุดพักที่เหลือในแผน",
    "ตารางแผน:",
    ...trip.plan.stops.map(
      (s) =>
        `${s.seq}. ${s.type} ${s.title} | ${formatClock(s.start)}-${formatClock(s.end)} | ขับสะสม ${Math.round(s.continuousAfterMin)} น. | ${s.note}`,
    ),
  ];
  return lines.join("\n");
}

export function localAgentReply(userText: string, trip: Trip | null, policy: Policy) {
  const t = userText.trim();
  const remain = policy.maxContinuousMin - (trip?.continuousMin ?? 0);
  const rest = trip?.plan.stops.find((s) => s.type === "rest" && s.seq >= (trip?.currentStopSeq ?? 0));

  if (/รถติด|ล่าช้า|ไปไม่ทัน/.test(t)) {
    const need = rest
      ? Math.max(0, (new Date(rest.start).getTime() - new Date(trip!.clock).getTime()) / 60000)
      : remain;
    const late = /15/.test(t) ? 15 : /45/.test(t) ? 45 : /30/.test(t) ? 30 : 20;
    const can = need + 5 < remain - policy.bufferMin;
    if (!trip) {
      return `ยังไม่มีเที่ยวบนโต๊ะ เปิดแผนก่อนแล้วค่อยรายงานรถติด\nเวลาขับสะสมยังเป็น 0 · เพดาน ${policy.maxContinuousMin / 60} ชม. · พัก ${policy.restMin} นาที`;
    }
    if (need > remain - 5) {
      return `ต้องจัดการทันที\nเวลาขับสะสม ${formatDuration(trip.continuousMin)}\nเหลือก่อนครบเพดาน ${formatDuration(remain)}\nจุดพักเดิม ${rest?.place.name ?? "ยังไม่กำหนด"} ใช้เวลาอีกประมาณ ${formatDuration(need)}\nถ้ามีรถติดเพิ่ม จุดพักเดิมไปไม่ทัน — ทิ้งจุดเดิม หาที่จอดปลอดภัยใกล้กว่านี้ ห้ามเร่ง\nระดับความมั่นใจ: ประมาณการจากแผน ไม่มีจราจรสด`;
    }
    return `เฝ้าระวัง\nเวลาขับสะสม ${formatDuration(trip.continuousMin)}\nเหลือ ${formatDuration(remain)}\nจุดพักที่วางไว้: ${rest?.place.name ?? "-"}\nสมมติรถติดเพิ่ม ${late} นาที ${can ? "ยังอยู่ในระยะเผื่อ แต่เริ่มหาจุดสำรอง" : "ระยะเผื่อเริ่มไม่พอ — ประเมินจุดพักใกล้กว่า"}\nรถติดไม่นับเป็นพัก`;
  }

  if (/พัก|จุดพัก/.test(t)) {
    return `กฎพักของเที่ยวนี้: ขับต่อเนื่องไม่เกิน ${policy.maxContinuousMin / 60} ชม. แล้วพัก ${policy.restMin} นาที\nเหลือก่อนพัก ${formatDuration(remain)}\nจุดพักถัดไป: ${rest ? `${rest.place.name} · ถึงประมาณ ${formatClock(rest.start)} · สถานะข้อมูล ${rest.confidence}` : "ยังไม่มีในแผน"}\nห้ามยึดจุดเดิมถ้ารถติดจนไปไม่ทัน`;
  }

  if (/เริ่ม|ออกเดินทาง/.test(t)) {
    return `เริ่มติดตามได้เมื่อกด "เริ่มเดินทาง" ในโต๊ะเที่ยว\nเวลาขับสะสมเริ่มที่ 0 รอบใหม่\nจุดหมายถัดไป: ${trip?.waypoints[0]?.name ?? trip?.destination.name ?? "ยังไม่กำหนด"}\nส่งตำแหน่งหรือกดจำลองเวลาเมื่อเคลื่อนที่แล้ว`;
  }

  if (trip) {
    return `สรุปแผน ${trip.code}\nต้นทาง ${trip.origin.name} → ${trip.waypoints.map((w) => w.name).join(" → ")}${trip.waypoints.length ? " → " : ""}${trip.destination.name}\nออก ${formatDateTime(trip.startTime)} · ถึงประมาณ ${formatDateTime(trip.plan.eta)}\nขับ ${formatDuration(trip.plan.totalDriveMin)} · พัก ${formatDuration(trip.plan.totalRestMin)} · จุดพัก ${trip.plan.restCount} จุด\nเวลาขับสะสมตอนนี้ ${formatDuration(trip.continuousMin)} · เหลือ ${formatDuration(remain)}\nความเสี่ยง: ${trip.plan.risk} — ${trip.plan.riskNote}\nตัวเลขเป็นค่าจากเครื่องคำนวณตามนโยบายบริษัท ไม่ใช่จราจรสด`;
  }

  return `สวัสดีครับ ผมคือผู้ช่วยวางแผนเส้นทางของเผ่าปัญญา ทรานสปอร์ต สำหรับงาน SCGJWD\nให้ข้อมูลต้นทาง จุดแวะ ปลายทาง และเวลาเริ่ม แล้ววางแผนได้\nกฎตั้งต้น: ไม่ขับต่อเนื่องเกิน ${policy.maxContinuousMin / 60} ชม. พัก ${policy.restMin} นาที มีระยะเผื่อ ${policy.bufferMin} นาที\nยังไม่เริ่มคำนวณจนกว่าจะมีจุดต้นทาง-ปลายทาง`;
}
