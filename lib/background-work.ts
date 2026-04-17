import { after } from "next/server";

/**
 * Run work after the response is sent (Next.js 15+). Use for email/webhooks so
 * server actions stay fast. Errors are logged and never thrown to the client.
 */
export function runAfterResponse(task: () => Promise<void>): void {
  after(async () => {
    try {
      await task();
    } catch (e) {
      console.error("[background-work] task failed:", e);
    }
  });
}
