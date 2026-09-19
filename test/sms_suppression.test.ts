import test from "node:test";
import assert from "node:assert/strict";
import { SmsSuppressionService } from "../src/sms_suppression_service.js";

test("suspended account is rejected before a provider call", async () => {
  const service = new SmsSuppressionService();
  service.suspendAccount("acct-7", "+14155550101");
  const result = await service.send({ tenantId: "acme", accountId: "acct-7", to: "+14155550101", body: "hello" });
  assert.deepEqual(result, { status: "suppressed", to: "+14155550101" });
});
