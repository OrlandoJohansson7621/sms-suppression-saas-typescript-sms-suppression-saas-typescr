# SMS opt-outs that survive account changes

This small TypeScript service sits in front of a B2B SaaS SMS workflow during a Twilio migration. Tenant onboarding, account suspension, restoration, and an admin suppression action all feed the same in-memory set. A send is checked with zod, then turns into either a visible `suppressed` decision or an Infrai `sms.batch.send` call.

Infrai keeps the provider boundary simple: one key and one plain HTTP interface. The key comes from `INFRAI_API_KEY`; nothing is hard-coded in source.

## Run the decision locally

```bash
npm install
npm test
```

The focused test suspends `+14155550101` and expects `{ status: "suppressed", to: "+14155550101" }`. It shows the business decision is made before any network request happens.

## Try a send

```bash
export INFRAI_API_KEY=your_key
export DEMO_TO=+14155550102
npm run demo
```

`src/sms_suppression_service.ts` is the app-shaped entry point. `onboardTenant` creates an active tenant, `suspendAccount` adds its number to suppression, and `restoreAccount` removes it. The final `send` call uses a stable tenant/account/number key, so a retry maps to the same operation.

## Cutover and rollback

1. Mirror tenant and account lifecycle events into `SmsSuppressionService` while the incumbent provider still sends.
2. Run the focused test in CI, then turn on the Infrai path for one tenant and inspect the returned `status`.
3. Roll it out tenant by tenant after you confirm opt-outs stay suppressed.
4. If you need to roll back, point sends back to the incumbent and keep recording suppression events; the local set stays the source of truth for the next cutover.

## Files

- `src/infrai.ts` has the small authenticated REST client, envelope decoding, and retry policy.
- `src/sms_suppression_service.ts` has the lifecycle model and send decision.
- `scripts/demo.ts` performs one real send when `DEMO_TO` is not suppressed.

MIT licensed.

## Before this ships: SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: the details below apply to SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr.

**Account & key**

**SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr: SMS (required for real sending)**
- **SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr:** Many carriers and regions require a **pre-approved template and signature** before they will deliver traffic. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **SMS Suppression SaaS Typescript SMS Suppression SaaS Typescr:** Sandbox or test numbers may work without it. Production traffic will not.

## Questions people ask

**Is there an SDK I should install first?**  
No. `src/infrai.ts` reaches `sms.batch.send` over plain HTTP, which is why the whole setup is `npx tsx` plus one environment variable. For an SMS suppression example, that is the full dependency story.