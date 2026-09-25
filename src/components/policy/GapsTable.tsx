import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { buildGaps } from "@/lib/engine/policy";
import { VEHICLE_LABEL } from "@/lib/engine/policy";
import type { VehicleType } from "@/lib/engine/types";
import { useDesk } from "@/lib/store";

const STATUS: Record<string, { label: string; tone: "ok" | "warn" | "danger" | "muted" }> = {
  set: { label: "กำหนดแล้ว", tone: "ok" },
  default: { label: "ใช้ค่าเริ่มต้น", tone: "warn" },
  missing: { label: "ยังไม่มี", tone: "danger" },
  "demo-only": { label: "โหมดทดลอง", tone: "muted" },
};

export function GapsTable() {
  const policy = useDesk((s) => s.policy);
  const setPolicy = useDesk((s) => s.setPolicy);
  const resetDemo = useDesk((s) => s.resetDemo);
  const gaps = buildGaps(policy);

  return (
    <div className="space-y-6">
      <section className="waybill rounded-[28px] p-5">
        <h2 className="font-display text-lg font-semibold">นโยบายเที่ยวนี้</h2>
        <p className="mt-1 text-sm text-muted">
          ค่าเหล่านี้เป็นกฎปฏิบัติการของหจก.เผ่าปัญญา สำหรับงาน SCGJWD ในแอปนี้
          ไม่ใช่ข้อสรุปกฎหมาย
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="เพดานขับต่อเนื่อง (นาที)"
            type="number"
            value={policy.maxContinuousMin}
            onChange={(v) => setPolicy({ maxContinuousMin: Number(v) })}
          />
          <Field
            label="เวลาพัก (นาที)"
            type="number"
            value={policy.restMin}
            onChange={(v) => setPolicy({ restMin: Number(v) })}
          />
          <Field
            label="ระยะเผื่อ buffer (นาที)"
            type="number"
            value={policy.bufferMin}
            onChange={(v) => setPolicy({ bufferMin: Number(v) })}
          />
          <Field
            label="เวลาขนถ่ายต่อจุด (นาที)"
            type="number"
            value={policy.serviceMin}
            onChange={(v) => setPolicy({ serviceMin: Number(v) })}
          />
          <div className="space-y-1.5">
            <Label>ประเภทรถ</Label>
            <select
              className="flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
              value={policy.vehicleType}
              onChange={(e) =>
                setPolicy({ vehicleType: e.target.value as VehicleType })
              }
            >
              {(Object.keys(VEHICLE_LABEL) as VehicleType[]).map((k) => (
                <option key={k} value={k}>
                  {VEHICLE_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>รีเซ็ตเวลาขับหลังพักครบ</Label>
            <select
              className="flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
              value={policy.restResetsDriving ? "yes" : "no"}
              onChange={(e) =>
                setPolicy({ restResetsDriving: e.target.value === "yes" })
              }
            >
              <option value="yes">ใช่ — ตามนโยบายเที่ยวนี้</option>
              <option value="no">ไม่ — ต้องให้ฝ่ายปฏิบัติการยืนยัน</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline" onClick={resetDemo}>
            คืนค่าทดลอง
          </Button>
        </div>
      </section>

      <section className="waybill overflow-hidden rounded-[28px]">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">
            ช่องว่างที่ต้องเติมก่อนใช้จริง
          </h2>
          <p className="text-xs text-muted">
            ตารางนี้คือรายการที่ยังห้ามถือว่าโปรดักชันพร้อม — ให้ฝ่ายปฏิบัติการปิดทีละข้อ
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-surface-2/70 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">หัวข้อ</th>
                <th className="px-4 py-3 font-medium">สถานะ</th>
                <th className="px-4 py-3 font-medium">ค่าปัจจุบัน</th>
                <th className="px-4 py-3 font-medium">ต้องได้จาก</th>
                <th className="px-4 py-3 font-medium">เจ้าของ</th>
                <th className="px-4 py-3 font-medium">ความเสี่ยงถ้าข้าม</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((g) => {
                const st = STATUS[g.status] ?? STATUS.missing;
                return (
                  <tr key={g.id} className="border-t border-border/80 align-top">
                    <td className="px-4 py-3 font-medium">{g.topic}</td>
                    <td className="px-4 py-3">
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs leading-relaxed">{g.current}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-muted">
                      {g.needed}
                    </td>
                    <td className="px-4 py-3 text-xs">{g.owner}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed text-muted">
                      {g.risk}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  type: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} min={0} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
