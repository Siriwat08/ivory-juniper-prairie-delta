import { useEffect, useRef, useState } from "react";
import {
  CarFront,
  Coffee,
  Flag,
  Navigation,
  Pause,
  Play,
  RefreshCw,
  Satellite,
  Settings2,
  Siren,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Label } from "@/components/ui/input";
import { useDesk, continuousNowOf, restRemainingMin } from "@/lib/store";
import {
  checkGpsNow,
  useGpsLive,
  useGpsSettings,
  type GpsMode,
  type WatchdogResult,
} from "@/lib/gps/gps";
import { alertActBeep, alertWatchBeep } from "@/lib/gps/alerts";
import { sendTelegram } from "@/lib/notify/telegram";
import { formatDateTime } from "@/lib/format";
import type { Policy, RestStop, Trip } from "@/lib/engine/types";

const POLL_MS = 7 * 60 * 1000; // เช็ค GPS ทุก 7 นาที (อยู่ในช่วง 5–10 นาทีตามนโยบาย)

function mmss(min: number) {
  const total = Math.max(0, Math.round(min * 60));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function DrivingStep({
  trip,
  policy,
  onDone,
}: {
  trip: Trip;
  policy: Policy;
  onDone: () => void;
}) {
  const startRest = useDesk((s) => s.startRest);
  const finishRest = useDesk((s) => s.finishRest);
  const completeTrip = useDesk((s) => s.completeTrip);
  const advanceClock = useDesk((s) => s.advanceClock);
  const replaceNextRest = useDesk((s) => s.replaceNextRest);

  const gpsMode = useGpsSettings((s) => s.mode);
  const setGpsMode = useGpsSettings((s) => s.setMode);
  const wd = useGpsLive((s) => s.watchdog);
  const gpsStatus = useGpsLive((s) => s.status);
  const gpsError = useGpsLive((s) => s.error);
  const lastCheckAt = useGpsLive((s) => s.lastCheckAt);
  const demoFactor = useGpsLive((s) => s.demoFactor);
  const setDemoFactor = useGpsLive((s) => s.setDemoFactor);
  const pos = useGpsLive((s) => s.pos);

  const [nowMs, setNowMs] = useState(() => Date.now());
  const [showAlt, setShowAlt] = useState(false);
  const [altChoice, setAltChoice] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const lastLevel = useRef<WatchdogResult["level"] | "off">("off");

  const continuousNow = continuousNowOf(trip);
  const restLeft = restRemainingMin(trip, policy);
  const remainingDrive = Math.max(0, policy.maxContinuousMin - continuousNow);
  const budgetPct = Math.min(100, Math.max(0, (continuousNow / policy.maxContinuousMin) * 100));

  /* ---------- นาฬิกาเดินทุกวินาที ---------- */
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ---------- เฝ้าระวัง GPS ตามรอบ ---------- */
  useEffect(() => {
    if (trip.status === "completed" || gpsMode === "off") return;
    let alive = true;
    const run = async () => {
      const result = await checkGpsNow(trip, policy, continuousNowOf(trip));
      if (!alive || !result) return;
      if (lastLevel.current !== "act" && result.level === "act") {
        alertActBeep();
        void notifyOwner(trip, result);
        setShowAlt(true);
      } else if (lastLevel.current !== "watch" && result.level === "watch") {
        alertWatchBeep();
      }
      lastLevel.current = result.level;
    };
    void run();
    const t = setInterval(run, POLL_MS);
    return () => {
      alive = false;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id, trip.status, gpsMode]);

  const nextRest =
    trip.plan.stops.find(
      (s) => s.type === "rest" && s.start > new Date(nowMs).toISOString(),
    ) ?? null;

  async function manualCheck() {
    const result = await checkGpsNow(trip, policy, continuousNowOf(trip));
    if (!result) return;
    if (lastLevel.current !== "act" && result.level === "act") {
      alertActBeep();
      void notifyOwner(trip, result);
      setShowAlt(true);
    } else if (lastLevel.current !== "watch" && result.level === "watch") {
      alertWatchBeep();
    }
    lastLevel.current = result.level;
  }

  function simulateMinutes() {
    advanceClock(trip.id, 30);
    setTimeout(() => void manualCheck(), 60);
  }

  function simulateTraffic() {
    setDemoFactor(demoFactor + 0.4);
    setNote("จำลองรถหน่วงขึ้นแล้ว — กด \"เช็คตอนนี้\" เพื่อดูผลเฝ้าระวัง");
    setTimeout(() => void manualCheck(), 60);
  }

  function confirmAlternative() {
    const chosen = wd?.alternatives.find((a) => a.id === altChoice) ?? wd?.alternatives[0];
    if (!chosen) return;
    replaceNextRest(trip.id, chosen);
    setShowAlt(false);
    setAltChoice(null);
    setNote(`เปลี่ยนจุดพักเป็น "${chosen.name}" แล้ว — แผนถัดไปเป็นประมาณการ`);
    void sendTelegram({
      data: {
        text: `✅ [Route Desk] เที่ยว ${trip.code}\nเปลี่ยนจุดพักเป็น ${chosen.name} แล้ว`,
      },
    }).then((r) => {
      if (!r.ok) setNote(`เปลี่ยนจุดพักแล้ว (แต่แจ้ง Telegram ไม่สำเร็จ: ${r.error})`);
    });
    setTimeout(() => void manualCheck(), 80);
  }

  const modeChip: Record<GpsMode, { label: string; tone: "muted" | "primary" | "ok" | "warn" }> = {
    off: { label: "เฝ้าระวังปิดอยู่", tone: "muted" },
    demo: { label: "โหมดจำลอง", tone: "warn" },
    device: { label: "GPS เครื่องนี้", tone: "ok" },
    api: { label: "ระบบ GPS ผู้ให้บริการ", tone: "ok" },
  };

  return (
    <div className="space-y-5">
      {/* สถานะ + นาฬิกาหลัก */}
      <section className="waybill rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              {trip.code} · กำลังเดินทาง
            </p>
            <h2 className="font-display text-lg font-semibold">{trip.title}</h2>
          </div>
          <Badge tone={trip.status === "resting" ? "rest" : "primary"}>
            {trip.status === "resting" ? "พักอยู่" : trip.status === "enroute" ? "ขับอยู่" : trip.status === "completed" ? "ถึงปลายทางแล้ว" : "ยังไม่เริ่ม"}
          </Badge>
        </div>

        {trip.status === "resting" ? (
          <div className="mt-5 rounded-2xl bg-rest-fg p-5 text-center">
            <p className="text-sm font-medium text-rest">กำลังพัก — ห้ามออกเดินทางก่อนครบ</p>
            <p className="mt-1 font-display text-5xl font-semibold tabular-nums text-rest">
              {mmss(restLeft ?? 0)}
            </p>
            <p className="mt-1 text-xs text-rest/80">
              {restLeft !== null && restLeft <= 0
                ? "พักครบ 30 นาทีแล้ว — ยืนยันออกเดินทางต่อได้เลย"
                : "เมื่อครบ 30 นาที ปุ่ม \"ออกเดินทางต่อ\" จะเปิดให้กด"}
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-end justify-between">
              <p className="text-sm text-muted">เวลาขับต่อเนื่องที่เหลือ (เพดาน 4 ชม.)</p>
              <p className="text-xs tabular-nums text-muted">
                ขับแล้ว {Math.round(continuousNow)} นาที
              </p>
            </div>
            <p
              className={`font-display text-6xl font-semibold tabular-nums leading-none ${
                remainingDrive <= 15 ? "text-danger" : remainingDrive <= 60 ? "text-warn" : "text-fg"
              }`}
            >
              {mmss(remainingDrive)}
            </p>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full transition-all ${
                  budgetPct > 90 ? "bg-danger" : budgetPct > 70 ? "bg-warn-fg" : "bg-primary"
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
        )}

        {/* จุดพักถัดไป */}
        {nextRest && trip.status !== "completed" ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-surface-2/60 p-4">
            <Coffee className="mt-0.5 size-5 text-rest" />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted">จุดพักถัดไปที่ต้องแวะ</p>
              <p className="font-medium">{nextRest.place.name}</p>
              <p className="text-xs text-muted">
                ถึงโดยประมาณ {formatDateTime(nextRest.start)} · พัก {nextRest.restMin} นาที
              </p>
            </div>
          </div>
        ) : null}

        {/* ปุ่มควบคุม */}
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {trip.status === "enroute" ? (
            <Button variant="navy" size="lg" onClick={() => startRest(trip.id)}>
              <Pause />
              เริ่มพัก 30 นาที
            </Button>
          ) : null}
          {trip.status === "resting" ? (
            <Button
              variant="navy"
              size="lg"
              disabled={(restLeft ?? 0) > 0}
              onClick={() => finishRest(trip.id)}
            >
              <Play />
              ออกเดินทางต่อ
            </Button>
          ) : null}
          {trip.status !== "completed" ? (
            <Button variant="outline" size="lg" onClick={() => completeTrip(trip.id)}>
              <Flag />
              ถึงปลายทางแล้ว
            </Button>
          ) : (
            <Button variant="navy" size="lg" onClick={onDone}>
              <Flag />
              สรุปเที่ยววิ่ง & กลับหน้าหลัก
            </Button>
          )}
        </div>

        {note ? <p className="mt-3 text-sm text-primary">{note}</p> : null}
      </section>

      {/* แถบเตือนจากเครื่องเฝ้าระวัง */}
      {gpsMode !== "off" && wd ? (
        <section
          className={`rounded-[28px] border p-5 ${
            wd.level === "act"
              ? "border-danger/40 bg-danger-fg"
              : wd.level === "watch"
                ? "border-warn/40 bg-warn-fg"
                : "border-border bg-surface"
          }`}
        >
          <div className="flex items-start gap-3">
            {wd.level === "act" ? (
              <Siren className="mt-0.5 size-5 text-danger" />
            ) : (
              <TriangleAlert className={`mt-0.5 size-5 ${wd.level === "watch" ? "text-warn" : "text-ok-fg"}`} />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {wd.level === "act" ? "ต้องดำเนินการทันที" : wd.level === "watch" ? "เฝ้าระวัง" : "สถานะปกติ"}
              </p>
              <p className="mt-1 text-sm leading-relaxed">{wd.message}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                <span>ความคืบหน้า {Math.round(wd.progressFrac * 100)}%</span>
                <span>· ล่าช้า ~{Math.round(wd.delayMin)} นาที</span>
                {wd.nextRestName ? <span>· จุดพักถัดไป {Math.round(wd.nextRestEtaMin ?? 0)} นาที</span> : null}
              </div>
              {wd.level === "act" && wd.alternatives.length > 0 ? (
                <Button variant="danger" className="mt-3" onClick={() => setShowAlt(true)}>
                  ดูจุดพักแนะนำ ({wd.alternatives.length})
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* แผงเฝ้าระวัง GPS */}
      <section className="waybill rounded-[28px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Satellite className="size-4 text-muted" />
            <h3 className="font-display font-semibold">เฝ้าระวังรถติด (GPS)</h3>
            <Badge tone={modeChip[gpsMode].tone}>{modeChip[gpsMode].label}</Badge>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-primary"
            onClick={() => setShowSettings((v) => !v)}
          >
            <Settings2 className="size-3.5" />
            ตั้งค่า
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ["off", "ปิด"],
              ["demo", "จำลอง (ทดสอบ)"],
              ["device", "GPS เครื่องนี้"],
              ["api", "ระบบ GPS จริง"],
            ] as [GpsMode, string][]
          ).map(([m, label]) => (
            <Button
              key={m}
              size="sm"
              variant={gpsMode === m ? "navy" : "outline"}
              onClick={() => {
                setGpsMode(m);
                lastLevel.current = "off";
              }}
            >
              {label}
            </Button>
          ))}
        </div>

        {gpsMode !== "off" ? (
          <>
            <div className="mt-3 space-y-1 text-sm">
              {gpsStatus === "error" && gpsError ? (
                <p className="text-danger">ผิดพลาด: {gpsError}</p>
              ) : null}
              {pos ? (
                <p className="text-muted">
                  ตำแหน่งล่าสุด {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)} · เช็คเมื่อ{" "}
                  {lastCheckAt ? formatDateTime(lastCheckAt) : "-"}
                </p>
              ) : (
                <p className="text-muted">ยังไม่มีตำแหน่ง — กด \"เช็คตอนนี้\" เพื่อดึงครั้งแรก</p>
              )}
              <p className="text-xs text-muted">เช็คอัตโนมัติทุก 7 นาทีระหว่างเที่ยววิ่ง</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => void manualCheck()}>
                <RefreshCw />
                เช็คตอนนี้
              </Button>
              {gpsMode === "demo" ? (
                <>
                  <Button size="sm" variant="outline" onClick={simulateMinutes}>
                    <Timer />
                    จำลอง +30 นาที
                  </Button>
                  <Button size="sm" variant="warn" onClick={simulateTraffic}>
                    <CarFront />
                    จำลองรถติดขึ้น
                  </Button>
                </>
              ) : null}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">
            เปิดเพื่อให้ระบบคอยเทียบตำแหน่งรถกับแผน — ถ้ารถติดจนไปไม่ถึงจุดพักเดิมตามเวลา
            ระบบจะเตือนพร้อมจุดพักแนะนำทันที
          </p>
        )}

        {showSettings ? <GpsSettingsPanel onSaved={() => setNote("บันทึกการตั้งค่าแล้ว")} /> : null}
      </section>

      {/* บันทึกเหตุการณ์ */}
      <section className="waybill rounded-[28px] p-5">
        <h3 className="font-display font-semibold">บันทึกเหตุการณ์ล่าสุด</h3>
        <ul className="mt-3 space-y-2">
          {trip.events.slice(0, 6).map((e) => (
            <li key={e.id} className="flex justify-between gap-3 text-xs">
              <span>{e.label}</span>
              <span className="shrink-0 tabular-nums text-muted">{formatDateTime(e.at)}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* โมดัลเลือกจุดพักใหม่ */}
      {showAlt && wd && wd.alternatives.length > 0 ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="waybill w-full max-w-lg rounded-[24px] bg-surface p-5">
            <div className="flex items-start gap-3">
              <Navigation className="mt-0.5 size-5 text-danger" />
              <div>
                <h3 className="font-display text-lg font-semibold text-danger">
                  จะไปไม่ถึงจุดพักเดิมตามเวลา
                </h3>
                <p className="mt-1 text-sm text-muted">
                  เลือกจุดพักใหม่ที่ระบบคำนวณแล้วว่าไปทันภายในเวลาขับที่เหลือ
                  จากนั้นแผนจะปรับให้ทันที
                </p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {wd.alternatives.map((a) => (
                <li key={a.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${
                      altChoice === a.id || (!altChoice && a === wd.alternatives[0])
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name="alt-rest"
                      className="mt-1"
                      checked={altChoice === a.id || (!altChoice && a === wd.alternatives[0])}
                      onChange={() => setAltChoice(a.id)}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium">{a.name}</span>
                      <span className="block text-xs text-muted">
                        {a.note}
                        {a.highway ? ` · ${a.highway}` : ""}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <Button variant="navy" className="flex-1" onClick={confirmAlternative}>
                ยืนยันจุดพักใหม่
              </Button>
              <Button variant="ghost" onClick={() => setShowAlt(false)}>
                ปิด
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

async function notifyOwner(trip: Trip, result: WatchdogResult) {
  const pos = useGpsLive.getState().pos;
  const lines = [
    `🚨 [Route Desk] เที่ยว ${trip.code}`,
    `รถติด! คาดว่าจะไปไม่ถึงจุดพักเดิมตามเวลา`,
    result.nextRestName ? `จุดพักเดิม: ${result.nextRestName}` : "",
    `ล่าช้าสะสม ~${Math.round(result.delayMin)} นาที · เวลาขับที่เหลือ ${Math.round(result.remainingDriveMin)} นาที`,
    pos ? `พิกัดรถ: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}` : "",
    pos ? `แผนที่: https://maps.google.com/?q=${pos.lat},${pos.lng}` : "",
  ].filter(Boolean);
  await sendTelegram({ data: { text: lines.join("\n") } });
}

function GpsSettingsPanel({ onSaved }: { onSaved: () => void }) {
  const apiConfig = useGpsSettings((s) => s.apiConfig);
  const setApiConfig = useGpsSettings((s) => s.setApiConfig);
  const botToken = useGpsSettings((s) => s.telegramBotToken);
  const chatId = useGpsSettings((s) => s.telegramChatId);
  const setTelegram = useGpsSettings((s) => s.setTelegram);

  const [url, setUrl] = useState(apiConfig.url);
  const [method, setMethod] = useState(apiConfig.method);
  const [headersJson, setHeadersJson] = useState(apiConfig.headersJson);
  const [bodyJson, setBodyJson] = useState(apiConfig.bodyJson);
  const [latPath, setLatPath] = useState(apiConfig.latPath);
  const [lngPath, setLngPath] = useState(apiConfig.lngPath);
  const [speedPath, setSpeedPath] = useState(apiConfig.speedPath);
  const [token, setToken] = useState(botToken);
  const [chat, setChat] = useState(chatId);

  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-border bg-surface-2/40 p-4 text-sm">
      <div>
        <p className="font-medium">ต่อระบบ GPS ผู้ให้บริการ (REST)</p>
        <p className="mt-1 text-xs text-muted">
          กรอกตามเอกสาร API ของผู้ให้บริการ — เช่น URL ตำแหน่งล่าสุดของรถ, header สำหรับ key
          และชื่อ field ของพิกัดในผลลัพธ์ JSON
        </p>
        <div className="mt-3 space-y-2">
          <div className="grid gap-2 sm:grid-cols-[1fr_110px]">
            <Input placeholder="https://api.example.com/positions?vehicle=..." value={url} onChange={(e) => setUrl(e.target.value)} />
            <select
              className="h-11 rounded-md border border-border bg-surface px-3 text-sm"
              value={method}
              onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </div>
          <Input placeholder='Headers (JSON) เช่น {"Authorization": "Bearer xxx"}' value={headersJson} onChange={(e) => setHeadersJson(e.target.value)} />
          {method === "POST" ? (
            <Input placeholder='Body (JSON) เช่น {"vehicleId":"รถ-01"}' value={bodyJson} onChange={(e) => setBodyJson(e.target.value)} />
          ) : null}
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="lat path" value={latPath} onChange={(e) => setLatPath(e.target.value)} />
            <Input placeholder="lng path" value={lngPath} onChange={(e) => setLngPath(e.target.value)} />
            <Input placeholder="speed path (ถ้ามี)" value={speedPath} onChange={(e) => setSpeedPath(e.target.value)} />
          </div>
          <p className="text-xs text-muted">
            ตัวอย่าง: ถ้า API ตอบ {"{"}"d":[{"{"}"lat":14.2,"lng":100.7{"}"}]{"}"} → ใส่ lat path เป็น d.0.lat
          </p>
        </div>
      </div>

      <div>
        <p className="font-medium">แจ้งเจ้าของผ่าน Telegram</p>
        <p className="mt-1 text-xs text-muted">
          สร้างบอทจาก @BotFather → ได้ token → ส่งข้อความถึงบอท 1 ครั้ง → หา chat id
          จาก @userinfobot แล้ววางที่นี่ (หรือตั้ง env TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
          บนเซิร์ฟเวอร์แทนได้)
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Input placeholder="Bot token จาก @BotFather" value={token} onChange={(e) => setToken(e.target.value)} />
          <Input placeholder="Chat id ของคุณ/กลุ่ม" value={chat} onChange={(e) => setChat(e.target.value)} />
        </div>
      </div>

      <Button
        variant="navy"
        size="sm"
        onClick={() => {
          setApiConfig({ url, method, headersJson, bodyJson, latPath, lngPath, speedPath });
          setTelegram(token.trim(), chat.trim());
          onSaved();
        }}
      >
        บันทึกการตั้งค่า
      </Button>
    </div>
  );
}
