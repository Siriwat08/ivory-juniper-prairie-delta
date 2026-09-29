import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/telegram-GimeISrX.js
/**
* ส่งข้อความแจ้งเตือนเข้า Telegram (ทางเซิร์ฟเวอร์ — token ไม่โผล่ในฝั่งคนขับถ้าตั้ง env)
* ตั้งค่าบนเซิร์ฟเวอร์ได้ที่ env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
*/
var sendTelegram_createServerFn_handler = createServerRpc({
	id: "29928070137f19f70d54ef51d806d8976f73f77f0bcdeaa6d0e5d4c9d28d1dbb",
	name: "sendTelegram",
	filename: "src/lib/notify/telegram.ts"
}, (opts) => sendTelegram.__executeServer(opts));
var sendTelegram = createServerFn({ method: "POST" }).validator((input) => input).handler(sendTelegram_createServerFn_handler, async ({ data }) => {
	const token = process.env.TELEGRAM_BOT_TOKEN || data.botToken;
	const chatId = process.env.TELEGRAM_CHAT_ID || data.chatId;
	if (!token || !chatId) return {
		ok: false,
		error: "ยังไม่ได้ตั้งค่า Telegram (bot token / chat id)"
	};
	try {
		const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				chat_id: chatId,
				text: data.text,
				disable_web_page_preview: true
			}),
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) return {
			ok: false,
			error: (await res.json().catch(() => null))?.description ?? `HTTP ${res.status}`
		};
		return { ok: true };
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : "ส่งไม่สำเร็จ"
		};
	}
});
//#endregion
export { sendTelegram_createServerFn_handler };
