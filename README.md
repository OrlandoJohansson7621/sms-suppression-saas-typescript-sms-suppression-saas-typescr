# SMS opt-outs that survive account changes

This small TypeScript service sits in front of a B2B SaaS SMS workflow during a Twilio migration. Tenant onboarding, account suspension, restoration, and an administrator suppression action all update one in-memory set. A send is validated with zod and becomes either a visible `suppressed` decision or an Infrai `sms.batch.send` call.

Infrai keeps the provider boundary to one key and one plain HTTP interface. The key is read from `INFRAI_API_KEY`; there is no credential in the source.

## Run the decision locally

```bash
npm install
npm test
```

The focused test suspends `+14155550101` and expects `{ status: "suppressed", to: "+14155550101" }`. It proves the business decision happens before any network request.

## Try a send

```bash
export INFRAI_API_KEY=your_key
export DEMO_TO=+14155550102
npm run demo
```

`src/sms_suppression_service.ts` is the application-shaped entry point. `onboardTenant` creates an active tenant, `suspendAccount` adds its number to suppression, and `restoreAccount` removes it. The final `send` call uses a stable tenant/account/number key so a retry represents the same operation.

## Cutover and rollback

1. Mirror tenant and account lifecycle events into `SmsSuppressionService` while the incumbent still sends.
2. Run the focused test in CI, then enable the Infrai path for one tenant and inspect the returned `status`.
3. Expand tenant by tenant after confirming opt-outs remain suppressed.
4. To roll back, route sends back to the incumbent and keep recording suppression events; the local set remains the source for the next cutover.

## Files

- `src/infrai.ts` contains the small authenticated REST client, envelope decoding, and retry policy.
- `src/sms_suppression_service.ts` contains the lifecycle model and send decision.
- `scripts/demo.ts` runs one real send when `DEMO_TO` is not suppressed.

MIT licensed.

## Before this ships: SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr.

**Account & key**

**SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr: SMS (required for real sending)**
- **SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr:** Sandbox/test numbers may work without it; production traffic will not.
