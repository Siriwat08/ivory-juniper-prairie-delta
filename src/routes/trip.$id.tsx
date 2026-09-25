import { createFileRoute, Link } from "@tanstack/react-router";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { Badge } from "@/components/ui/badge";
import { LiveDesk } from "@/components/trip/LiveDesk";
import { RestGauge } from "@/components/trip/RestGauge";
import { RouteMap } from "@/components/trip/RouteMap";
import { Timeline } from "@/components/trip/Timeline";
import { summarizeRisk } from "@/lib/engine/rest-engine";
import { formatDateTime, formatDuration } from "@/lib/format";
import { useDesk } from "@/lib/store";
import { VEHICLE_LABEL } from "@/lib/engine/policy";
import { useEffect } from "react";

export const Route = createFileRoute("/trip/$id")({ component: TripPage });

function TripPage() {
  const { id } = Route.useParams();
  const trip = useDesk((s) => s.trips.find((t) => t.id === id));
  const setActive = useDesk((s) => s.setActive);
  const policy = useDesk((s) => s.policy);

  useEffect(() => {
    if (trip) setActive(trip.id);
  }, [trip, setActive]);

  if (!trip) {
    return (
      <div className="mx-auto max-w-lg waybill rounded-[28px] p-8 text-center">
        <p className="font-display text-xl font-semibold">ไม่พบเที่ยวนี้</p>
        <Link to="/" className="mt-3 inline-block text-sm text-primary">
          กลับโต๊ะปฏิบัติการ
        </Link>
      </div>
    );
  }

  const risk = summarizeRisk(trip.plan);
  const remain = Math.max(0, policy.maxContinuousMin - trip.continuousMin);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">{trip.code} · งาน {trip.client}</p>
          <h1 className="font-display text-2xl font-semibold">{trip.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {VEHICLE_LABEL[trip.vehicleType]} · ออก {formatDateTime(trip.startTime)} · ถึงประมาณ{" "}
            {formatDateTime(trip.plan.eta)}
          </p>
        </div>
        <Badge
          tone={
            trip.plan.risk === "normal" ? "ok" : trip.plan.risk === "act" ? "danger" : "warn"
          }
        >
          {risk.label}
        </Badge>
      </header>

      {remain <= policy.bufferMin ? (
        <div className="rounded-[18px] border border-danger/20 bg-danger-fg px-4 py-3 text-sm text-danger">
          เหลือเวลาขับ {formatDuration(remain)} ก่อนเพดาน {policy.maxContinuousMin / 60} ชั่วโมง
          — อย่ายึดจุดพักเดิมถ้ารถติด ให้หาที่ปลอดภัยก่อน
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[28px] border border-border">
          <div className="h-[340px] sm:h-[420px]">
            <RouteMap
              origin={trip.origin}
              destination={trip.destination}
              waypoints={trip.waypoints}
              stops={trip.plan.stops}
            />
          </div>
        </div>
        <div className="space-y-4">
          <RestGauge
            continuousMin={trip.continuousMin}
            policy={policy}
            status={trip.status}
          />
          <LiveDesk trip={trip} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Mini k="ระยะทางรวม" v={`${trip.plan.totalDistanceKm.toFixed(0)} กม.`} />
        <Mini k="เวลาขับ" v={formatDuration(trip.plan.totalDriveMin)} />
        <Mini k="เวลาพัก" v={formatDuration(trip.plan.totalRestMin)} />
        <Mini k="ขนถ่าย" v={formatDuration(trip.plan.totalServiceMin)} />
      </dl>
      <p className="text-xs text-muted">{risk.detail} · แหล่งข้อมูลเส้นทาง: {trip.plan.source === "routed" ? "OSRM" : "ประมาณการ"}</p>

      <Timeline stops={trip.plan.stops} />

      <AgentPanel compact />
    </div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="waybill rounded-[18px] px-4 py-3">
      <dt className="text-xs text-muted">{k}</dt>
      <dd className="font-display text-lg font-semibold tabular-nums">{v}</dd>
    </div>
  );
}
