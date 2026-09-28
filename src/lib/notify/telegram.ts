import { createServerFn } from "@tanstack/react-start";

type TelegramInput = {
  text: string;
  /** ถ้าไม่ส่งมา จะใช้ค่าจาก env TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID บนเซิร์ฟเวอร์ */
  botToken?: string;
  chatId?: string;
};

/**
 * ส่งข้อความแจ้งเตือนเข้า Telegram (ทางเซิร์ฟเวอร์ — token ไม่โผล่ในฝั่งคนขับถ้าตั้ง env)
 * ตั้งค่าบนเซิร์ฟเวอร์ได้ที่ env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 */
export const sendTelegram = createServerFn({ method: "POST" })
  .validator((input: TelegramInput) => input)
  .handler(async ({ data }) => {
    const token = process.env.TELEGRAM_BOT_TOKEN || data.botToken;
    const chatId = process.env.TELEGRAM_CHAT_ID || data.chatId;
    if (!token || !chatId) {
      return { ok: false as const, error: "ยังไม่ได้ตั้งค่า Telegram (bot token / chat id)" };
    }
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: data.text,
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { description?: string } | null;
        return { ok: false as const, error: body?.description ?? `HTTP ${res.status}` };
      }
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "ส่งไม่สำเร็จ" };
    }
  });
