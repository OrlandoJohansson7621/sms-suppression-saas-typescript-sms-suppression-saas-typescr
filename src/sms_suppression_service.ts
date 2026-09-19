import { z } from "zod";
import { infrai } from "./infrai.js";

const sendSchema = z.object({ tenantId: z.string().min(1), accountId: z.string().min(1), to: z.string().regex(/^\+[1-9]\d{7,14}$/), body: z.string().min(1).max(480) });
export type SmsRequest = z.infer<typeof sendSchema>;

export class SmsSuppressionService {
  private readonly suppressed = new Set<string>();
  onboardTenant(tenantId: string) { return { tenantId, status: "active" as const }; }
  suspendAccount(accountId: string, phone: string) { this.suppressed.add(phone); return { accountId, status: "suspended" as const }; }
  restoreAccount(accountId: string, phone: string) { this.suppressed.delete(phone); return { accountId, status: "active" as const }; }
  suppress(phone: string) { this.suppressed.add(phone); }
  canSend(phone: string) { return !this.suppressed.has(phone); }

  async send(input: unknown) {
    const request = sendSchema.parse(input);
    if (!this.canSend(request.to)) return { status: "suppressed" as const, to: request.to };
    const data = await infrai.sms.batch.send({ messages: [{ to: request.to, body: request.body }] }, `${request.tenantId}:${request.accountId}:${request.to}`);
    return { status: "sent" as const, to: request.to, data };
  }
}
