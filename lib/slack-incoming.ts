/**
 * Optional Slack Incoming Webhook for leave decisions.
 * Set SLACK_LEAVE_WEBHOOK_URL (preferred) or SLACK_WEBHOOK_URL.
 */
export function getLeaveSlackWebhookUrl(): string | undefined {
  const direct = process.env.SLACK_LEAVE_WEBHOOK_URL?.trim();
  if (direct) return direct;
  return process.env.SLACK_WEBHOOK_URL?.trim() || undefined;
}

export async function postSlackLeaveDecision(payload: {
  headline: string;
  lines: string[];
}): Promise<void> {
  const url = getLeaveSlackWebhookUrl();
  if (!url) return;

  const body = payload.lines.map((l) => `• ${l}`).join("\n");
  const mrkdwn = `*${payload.headline}*\n${body}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${payload.headline}\n${payload.lines.join(" | ")}`,
        blocks: [
          {
            type: "section",
            text: { type: "mrkdwn", text: mrkdwn },
          },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[slack] webhook failed:", res.status, t);
    }
  } catch (e) {
    console.error("[slack] webhook error:", e);
  }
}
