import { IncomingWebhook } from "@slack/webhook";

interface SlackNotificationOptions {
  title: string;
  message: string;
  level: "info" | "warning" | "error" | "critical";
  context?: Record<string, any>;
  url?: string;
}

class SlackNotifier {
  private webhook: IncomingWebhook | null = null;
  private enabled: boolean = false;
  private errorThrottle: Map<string, number> = new Map();
  private throttleWindowMs = 5 * 60 * 1000; // 5 minutes

  constructor() {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    const alertsEnabled = process.env.SLACK_ALERTS_ENABLED === "true";
    
    if (webhookUrl && alertsEnabled) {
      this.webhook = new IncomingWebhook(webhookUrl);
      this.enabled = true;
    }
  }

  async notify(options: SlackNotificationOptions): Promise<void> {
    if (!this.enabled || !this.webhook) {
      return;
    }

    // Throttle error notifications
    if (options.level === "error" || options.level === "critical") {
      const throttleKey = `${options.title}:${options.message}`;
      const lastSent = this.errorThrottle.get(throttleKey);
      const now = Date.now();

      if (lastSent && now - lastSent < this.throttleWindowMs) {
        console.log(`[SlackNotifier] Throttling notification: ${throttleKey}`);
        return;
      }

      this.errorThrottle.set(throttleKey, now);
    }

    const color = this.getColor(options.level);
    const emoji = this.getEmoji(options.level);

    try {
      await this.webhook.send({
        text: `${emoji} ${options.title}`,
        attachments: [
          {
            color,
            fields: [
              {
                title: "Message",
                value: options.message,
                short: false,
              },
              {
                title: "Level",
                value: options.level.toUpperCase(),
                short: true,
              },
              {
                title: "Environment",
                value: process.env.NODE_ENV || "development",
                short: true,
              },
              {
                title: "Timestamp",
                value: new Date().toISOString(),
                short: true,
              },
              ...(options.url ? [{
                title: "Sentry URL",
                value: options.url,
                short: false,
              }] : []),
              ...(options.context ? [{
                title: "Context",
                value: `\`\`\`${JSON.stringify(options.context, null, 2)}\`\`\``,
                short: false,
              }] : []),
            ],
          },
        ],
      });
    } catch (error) {
      console.error("[SlackNotifier] Failed to send notification:", error);
    }
  }

  async notifyError(error: Error, context?: Record<string, any>, sentryUrl?: string): Promise<void> {
    await this.notify({
      title: "API Error",
      message: error.message,
      level: "error",
      context: {
        ...context,
        stack: error.stack,
      },
      url: sentryUrl,
    });
  }

  async notifyCritical(message: string, context?: Record<string, any>): Promise<void> {
    await this.notify({
      title: "Critical Alert",
      message,
      level: "critical",
      context,
    });
  }

  private getColor(level: string): string {
    switch (level) {
      case "info":
        return "#36a64f"; // Green
      case "warning":
        return "#ff9800"; // Orange
      case "error":
        return "#f44336"; // Red
      case "critical":
        return "#9c27b0"; // Purple
      default:
        return "#607d8b"; // Gray
    }
  }

  private getEmoji(level: string): string {
    switch (level) {
      case "info":
        return "ℹ️";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "critical":
        return "🚨";
      default:
        return "📝";
    }
  }
}

export const slackNotifier = new SlackNotifier();

