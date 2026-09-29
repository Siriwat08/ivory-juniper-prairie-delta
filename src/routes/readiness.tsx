import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleCheck, CircleAlert, CircleDashed, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REST_STOPS } from "@/lib/data/rest-stops";
import { useGpsSettings } from "@/lib/gps/gps";
import { integrationEnvStatus } from "@/lib/maps/google";

export const Route = createFileRoute("/readiness")({ component: ReadinessPage });

type RowStatus = "ready" | "partial" | "missing" | "manual";

const STATUS_META: Record<RowStatus, { label: string; tone: "ok" | "warn" | "danger" | "muted" }> = {
  ready: { label: "พร้อมแล้ว", tone: "ok" },
  partial: { label: "พร้อมบางส่วน", tone: "warn" },
  missing: { label: "ยังไม่พร้อม", tone: "danger" },
  manual: { label: "ต้องทำเอง", tone: "muted" },
};

function StatusIcon({ status }: { status: RowStatus }) {
  if (status === "ready") return <CircleCheck className="size-4 text-ok" />;
  if (status === "partial") return <CircleAlert className="size-4 text-warn" />;
  if (status === "missing") return <CircleAlert className="size-4 text-danger" />;
  return <CircleDashed className="size-4 text-muted" />;
}

export function ReadinessPage() {
  const gpsMode = useGpsSettings((s) => s.mode);
  const googleEnabled = useGpsSettings((s) => s.googleEnabled);
  const googleMapsKey = useGpsSettings((s) => s.googleMapsKey);
  const telegramBotToken = useGpsSettings((s) => s.telegramBotToken);
  const telegramChatId = useGpsSettings((s) => s.telegramChatId);

  const [envStatus, setEnvStatus] = useState<{
    googleEnvKey: boolean;
    telegramEnvToken: boolean;
    telegramEnvChat: boolean;
  } | null>(null);
  useEffect(() => {
    void integrationEnvStatus().then(setEnvStatus).catch(() => setEnvStatus(null));
  }, []);

  const googleOk = googleEnabled && (googleMapsKey.trim() !== "" || (envStatus?.googleEnvKey ?? false));
  const telegramOk =
    (telegramBotToken.trim() !== "" && telegramChatId.trim() !== "") ||
    (envStatus?.telegramEnvToken && envStatus?.telegramEnvChat);
  const gpsOk = gpsMode === "api";
  const gpsPartial = gpsMode === "device";
  const stopsTotal = REST_STOPS.length;
  const stopsVerified = REST_STOPS.filter(
    (s) => s.verification !== "must-verify" && s.verification !== "unverified",
  ).length;

  const rows: {
    area: string;
    status: RowStatus;
    detail: string;
    how: string;
  }[] = [
    {
      area: "Google Routes API (เวลาตามรถติดจริง)",
      status: googleOk ? "ready" : "missing",
      detail: googleOk
        ? "เปิดใช้แล้ว — เวลาคำนวณเส้นทาง/จุดพักใช้ข้อมูลรถติดจริง ณ ตอนกดคำนวณ"
        : "ยังไม่เปิด — ตอนนี้คำนวณด้วย OSRM ซึ่งไม่มีข้อมูลรถติด",
      how: "เปิดในหน้า โหมดคนขับ → เฝ้าระวัง GPS → ตั้งค่า → Google Maps (กรอก key หรือตั้ง env GOOGLE_MAPS_API_KEY ฝั่งเซิร์ฟเวอร์) พร้อมเปิด Routes API ใน Google Cloud Console",
    },
    {
      area: "Google Places API (จุดพักจริงริมทาง)",
      status: googleOk ? "ready" : "missing",
      detail: googleOk
        ? "พร้อม — ตอนรถติดจนไปไม่ถึงจุดพักเดิม ระบบจะค้นหาปั๊มน้ำมันจริงใกล้เส้นทางให้ด้วย"
        : "ยังไม่เปิด — จุดพักสำรองมาจากคลังข้อมูลภายในเท่านั้น",
      how: "ใช้ key เดียวกับ Routes API — เปิด Places API (New) ใน Google Cloud Console แล้วกด \"ทดสอบ key\" ในหน้าตั้งค่า",
    },
    {
      area: "ระบบ GPS ของรถจริง",
      status: gpsOk ? "ready" : gpsPartial ? "partial" : "missing",
      detail:
        gpsMode === "api"
          ? "ต่อระบบ GPS ผู้ให้บริการแล้ว (REST polling)"
          : gpsMode === "device"
            ? "ใช้ GPS มือถือคนขับ — พอสำหรับเที่ยวทดลอง แต่ไม่ครอบคลุมเวลารถหลายคัน"
            : gpsMode === "demo"
              ? "ยังใช้โหมดจำลองอยู่ — ห้ามใช้ตัดสินงานจริง"
              : "เฝ้าระวังปิดอยู่",
      how: "ข้อมูลจากผู้ให้บริการ GPS ของบริษัท (URL + header + ชื่อ field) กรอกในหน้าตั้งค่าเดียวกัน — token ของผู้ให้บริการควรอยู่ฝั่งเซิร์ฟเวอร์ ไม่ควรให้คนขับกรอกเอง",
    },
    {
      area: "Telegram แจ้งเตือนผู้ดูแล",
      status: telegramOk ? "ready" : envStatus ? "missing" : "partial",
      detail: telegramOk
        ? "ตั้งค่าแล้ว — เมื่อรถติดจนไปไม่ถึงจุดพักตามเวลา ระบบจะแจ้งเข้า Telegram ทันที"
        : "ยังไม่ตั้งค่า — เตือนเฉพาะเสียง/หน้าจอในเครื่องคนขับ",
      how: "สร้างบอทจาก @BotFather → token + chat id (ใส่ในหน้าตั้งค่า หรือตั้ง env TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID ฝั่งเซิร์ฟเวอร์แทนเพื่อความปลอดภัย)",
    },
    {
      area: `คลังจุดพัก (${stopsTotal} จุด) — ตรวจสอบรองรับรถจริง`,
      status: stopsVerified >= stopsTotal ? "ready" : stopsVerified > 0 ? "partial" : "manual",
      detail: `ยืนยันแล้ว ${stopsVerified}/${stopsTotal} จุด — Google รู้ว่าสถานที่อยู่ไหน แต่ไม่ได้รับประกันว่าลานรองรับรถ 10 ล้อ/พ่วง`,
      how: "ทีมปฏิบัติการลงพื้นที่/โทรยืนยันทีละจุด: ทางเข้า-ออกรถใหญ่, ที่จอด, ห้องน้ำ, ระยะเบี่ยงจากทางหลวง แล้วแก้ truckOk ใน src/lib/data/rest-stops.ts",
    },
    {
      area: "Google Cloud — ความปลอดภัยของ key และค่าใช้จ่าย",
      status: "manual",
      detail:
        "แอปเรียก Google ผ่านเซิร์ฟเวอร์เท่านั้น (key ไม่โผล่ในเบราว์เซอร์) และเรียกเฉพาะตอนคำนวณแผน/ตอนแจ้งเตือน — แต่การจำกัดสิทธิ์และโควตาต้องตั้งใน Google Cloud",
      how: "ตั้ง API restrictions (เปิดเฉพาะ Routes + Places), Application restrictions, Quota รายวัน และ Budget alert — แยก key dev/production",
    },
    {
      area: "ทดสอบเส้นทางจริง 3 เส้นทาง (pilot)",
      status: "manual",
      detail:
        "เทียบระยะทาง/เวลา OSRM vs Google vs เวลาจริง, จุดพักที่ไปถึงทัน, ค่าใช้จ่าย API ต่อเที่ยว",
      how: "1) วังน้อย → แหลมฉบัง 2) วังน้อย → นครสวรรค์ → เชียงใหม่ 3) เส้นที่รถติดประจำ — บันทึกผลแล้วปรับ buffer/ความเร็วเฉลี่ยในหน้านโยบาย",
    },
    {
      area: "Database กลาง + audit log (ใช้หลายคัน)",
      status: "manual",
      detail:
        "ตอนนี้ข้อมูลเที่ยววิ่ง/การตั้งค่าอยู่ในเครื่องแต่ละคน (localStorage) — ยังไม่เห็นข้อมูลข้ามเครื่องและยังไม่มี audit log เหตุการณ์",
      how: "ขยับไปเก็บ trips/events/settings บนฐานข้อมูลกลางที่มี auth เดียวต่อบริษัท ก่อนเปิดระบบหลายคัน",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-2xl font-semibold">ข้อมูลที่ต้องเติมก่อนใช้งานจริง</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
        ตารางนี้ตรวจสถานะอัตโนมัติจากระบบ (สีเขียว = พร้อม) ร่วมกับรายการที่ฝ่ายปฏิบัติการต้องทำเอง
        ปิดรายการให้ครบก่อนใช้กับรถจริงของ หจก.เผ่าปัญญา ทรานสปอร์ต ในงาน SCGJWD
      </p>

      <div className="mt-5 space-y-3">
        {rows.map((r) => (
          <article key={r.area} className="waybill rounded-2xl p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <StatusIcon status={r.status} />
                <h2 className="font-display font-semibold">{r.area}</h2>
              </div>
              <Badge tone={STATUS_META[r.status].tone}>{STATUS_META[r.status].label}</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{r.detail}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              <span className="font-medium text-primary">วิธีเติม: </span>
              {r.how}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild variant="navy">
          <Link to="/drive">
            <ClipboardCheck className="size-4" />
            ไปหน้าโหมดคนขับ (ตั้งค่า Google/GPS ที่นั่น)
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/policy">เปิดตารางช่องว่างนโยบาย</Link>
        </Button>
      </div>
    </div>
  );
}
