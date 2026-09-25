import { Coffee, Flag, Play, TimerReset, TrafficCone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesk } from "@/lib/store";
import type { Trip } from "@/lib/engine/types";
import { formatDateTime } from "@/lib/format";

export function LiveDesk({ trip }: { trip: Trip }) {
  const startTrip = useDesk((s) => s.startTrip);
  const addDelay = useDesk((s) => s.addDelay);
  const startRest = useDesk((s) => s.startRest);
  const finishRest = useDesk((s) => s.finishRest);
  const completeTrip = useDesk((s) => s.completeTrip);
  const advanceClock = useDesk((s) => s.advanceClock);
  const disabled = trip.status === "completed";

  return (
    <section className="waybill rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            ติดตามเที่ยว
          </p>
          <h2 className="font-display text-lg font-semibold">สถานะคนขับ</h2>
        </div>
        <p className="text-xs tabular-nums text-muted">นาฬิกาแผน {formatDateTime(trip.clock)}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Button
          variant="navy"
          disabled={disabled || trip.status !== "planned"}
          onClick={() => startTrip(trip.id)}
        >
          <Play />
          เริ่มเดินทาง
        </Button>
        <Button
          variant="outline"
          disabled={disabled || trip.status === "planned"}
          onClick={() => advanceClock(trip.id, 30)}
        >
          <TimerReset />
          จำลอง +30 นาที
        </Button>
        <Button
          variant="warn"
          disabled={disabled || trip.status === "planned"}
          onClick={() => addDelay(trip.id, 30)}
        >
          <TrafficCone />
          รถติด +30
        </Button>
        <Button
          variant="outline"
          disabled={disabled || trip.status !== "enroute"}
          onClick={() => startRest(trip.id)}
        >
          <Coffee />
          เริ่มพัก
        </Button>
        <Button
          variant="outline"
          disabled={disabled || trip.status !== "resting"}
          onClick={() => finishRest(trip.id)}
        >
          <Coffee />
          พักครบแล้ว
        </Button>
        <Button
          variant="outline"
          disabled={disabled}
          onClick={() => completeTrip(trip.id)}
        >
          <Flag />
          ถึงปลายทาง
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {trip.events.slice(0, 5).map((e) => (
          <li key={e.id} className="flex justify-between gap-3 text-xs">
            <span className="text-fg">{e.label}</span>
            <span className="shrink-0 tabular-nums text-muted">{formatDateTime(e.at)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
