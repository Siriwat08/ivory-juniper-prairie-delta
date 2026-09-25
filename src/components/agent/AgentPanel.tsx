import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { askRouteAgent } from "@/lib/ai/chat";
import { localAgentReply, tripContext } from "@/lib/ai/prompt";
import { useActiveTrip, useDesk } from "@/lib/store";
import { cn } from "@/lib/utils";

const SUGGEST = [
  "สรุปแผนเที่ยวนี้ให้คนขับ",
  "รถติดหนัก จุดพักเดิมอาจไปไม่ทัน",
  "เหลือเวลากี่นาทีก่อนต้องพัก",
  "จุดพักถัดไปคือที่ไหน และยืนยันได้แค่ไหน",
];

export function AgentPanel({ compact = false }: { compact?: boolean }) {
  const trip = useActiveTrip();
  const policy = useDesk((s) => s.policy);
  const chat = useDesk((s) => s.chat);
  const addChat = useDesk((s) => s.addChat);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    addChat("user", q);
    setDraft("");
    setBusy(true);
    const fallback = localAgentReply(q, trip, policy);
    try {
      const history = [...useDesk.getState().chat]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await askRouteAgent({
        data: {
          messages: history,
          context: tripContext(trip, policy),
        },
      });
      addChat("assistant", res.ok ? res.text : fallback);
    } catch {
      addChat("assistant", fallback);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={cn(
        "waybill flex flex-col rounded-[28px]",
        compact ? "h-[520px]" : "h-[min(720px,calc(100dvh-8rem))]",
      )}
    >
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-display text-lg font-semibold">ผู้เชี่ยวชาญเส้นทาง</h2>
        <p className="text-xs text-muted">
          Agent ใช้ตัวเลขจากเครื่องคำนวณของโต๊ะนี้ — ไม่แต่งจุดพักเอง
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {chat.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[92%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed",
              m.role === "assistant"
                ? "bg-navy text-navy-fg"
                : "ml-auto bg-surface-2 text-fg",
            )}
          >
            {m.content}
          </div>
        ))}
        {busy ? (
          <p className="text-xs text-muted">กำลังวิเคราะห์จากแผนปัจจุบัน…</p>
        ) : null}
      </div>
      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGEST.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted hover:text-fg"
              onClick={() => send(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="เช่น เริ่มออกเดินทางแล้ว เวลาขับมา 3 ชม. 15 นาที…"
            className="min-h-12 flex-1"
            rows={2}
          />
          <Button type="submit" disabled={busy || !draft.trim()} className="self-end">
            <Send />
          </Button>
        </form>
      </div>
    </section>
  );
}
