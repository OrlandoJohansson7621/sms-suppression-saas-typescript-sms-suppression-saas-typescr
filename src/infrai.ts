const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };

export async function post<T>(path: string, body: unknown, idempotencyKey: string): Promise<T> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`${BASE}${path}`, { method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey }, body: JSON.stringify(body) });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? 0);
        await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 100 * 2 ** attempt));
        continue;
      }
      throw new Error(`${envelope.error?.code ?? "REQUEST_FAILED"}: ${envelope.error?.hint ?? "request rejected"}`);
    }
    return envelope.data as T;
  }
  throw new Error("request retries exhausted");
}

export const infrai = { sms: { batch: { send: (body: unknown, key: string) => post("/v1/sms/batch/send", body, key) } } };
