import { SmsSuppressionService } from "../src/sms_suppression_service.js";

const service = new SmsSuppressionService();
const tenant = service.onboardTenant("acme");
service.suppress("+14155550101");
const result = await service.send({ tenantId: tenant.tenantId, accountId: "acct-7", to: process.env.DEMO_TO ?? "+14155550101", body: "Your workspace is ready." });
console.log(result);
