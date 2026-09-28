import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  BookMarked,
  Coffee,
  Compass,
  Clock3,
  MapPin,
  PenLine,
  Play,
  Route as RouteIcon,
  Save,
  Trash2,
} from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { useDesk } from "@/lib/store";
import { computeRouteLegs } from "@/lib/maps/route";
import { RouteMap } from "@/components/trip/RouteMap";
import { DrivingStep } from "@/components/drive/DrivingStep";
import { PLACES } from "@/lib/data/places";
import { formatDateTime, formatDuration } from "@/lib/format";
import type { Place } from "@/lib/engine/types";

export const Route = createFileRoute("/drive")({ component: DrivePage });

type Step = "select" | "summary" | "result" | "driving";
type Pending = {
  origin: Place;
  waypoints: Place[];
  destination: Place;
  title: string;
  startLocal: string;
};

function copyPlace(p: Place, kind?: Place["kind"]): Place {
  return { ...p, kind: kind ?? p.kind };
}

function bangkokNowHHMM() {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function toStartIso(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const th = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const y = th.getFullYear();
  const mo = String(th.getMonth() + 1).padStart(2, "0");
  const d = String(th.getDate()).padStart(2, "0");
  return new Date(
    `${y}-${mo}-${d}T${String(h ?? 6).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}:00+07:00`,
  ).toISOString();
}

function PlaceSelect({
  label,
  value,
  onChange,
  hint,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        className="flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {optional ? <option value="">— ไม่มี —</option> : null}
        {PLACES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.clientSite ? `SCGJWD · ${p.name}` : p.name}
          </option>
        ))}
      </select>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function DrivePage() {
  const navigate = useNavigate();
  const hydrated = useDesk((s) => s.hydrated);
  const trips = useDesk((s) => s.trips);

  const [step, setStep] = useState<Step>("select");
  const [tripId, setTripId] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const resumed = useRef(false);

  // ถ้ามีเที่ยวที่กำลังเดินทาง/พักอยู่ → กลับเข้าโหมดขับต่อทันที
  useEffect(() => {
    if (!hydrated || resumed.current) return;
    resumed.current = true;
    const active = trips.find((t) => t.status === "enroute" || t.status === "resting");
    if (active) {
      setTripId(active.id);
      setStep("driving");
    }
  }, [hydrated, trips]);

  const trip = trips.find((t) => t.id === tripId) ?? null;

  if (!hydrated) {
    return (
      <div className="waybill rounded-[28px] p-8 text-center text-sm text-muted">
        กำลังเปิดโหมดคนขับ…
      </div>
    );
  }

  if (step === "driving" && trip) {
    return (
      <div className="mx-auto max-w-3xl">
        <DrivingStep
          trip={trip}
          policy={trip.policySnapshot}
          onDone={() => {
            setTripId(null);
            setStep("select");
            void navigate({ to: "/" });
          }}
        />
      </div>
    );
  }

  if (step === "summary" && pending) {
    return (
      <div className="mx-auto max-w-3xl">
        <SummaryStep
          pending={pending}
          onBack={() => setStep("select")}
          onCalculated={(id) => {
            setTripId(id);
            setStep("result");
          }}
        />
      </div>
    );
  }

  if (step === "result" && trip) {
    return (
      <div className="mx-auto max-w-3xl">
        <ResultStep tripId={trip.id} onStart={() => setStep("driving")} onBack={() => setStep("select")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <SelectStep
        onUseSaved={(r) => {
          setPending(r);
          setStep("summary");
        }}
      />
    </div>
  );
}

/* ---------------- ขั้น 1: เลือกเส้นทาง ---------------- */

function SelectStep({
  onUseSaved,
}: {
  onUseSaved: (r: Pending) => void;
}) {
  const savedRoutes = useDesk((s) => s.savedRoutes);
  const deleteSavedRoute = useDesk((s) => s.deleteSavedRoute);
  const [originId, setOriginId] = useState("scgjwd-wangnoi");
  const [destId, setDestId] = useState("scgjwd-lcb");
  const [waypointId, setWaypointId] = useState("");
  const [startLocal, setStartLocal] = useState(bangkokNowHHMM());
  const [error, setError] = useState<string | null>(null);

  function place(id: string) {
    return PLACES.find((p) => p.id === id)!;
  }

  function startCustom() {
    setError(null);
    if (!originId || !destId) {
      setError("เลือกต้นทางและปลายทางก่อน");
      return;
    }
    const origin = copyPlace(place(originId), "origin");
    const destination = copyPlace(place(destId), "destination");
    const waypoints = waypointId ? [copyPlace(place(waypointId), "waypoint")] : [];
    if (origin.name === destination.name) {
      setError("ต้นทางกับปลายทางซ้ำกัน");
      return;
    }
    onUseSaved({
      origin,
      waypoints,
      destination,
      title: `${origin.name} → ${destination.name}`,
      startLocal,
    });
  }

  return (
    <div className="space-y-6">
      <section className="waybill rounded-[28px] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <RouteIcon className="size-5 text-primary" />
          <h1 className="font-display text-2xl font-semibold">โหมดคนขับ</h1>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          เลือกเส้นทางที่บันทึกไว้ หรือสร้างเส้นทางเอง — ระบบจะคำนวณระยะทาง เวลาเดินทาง
          และจุดพักบังคับ (ขับไม่เกิน 4 ชม. ต่อรอบ) <b>ก็ต่อเมื่อกดปุ่ม "คำนวณเส้นทาง" เท่านั้น</b>
        </p>
      </section>

      <section className="waybill rounded-[28px] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <BookMarked className="size-4 text-primary" />
          <h2 className="font-display font-semibold">เส้นทางที่บันทึกไว้</h2>
          <Badge tone="muted">{savedRoutes.length} เส้นทาง</Badge>
        </div>
        {savedRoutes.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            ยังไม่มีเส้นทางที่บันทึกไว้ — สร้างจากแบบกำหนดเองด้านล่าง แล้วกด "บันทึกเส้นทางนี้"
            ครั้งถัดไปจะเลือกใช้ซ้ำได้เลย
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {savedRoutes.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{r.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {r.origin.name}
                      {r.waypoints.length > 0 ? ` → ${r.waypoints.map((w) => w.name).join(" → ")}` : ""} →{" "}
                      {r.destination.name}
                    </p>
                    {r.note ? <p className="mt-1 text-xs text-muted">{r.note}</p> : null}
                  </div>
                  <button
                    type="button"
                    aria-label="ลบเส้นทางที่บันทึกไว้"
                    className="rounded-md p-1.5 text-muted hover:bg-surface-2"
                    onClick={() => deleteSavedRoute(r.id)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <Button
                  variant="navy"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    onUseSaved({
                      origin: r.origin,
                      waypoints: r.waypoints,
                      destination: r.destination,
                      title: r.title,
                      startLocal: bangkokNowHHMM(),
                    })
                  }
                >
                  <Play />
                  ใช้เส้นทางนี้
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="waybill rounded-[28px] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <PenLine className="size-4 text-primary" />
          <h2 className="font-display font-semibold">สร้างเส้นทางเอง</h2>
        </div>
        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            startCustom();
          }}
        >
          <PlaceSelect label="ต้นทาง" value={originId} onChange={setOriginId} hint="คลังลูกค้า SCGJWD ขึ้นก่อน" />
          <PlaceSelect label="จุดแวะระหว่างทาง (ถ้ามี)" value={waypointId} onChange={setWaypointId} optional />
          <PlaceSelect label="ปลายทาง" value={destId} onChange={setDestId} />
          <div className="space-y-1.5">
            <Label>เวลาออกเดินทาง</Label>
            <Input type="time" value={startLocal} onChange={(e) => setStartLocal(e.target.value)} />
            <p className="text-xs text-muted">เขตเวลาไทย · เมื่อกด "เริ่มเดินทาง" ระบบจะยึดเวลาจริงตอนนั้นเป็นหลัก</p>
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" variant="navy" className="w-full sm:w-auto">
            ไปตรวจเส้นทาง
          </Button>
        </form>
      </section>

      <p className="text-center text-xs text-muted">
        <Link to="/" className="underline">
          กลับหน้าโต๊ะปฏิบัติการ
        </Link>
      </p>
    </div>
  );
}

/* ---------------- ขั้น 2: สรุปก่อนคำนวณ ---------------- */

function SummaryStep({
  pending,
  onBack,
  onCalculated,
}: {
  pending: Pending;
  onBack: () => void;
  onCalculated: (tripId: string) => void;
}) {
  const createTrip = useDesk((s) => s.createTrip);
  const applyLegsAndPlan = useDesk((s) => s.applyLegsAndPlan);
  const [busy, setBusy] = useState(false);

  async function calculate() {
    setBusy(true);
    try {
      // คำนวณ "ณ เวลาที่กดเท่านั้น": สร้างเที่ยว + เรียกแผนที่ + วางจุดพัก ทั้งหมดตอนนี้
      const trip = createTrip({
        origin: pending.origin,
        waypoints: pending.waypoints,
        destination: pending.destination,
        startTime: toStartIso(pending.startLocal),
        title: pending.title,
      });
      try {
        const routed = await computeRouteLegs({
          data: { nodes: [pending.origin, ...pending.waypoints, pending.destination] },
        });
        if (routed.ok) applyLegsAndPlan(trip.id, routed.legs);
      } catch {
        // ถ้าเรียกแผนที่ไม่ได้ ยังมีแผนประมาณจากระยะตรงให้ใช้ก่อน
      }
      onCalculated(trip.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="waybill rounded-[28px] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Compass className="size-5 text-primary" />
          <h2 className="font-display text-xl font-semibold">{pending.title}</h2>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 text-muted" />
            ต้นทาง: {pending.origin.name}
          </li>
          {pending.waypoints.map((w) => (
            <li key={w.id} className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-muted" />
              จุดส่ง: {w.name}
            </li>
          ))}
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 text-muted" />
            ปลายทาง: {pending.destination.name}
          </li>
          <li className="flex items-start gap-2">
            <Clock3 className="mt-0.5 size-4 text-muted" />
            ขาออกช่วง {pending.startLocal} น. (ไทย)
          </li>
        </ul>
        <div className="mt-4 rounded-2xl bg-surface-2/60 p-4 text-sm">
          <p className="font-medium">ยังไม่มีการคำนวณใด ๆ ในขั้นนี้</p>
          <p className="mt-1 text-muted">
            กด "คำนวณเส้นทาง" — ระบบจะเรียกแผนที่ (OSRM) คำนวณระยะทาง เวลาเดินทาง
            และจุดพักที่ต้องแวะตามกฎ ขับ 4 ชม. → พัก 30 นาที ให้ครั้งเดียว ณ ตอนนั้น
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="navy" size="lg" disabled={busy} onClick={() => void calculate()}>
            {busy ? "กำลังคำนวณเส้นทาง…" : "คำนวณเส้นทาง"}
          </Button>
          <Button variant="ghost" size="lg" onClick={onBack} disabled={busy}>
            เลือกเส้นทางใหม่
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ---------------- ขั้น 3: ผลคำนวณ ---------------- */

function ResultStep({
  tripId,
  onStart,
  onBack,
}: {
  tripId: string;
  onStart: () => void;
  onBack: () => void;
}) {
  const trip = useDesk((s) => s.trips.find((t) => t.id === tripId)) ?? null;
  const saveRouteFromTrip = useDesk((s) => s.saveRouteFromTrip);
  const startTrip = useDesk((s) => s.startTrip);
  const [saved, setSaved] = useState(false);

  if (!trip) {
    return <p className="waybill rounded-[28px] p-6 text-sm text-muted">ไม่พบเที่ยววิ่งนี้</p>;
  }

  const restStops = trip.plan.stops.filter((s) => s.type === "rest");
  const totalMin = (new Date(trip.plan.eta).getTime() - new Date(trip.startTime).getTime()) / 60000;

  return (
    <div className="space-y-6">
      <section className="waybill rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="navy">ประมาณการ</Badge>
          <Badge tone={trip.plan.source === "routed" ? "ok" : "warn"}>
            {trip.plan.source === "routed" ? "จากแผนที่ OSRM" : "ประมาณจากระยะตรง (เรียกแผนที่ไม่ได้)"}
          </Badge>
        </div>
        <h2 className="mt-3 font-display text-xl font-semibold">{trip.title}</h2>
        <dl className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-surface-2/60 p-3">
            <dt className="text-xs text-muted">ระยะทางรวม</dt>
            <dd className="font-display text-lg font-semibold">{Math.round(trip.plan.totalDistanceKm)} กม.</dd>
          </div>
          <div className="rounded-2xl bg-surface-2/60 p-3">
            <dt className="text-xs text-muted">เวลาเดินทางรวม</dt>
            <dd className="font-display text-lg font-semibold">{formatDuration(totalMin)}</dd>
          </div>
          <div className="rounded-2xl bg-surface-2/60 p-3">
            <dt className="text-xs text-muted">จุดพักที่ต้องแวะ</dt>
            <dd className="font-display text-lg font-semibold">{restStops.length} จุด</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">
          ถึงปลายทางโดยประมาณ {formatDateTime(trip.plan.eta)} · ตัวเลขเป็นค่าประมาณ ไม่มีข้อมูลจราจรสด
        </p>
      </section>

      <section className="waybill rounded-[28px] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <Clock3 className="size-4 text-primary" />
          <h3 className="font-display font-semibold">ลำดับการเดินทาง (จุดพักบังคับ)</h3>
        </div>
        <ol className="mt-4 space-y-3">
          {trip.plan.stops.map((s) => (
            <li key={s.seq} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-navy-fg">
                {s.seq}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {s.type === "rest" ? <Coffee className="mr-1 inline size-4 text-rest" /> : null}
                  {s.title}
                </p>
                <p className="text-xs text-muted">
                  {(new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000 > 0.5
                    ? `${formatDuration((new Date(s.end).getTime() - new Date(s.start).getTime()) / 60000)} · `
                    : ""}
                  เริ่ม {formatDateTime(s.start)}
                  {s.note ? ` · ${s.note}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="waybill overflow-hidden rounded-[28px]">
        <div className="p-5 pb-0 sm:p-6 sm:pb-0">
          <h3 className="font-display font-semibold">แผนที่เส้นทาง</h3>
        </div>
        <div className="h-[320px] p-4 sm:p-6">
          <RouteMap
            origin={trip.origin}
            destination={trip.destination}
            waypoints={trip.waypoints}
            stops={trip.plan.stops}
          />
        </div>
      </section>

      <section className="waybill rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="navy"
            size="lg"
            onClick={() => {
              // เริ่มนับเวลาขับจริง ณ ตอนที่กด (ยึดเวลาปัจจุบันเป็นหลัก) แล้วเข้าโหมดขับ
              startTrip(trip.id);
              onStart();
            }}
          >
            <Play />
            เริ่มเดินทาง
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              saveRouteFromTrip(trip.id);
              setSaved(true);
            }}
          >
            <Save />
            {saved ? "บันทึกแล้ว ✓" : "บันทึกเส้นทางนี้ไว้ใช้ซ้ำ"}
          </Button>
          <Button variant="ghost" size="lg" onClick={onBack}>
            เลือกเส้นทางใหม่
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">
          กด "เริ่มเดินทาง" เมื่อออกรถจริง — ระบบจะเริ่มนับเวลาขับต่อเนื่องจาก 0 ทันที
          และแจ้งเตือนเมื่อใกล้ครบ 4 ชม.
        </p>
      </section>
    </div>
  );
}
