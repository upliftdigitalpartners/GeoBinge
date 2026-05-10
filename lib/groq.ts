/**
 * Tiny Groq client. Uses the OpenAI-compatible chat completions endpoint.
 * Free tier on Groq: ~30 req/min for llama-3.3-70b-versatile. Plenty for one user.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
export const GROQ_MODEL = "llama-3.3-70b-versatile";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function groqJSON<T>(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<T> {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local — get one free at console.groq.com.",
    );
  }
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 600,
      response_format: { type: "json_object" },
    }),
    // Don't cache LLM calls
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status} — ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned no content");
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(`Groq returned non-JSON content: ${content.slice(0, 300)}`);
  }
}
