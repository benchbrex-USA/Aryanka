/**
 * Slack webhook notifications.
 * Set SLACK_WEBHOOK_URL in env to enable.
 * Silently fails if not configured — Slack is non-critical.
 */
export async function sendSlackNotification(
  text: string,
  blocks?: object[]
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blocks ? { text, blocks } : { text }),
    });
  } catch {
    // silently fail — Slack is non-critical
  }
}

export function slackLeadMessage(email: string, name?: string, company?: string, source?: string, score?: number) {
  const nameStr  = name    ? `*${name}*`    : 'Anonymous';
  const compStr  = company ? ` @ ${company}` : '';
  const scoreStr = score   ? ` · Score: ${score}` : '';
  return `🎯 New lead: ${nameStr}${compStr} (${email}) · Source: \`${source || 'website'}\`${scoreStr}`;
}

export function slackDemoMessage(name: string, company: string, email: string) {
  return `📅 Demo booked: *${name}* from *${company}* (${email})`;
}
