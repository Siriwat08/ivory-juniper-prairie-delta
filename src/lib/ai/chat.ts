import { createServerFn } from "@tanstack/react-start";
import { AGENT_SYSTEM } from "./prompt";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const askRouteAgent = createServerFn({ method: "POST" })
  .validator((input: { messages: ChatMessage[]; context: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "unavailable" };
    }
    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.3,
          max_tokens: 700,
          messages: [
            { role: "system", content: AGENT_SYSTEM },
            {
              role: "system",
              content: `บริบทจากเครื่องคำนวณของระบบ (ยึดตัวเลขนี้ ห้ามแต่ง):\n${data.context}`,
            },
            ...data.messages.slice(-8),
          ],
        }),
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) {
        return { ok: false as const, error: `xAI ${res.status}` };
      }
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content?.trim() ?? "";
      if (!text) return { ok: false as const, error: "empty" };
      return { ok: true as const, text };
    } catch {
      return { ok: false as const, error: "network" };
    }
  });
