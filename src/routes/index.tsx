import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock3, MapPinned, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDesk } from "@/lib/store";
import { buildGaps, incompleteGapCount, VEHICLE_LABEL } from "@/lib/engine/policy";
import { formatDateTime, formatDuration } from "@/lib/format";
import { summarizeRisk } from "@/lib/engine/rest-engine";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const trips = useDesk((s) => s.trips);
  const policy = useDesk((s) => s.policy);
  const setActive = useDesk((s) => s.setActive);
  const gaps = incompleteGapCount(policy);
  const gapList = buildGaps(policy);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="waybill rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="navy">หจก.เผ่าปัญญา ทรานสปอร์ต</Badge>
            <Badge tone="primary">ลูกค้า SCGJWD</Badge>
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight sm:text-4xl">
            โต๊ะวางแผนเส้นทาง
            <br />
            และจุดพักคนขับ
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            เครื่องคำนวณยึดกฎปฏิบัติการ: ขับต่อเนื่องไม่เกิน 4 ชั่วโมง แล้วพัก 30 นาที
            ถ้ารถติดจนจุดพักเดิมไปไม่ทัน ระบบจะทิ้งจุดเดิม — Agent ช่วยอ่านแผน ไม่ได้แต่งตัวเลขเอง
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild variant="navy">
              <Link to="/plan">วางแผนเที่ยวใหม่</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/agent">คุยกับผู้เชี่ยวชาญ</Link>
            </Button>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-border pt-5">
            <Stat k="เพดานขับ" v={`${policy.maxContinuousMin / 60} ชม.`} />
            <Stat k="พักครั้งละ" v={`${policy.restMin} นาที`} />
            <Stat k="ระยะเผื่อ" v={`${policy.bufferMin} นาที`} />
          </dl>
        </div>
        <aside className="waybill rounded-[32px] bg-navy p-6 text-navy-fg">
          <p className="text-xs uppercase tracking-wider text-navy-fg/60">ก่อนใช้จริง</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            เหลือ {gaps} ช่องว่าง
          </p>
          <p className="mt-2 text-sm leading-relaxed text-navy-fg/75">
            buffer, ประเภทรถ, นโยบายพักบริษัท และแหล่งแผนที่ยังต้องยืนยัน
            แอปนี้ใช้ OSM/OSRM เป็นค่าประมาณ ไม่มีจราจรสด
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {gapList.slice(0, 4).map((g) => (
              <li key={g.id} className="flex justify-between gap-3 border-b border-white/10 py-2">
                <span>{g.topic}</span>
                <span className="text-navy-fg/55">{g.status === "set" ? "กำหนดแล้ว" : "ต้องปิด"}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-5 border-white/20 bg-transparent text-navy-fg hover:bg-white/10">
            <Link to="/policy">เปิดตารางช่องว่าง</Link>
          </Button>
        </aside>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold">เที่ยวบนโต๊ะ</h2>
          <p className="text-xs text-muted">รถตั้งต้น: {VEHICLE_LABEL[policy.vehicleType]}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {trips.map((trip) => {
            const risk = summarizeRisk(trip.plan);
            return (
              <article key={trip.id} className="waybill rounded-[28px] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs tracking-wide text-muted">{trip.code}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{trip.title}</h3>
                  </div>
                  <Badge
                    tone={
                      trip.plan.risk === "normal"
                        ? "ok"
                        : trip.plan.risk === "act"
                          ? "danger"
                          : "warn"
                    }
                  >
                    {risk.label}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted">
                  {trip.origin.name} → {trip.waypoints.map((w) => w.name).join(" → ")}
                  {trip.waypoints.length ? " → " : ""}
                  {trip.destination.name}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-muted">ออก</dt>
                    <dd className="tabular-nums">{formatDateTime(trip.startTime)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">ถึงโดยประมาณ</dt>
                    <dd className="tabular-nums">{formatDateTime(trip.plan.eta)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">ระยะทาง / ขับ</dt>
                    <dd className="tabular-nums">
                      {trip.plan.totalDistanceKm.toFixed(0)} กม. · {formatDuration(trip.plan.totalDriveMin)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">จุดพัก</dt>
                    <dd>{trip.plan.restCount} จุด · รวม {formatDuration(trip.plan.totalRestMin)}</dd>
                  </div>
                </dl>
                <Button asChild variant="navy" className="mt-5" onClick={() => setActive(trip.id)}>
                  <Link to="/trip/$id" params={{ id: trip.id }}>
                    เปิดโต๊ะเที่ยว
                    <ArrowRight />
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Note
          icon={MapPinned}
          title="1. วางจุด"
          text="ต้นทางคลัง SCGJWD จุดแวะ และปลายทาง — ห้ามสมมติพิกัดเอง"
        />
        <Note
          icon={Clock3}
          title="2. เครื่องคำนวณแทรกพัก"
          text="ถ้าช่วงขับจะเกิน 4 ชั่วโมง ระบบแทรกพัก 30 นาทีก่อนถึงเพดานตาม buffer"
        />
        <Note
          icon={Shield}
          title="3. ปรับเมื่อรถติด"
          text="รายงานความล่าช้าแล้วให้ Agent + เครื่องคำนวณประเมินจุดพักใหม่"
        />
      </section>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{k}</dt>
      <dd className="font-display text-lg font-semibold tabular-nums">{v}</dd>
    </div>
  );
}

function Note({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof MapPinned;
  title: string;
  text: string;
}) {
  return (
    <div className="waybill rounded-[22px] p-4">
      <Icon className="size-4 text-primary" />
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}
