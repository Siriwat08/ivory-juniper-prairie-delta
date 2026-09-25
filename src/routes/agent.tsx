import { createFileRoute } from "@tanstack/react-router";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { useActiveTrip } from "@/lib/store";

export const Route = createFileRoute("/agent")({ component: AgentPage });

function AgentPage() {
  const trip = useActiveTrip();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold">ผู้เชี่ยวชาญเส้นทางและเวลาพัก</h1>
      <p className="mt-2 text-sm text-muted">
        {trip
          ? `กำลังดูบริบทเที่ยว ${trip.code} · ${trip.title}`
          : "ยังไม่มีเที่ยวบนโต๊ะ — วางแผนก่อนเพื่อให้คำตอบอิงตัวเลขจริง"}
      </p>
      <div className="mt-6">
        <AgentPanel />
      </div>
    </div>
  );
}
