import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { PLACES } from "@/lib/data/places";
import { uid } from "@/lib/utils";
import type { Place } from "@/lib/engine/types";
import { useDesk } from "@/lib/store";
import { useGpsSettings } from "@/lib/gps/gps";
import { computeRouteLegs } from "@/lib/maps/route";

function copyPlace(p: Place, kind?: Place["kind"]): Place {
  return { ...p, id: uid(p.id), kind };
}

export function PlannerForm() {
  const navigate = useNavigate();
  const createTrip = useDesk((s) => s.createTrip);
  const applyLegsAndPlan = useDesk((s) => s.applyLegsAndPlan);
  const [originId, setOriginId] = useState("scgjwd-wangnoi");
  const [destId, setDestId] = useState("chiangmai");
  const [waypointIds, setWaypointIds] = useState<string[]>(["nakhonsawan"]);
  const [startLocal, setStartLocal] = useState("06:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function place(id: string) {
    return PLACES.find((p) => p.id === id)!;
  }

  async function submit() {
    setError(null);
    const origin = copyPlace(place(originId), "origin");
    const destination = copyPlace(place(destId), "destination");
    const waypoints = waypointIds
      .filter(Boolean)
      .map((id) => copyPlace(place(id), "waypoint"));
    if (origin.name === destination.name) {
      setError("ต้นทางกับปลายทางซ้ำกัน");
      return;
    }
    const startTime = toStartIso(startLocal);
    setBusy(true);
    const trip = createTrip({
      origin,
      waypoints,
      destination,
      startTime,
      title: `${origin.name} → ${destination.name}`,
    });
    try {
      // ถ้าเปิดใช้ Google ในหน้าตั้งค่าไว้ จะส่ง key ขึ้นเซิร์ฟเวอร์เพื่อคำนวณแบบใช้รถติดจริง
      const gps = useGpsSettings.getState();
      const apiKey = gps.googleEnabled ? gps.googleMapsKey.trim() || undefined : undefined;
      const routed = await computeRouteLegs({
        data: { nodes: [origin, ...waypoints, destination], apiKey },
      });
      if (routed.ok) applyLegsAndPlan(trip.id, routed.legs, routed.meta);
    } catch {
      // keep fallback plan
    } finally {
      setBusy(false);
      void navigate({ to: "/trip/$id", params: { id: trip.id } });
    }
  }

  return (
    <form
      className="waybill space-y-5 rounded-[28px] p-5"
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <PlaceSelect
        label="ต้นทาง"
        value={originId}
        onChange={setOriginId}
        hint="คลังลูกค้า SCGJWD ขึ้นก่อน"
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>จุดแวะระหว่างทาง</Label>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-primary"
            onClick={() => setWaypointIds((w) => [...w, "khonkaen"])}
          >
            <Plus className="size-3.5" />
            เพิ่มจุดแวะ
          </button>
        </div>
        {waypointIds.length === 0 ? (
          <p className="text-sm text-muted">ไม่มีจุดแวะ — วิ่งตรงไปปลายทาง</p>
        ) : (
          waypointIds.map((id, i) => (
            <div key={`${id}-${i}`} className="flex gap-2">
              <select
                className="h-11 flex-1 rounded-md border border-border bg-surface px-3 text-sm"
                value={id}
                onChange={(e) =>
                  setWaypointIds((w) => w.map((x, j) => (j === i ? e.target.value : x)))
                }
              >
                {PLACES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.clientSite ? `SCGJWD · ${p.name}` : p.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setWaypointIds((w) => w.filter((_, j) => j !== i))}
              >
                <Trash2 />
              </Button>
            </div>
          ))
        )}
      </div>
      <PlaceSelect label="ปลายทาง" value={destId} onChange={setDestId} />
      <div className="space-y-1.5">
        <Label>เวลาเริ่มเดินทาง</Label>
        <Input
          type="time"
          value={startLocal}
          onChange={(e) => setStartLocal(e.target.value)}
        />
        <p className="text-xs text-muted">ใช้เขตเวลาไทย · วันที่เป็นวันนี้หรือพรุ่งนี้ตามเวลาจริง</p>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" variant="navy" disabled={busy} className="w-full sm:w-auto">
        {busy ? "กำลังคำนวณเส้นทาง…" : "สร้างแผนตามกฎ 4 ชม. / 30 นาที"}
      </Button>
    </form>
  );
}

function PlaceSelect({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <select
        className="flex h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
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

function toStartIso(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const th = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
  const y = th.getFullYear();
  const mo = String(th.getMonth() + 1).padStart(2, "0");
  const d = String(th.getDate()).padStart(2, "0");
  const iso = new Date(
    `${y}-${mo}-${d}T${String(h ?? 6).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}:00+07:00`,
  );
  return iso.toISOString();
}
