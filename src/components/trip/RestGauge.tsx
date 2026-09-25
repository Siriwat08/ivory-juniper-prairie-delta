import { formatDuration } from "@/lib/format";
import type { Policy } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

export function RestGauge({
  continuousMin,
  policy,
  status,
}: {
  continuousMin: number;
  policy: Policy;
  status: string;
}) {
  const remain = Math.max(0, policy.maxContinuousMin - continuousMin);
  const used = Math.min(1, continuousMin / policy.maxContinuousMin);
  const inBuffer = remain <= policy.bufferMin;
  const over = continuousMin >= policy.maxContinuousMin;
  const tone = over ? "danger" : inBuffer ? "warn" : "ok";

  return (
    <section className="waybill overflow-hidden rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            เวลาขับต่อเนื่อง
          </p>
          <p className="mt-1 font-display text-3xl font-semibold tabular-nums">
            {formatDuration(continuousMin)}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-medium",
            tone === "ok" && "bg-ok-fg text-ok",
            tone === "warn" && "bg-warn-fg text-warn",
            tone === "danger" && "bg-danger-fg text-danger",
          )}
        >
          {over ? "ถึงเพดาน" : inBuffer ? "เข้าช่วงเผื่อ" : "ปกติ"}
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            tone === "ok" && "bg-ok",
            tone === "warn" && "bg-warn",
            tone === "danger" && "bg-danger",
          )}
          style={{ width: `${Math.round(used * 100)}%` }}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted">เหลือก่อนพัก</p>
          <p className="font-medium tabular-nums">{formatDuration(remain)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">เพดาน / ระยะเผื่อ</p>
          <p className="font-medium tabular-nums">
            {policy.maxContinuousMin / 60} ชม. / {policy.bufferMin} นาที
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        สถานะเที่ยว: {statusLabel(status)} · พัก {policy.restMin} นาทีแล้วจึงรีเซ็ตรอบขับ
        ตามนโยบายที่ตั้งไว้ รถติดและขนถ่ายไม่นับเป็นพัก
      </p>
    </section>
  );
}

function statusLabel(s: string) {
  if (s === "enroute") return "กำลังเดินทาง";
  if (s === "resting") return "กำลังพัก";
  if (s === "completed") return "จบเที่ยว";
  return "ยังไม่ออกเดินทาง";
}
