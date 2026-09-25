import { createFileRoute } from "@tanstack/react-router";
import { PlannerForm } from "@/components/planner/PlannerForm";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function PlanPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_280px]">
      <div>
        <h1 className="font-display text-2xl font-semibold">วางแผนเที่ยวขนส่ง</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          เลือกคลังต้นทางของ SCGJWD จุดแวะ และปลายทาง เครื่องคำนวณจะแทรกจุดพักให้เอง
          ตามเพดาน 4 ชั่วโมง และพัก 30 นาที
        </p>
        <div className="mt-6">
          <PlannerForm />
        </div>
      </div>
      <aside className="waybill h-fit rounded-[24px] p-5 text-sm leading-relaxed text-muted">
        <p className="font-medium text-fg">สิ่งที่ระบบไม่ทำ</p>
        <ul className="mt-3 list-disc space-y-2 pl-4">
          <li>ไม่ยืนยันว่าจุดพักในคลังมีที่จอดรถบรรทุกจริง</li>
          <li>ไม่ใช้จราจรสด — ถ้าติดให้กดรายงานบนโต๊ะเที่ยว</li>
          <li>ไม่แนะนำให้เร่งความเร็วเพื่อชดเชยเวลา</li>
          <li>ไม่ถือว่ารอคิวหรือรถติดเป็นการพัก</li>
        </ul>
      </aside>
    </div>
  );
}
