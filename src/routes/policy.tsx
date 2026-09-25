import { createFileRoute } from "@tanstack/react-router";
import { GapsTable } from "@/components/policy/GapsTable";

export const Route = createFileRoute("/policy")({ component: PolicyPage });

function PolicyPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-semibold">นโยบายบริษัทและช่องว่างก่อนใช้จริง</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        ฝั่งปฏิบัติการคือหจก.เผ่าปัญญา ทรานสปอร์ต งานจ้างจาก SCGJWD
        กรุณายืนยัน buffer ประเภทรถ นิยามพักครบ และแหล่งแผนที่ก่อนปล่อยคนขับใช้เป็นระบบหลัก
      </p>
      <div className="mt-6">
        <GapsTable />
      </div>
    </div>
  );
}
