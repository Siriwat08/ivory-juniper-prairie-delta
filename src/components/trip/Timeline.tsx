import { formatClock, formatDuration } from "@/lib/format";
import type { PlanStop } from "@/lib/engine/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<PlanStop["type"], string> = {
  depart: "ออก",
  drive: "ขับ",
  waypoint: "ส่งของ",
  rest: "พัก",
  arrive: "ถึง",
  delay: "ล่าช้า",
};

export function Timeline({ stops }: { stops: PlanStop[] }) {
  return (
    <div className="waybill overflow-hidden rounded-[28px]">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold">ตารางแผนการเดินทาง</h2>
        <p className="text-xs text-muted">
          ตัวเลขจากเครื่องคำนวณตามนโยบายบริษัท — ไม่ใช่จราจรสด
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface-2/70 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">ลำดับ</th>
              <th className="px-4 py-3 font-medium">จุด / สถานที่</th>
              <th className="px-4 py-3 font-medium">ประเภท</th>
              <th className="px-4 py-3 font-medium">เวลา</th>
              <th className="px-4 py-3 font-medium">ขับสะสม</th>
              <th className="px-4 py-3 font-medium">พัก</th>
              <th className="px-4 py-3 font-medium">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {stops.map((s) => (
              <tr
                key={s.seq}
                className={cn(
                  "border-t border-border/80",
                  s.type === "rest" && "bg-rest-fg/40",
                  s.confidence === "unverified" && "bg-danger-fg/40",
                )}
              >
                <td className="px-4 py-3 tabular-nums text-muted">{s.seq}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{s.place.name}</p>
                  <p className="text-xs text-muted">{s.title}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    tone={
                      s.type === "rest"
                        ? "rest"
                        : s.type === "arrive"
                          ? "ok"
                          : s.type === "delay"
                            ? "danger"
                            : "muted"
                    }
                  >
                    {TYPE_LABEL[s.type]}
                  </Badge>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatClock(s.start)}
                  {s.end !== s.start ? `–${formatClock(s.end)}` : ""}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatDuration(s.continuousAfterMin)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {s.restMin ? formatDuration(s.restMin) : "—"}
                </td>
                <td className="px-4 py-3 text-xs leading-relaxed text-muted">
                  {s.note}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
