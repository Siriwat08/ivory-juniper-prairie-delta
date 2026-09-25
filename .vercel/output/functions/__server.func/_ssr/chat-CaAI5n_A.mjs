import { t as createServerFn } from "./ssr.mjs";
import { t as AGENT_SYSTEM } from "./prompt-BdRKVHsw.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/chat-CaAI5n_A.js
var askRouteAgent_createServerFn_handler = createServerRpc({
	id: "081c4b3ee2d8d52d01e076e1621a10e1d70a3a069a0c9ad08298cb9ddbab5c28",
	name: "askRouteAgent",
	filename: "src/lib/ai/chat.ts"
}, (opts) => askRouteAgent.__executeServer(opts));
var askRouteAgent = createServerFn({ method: "POST" }).validator((input) => input).handler(askRouteAgent_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "unavailable"
	};
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: .3,
				max_tokens: 700,
				messages: [
					{
						role: "system",
						content: AGENT_SYSTEM
					},
					{
						role: "system",
						content: `บริบทจากเครื่องคำนวณของระบบ (ยึดตัวเลขนี้ ห้ามแต่ง):\n${data.context}`
					},
					...data.messages.slice(-8)
				]
			}),
			signal: AbortSignal.timeout(25e3)
		});
		if (!res.ok) return {
			ok: false,
			error: `xAI ${res.status}`
		};
		const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
		if (!text) return {
			ok: false,
			error: "empty"
		};
		return {
			ok: true,
			text
		};
	} catch {
		return {
			ok: false,
			error: "network"
		};
	}
});
//#endregion
export { askRouteAgent_createServerFn_handler };
