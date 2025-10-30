import { IncomingWebhook } from "@slack/webhook";

interface OrderNotificationData {
  orderId: string;
  orderNumber?: string;
  venueId: string;
  venueName: string;
  tableLabel?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    options?: string;
  }>;
  total: number;
  pax?: number;
  notes?: string;
  status: string;
  createdAt: string;
}

interface SalesSummary {
  period: "daily" | "weekly" | "monthly";
  date: string;
  venueId?: string;
  venueName?: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  topItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

class SlackOperationsNotifier {
  private webhooks: {
    newOrders?: IncomingWebhook;
    orderUpdates?: IncomingWebhook;
    highValue?: IncomingWebhook;
    dailySales?: IncomingWebhook;
  } = {};
  private enabled: boolean = false;

  constructor() {
    const operationsEnabled = process.env.SLACK_OPERATIONS_ENABLED === "true";
    
    if (operationsEnabled) {
      // Initialize multiple webhooks for different channels
      if (process.env.SLACK_OPERATIONS_WEBHOOK_NEW_ORDERS) {
        this.webhooks.newOrders = new IncomingWebhook(process.env.SLACK_OPERATIONS_WEBHOOK_NEW_ORDERS);
      }
      
      if (process.env.SLACK_OPERATIONS_WEBHOOK_ORDER_UPDATES) {
        this.webhooks.orderUpdates = new IncomingWebhook(process.env.SLACK_OPERATIONS_WEBHOOK_ORDER_UPDATES);
      }
      
      if (process.env.SLACK_OPERATIONS_WEBHOOK_HIGH_VALUE) {
        this.webhooks.highValue = new IncomingWebhook(process.env.SLACK_OPERATIONS_WEBHOOK_HIGH_VALUE);
      }
      
      if (process.env.SLACK_OPERATIONS_WEBHOOK_DAILY_SALES) {
        this.webhooks.dailySales = new IncomingWebhook(process.env.SLACK_OPERATIONS_WEBHOOK_DAILY_SALES);
      }
      
      this.enabled = true;
    }
  }

  async notifyNewOrder(order: OrderNotificationData): Promise<void> {
    if (!this.enabled || !this.webhooks.newOrders) {
      return;
    }

    const itemsList = order.items
      .map(item => {
        const optionsText = item.options ? ` (${item.options})` : "";
        return `• ${item.quantity}x ${item.name}${optionsText} - $${(item.price / 100).toFixed(2)}`;
      })
      .join("\n");

    const paxText = order.pax ? `\n👥 Party size: ${order.pax}` : "";
    const notesText = order.notes ? `\n📝 Notes: ${order.notes}` : "";
    const tableText = order.tableLabel ? `🪑 ${order.tableLabel}` : "🏠 Takeout";

    try {
      await this.webhooks.newOrders.send({
        text: `🆕 New Order at ${order.venueName}`,
        attachments: [
          {
            color: "#10b981", // Green
            fields: [
              {
                title: "Order Details",
                value: `Order #${order.orderNumber || order.orderId.slice(0, 8)}\n${tableText}${paxText}`,
                short: true,
              },
              {
                title: "Total",
                value: `$${(order.total / 100).toFixed(2)}`,
                short: true,
              },
              {
                title: "Items",
                value: itemsList,
                short: false,
              },
              ...(order.notes ? [{
                title: "Special Instructions",
                value: order.notes,
                short: false,
              }] : []),
            ],
            footer: order.venueName,
            ts: Math.floor(new Date(order.createdAt).getTime() / 1000).toString(),
          },
        ],
      });

      // Also send to high-value channel if applicable
      const highValueThreshold = parseInt(process.env.HIGH_VALUE_ORDER_THRESHOLD || "10000", 10); // Default $100
      if (order.total >= highValueThreshold && this.webhooks.highValue) {
        await this.webhooks.highValue.send({
          text: `💰 High Value Order: $${(order.total / 100).toFixed(2)} at ${order.venueName}`,
          attachments: [
            {
              color: "#f59e0b", // Amber
              fields: [
                {
                  title: "Order #",
                  value: order.orderNumber || order.orderId.slice(0, 8),
                  short: true,
                },
                {
                  title: "Amount",
                  value: `$${(order.total / 100).toFixed(2)}`,
                  short: true,
                },
              ],
            },
          ],
        });
      }
    } catch (error) {
      console.error("[SlackOperationsNotifier] Failed to send new order notification:", error);
    }
  }

  async notifyOrderStatusChange(order: OrderNotificationData): Promise<void> {
    if (!this.enabled || !this.webhooks.orderUpdates) {
      return;
    }

    const statusEmoji = this.getStatusEmoji(order.status);
    const statusColor = this.getStatusColor(order.status);
    const statusText = this.getStatusText(order.status);

    try {
      await this.webhooks.orderUpdates.send({
        text: `${statusEmoji} ${statusText}`,
        attachments: [
          {
            color: statusColor,
            fields: [
              {
                title: "Order",
                value: `#${order.orderNumber || order.orderId.slice(0, 8)}`,
                short: true,
              },
              {
                title: "Location",
                value: order.tableLabel || "Takeout",
                short: true,
              },
              {
                title: "Status",
                value: statusText,
                short: true,
              },
              {
                title: "Total",
                value: `$${(order.total / 100).toFixed(2)}`,
                short: true,
              },
            ],
            footer: order.venueName,
          },
        ],
      });
    } catch (error) {
      console.error("[SlackOperationsNotifier] Failed to send order status update:", error);
    }
  }

  async notifyDailySales(summary: SalesSummary): Promise<void> {
    if (!this.enabled || !this.webhooks.dailySales) {
      return;
    }

    const topItemsList = summary.topItems
      .slice(0, 5)
      .map((item, index) => `${index + 1}. ${item.name} - ${item.quantity} sold ($${(item.revenue / 100).toFixed(2)})`)
      .join("\n");

    try {
      await this.webhooks.dailySales.send({
        text: `📊 Daily Sales Report - ${summary.date}`,
        attachments: [
          {
            color: "#3b82f6", // Blue
            fields: [
              {
                title: "Total Orders",
                value: summary.totalOrders.toString(),
                short: true,
              },
              {
                title: "Total Revenue",
                value: `$${(summary.totalRevenue / 100).toFixed(2)}`,
                short: true,
              },
              {
                title: "Average Order Value",
                value: `$${(summary.averageOrderValue / 100).toFixed(2)}`,
                short: true,
              },
              {
                title: "Top Items",
                value: topItemsList || "No data",
                short: false,
              },
            ],
            footer: summary.venueName || "All Venues",
          },
        ],
      });
    } catch (error) {
      console.error("[SlackOperationsNotifier] Failed to send daily sales summary:", error);
    }
  }

  private getStatusEmoji(status: string): string {
    switch (status.toUpperCase()) {
      case "NEW":
        return "🆕";
      case "PREPARING":
        return "👨‍🍳";
      case "READY":
        return "✅";
      case "COMPLETED":
        return "🎉";
      case "CANCELLED":
        return "❌";
      default:
        return "📋";
    }
  }

  private getStatusColor(status: string): string {
    switch (status.toUpperCase()) {
      case "NEW":
        return "#3b82f6"; // Blue
      case "PREPARING":
        return "#f59e0b"; // Amber
      case "READY":
        return "#10b981"; // Green
      case "COMPLETED":
        return "#6b7280"; // Gray
      case "CANCELLED":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  }

  private getStatusText(status: string): string {
    switch (status.toUpperCase()) {
      case "NEW":
        return "Order Received";
      case "PREPARING":
        return "Preparing Order";
      case "READY":
        return "Order Ready";
      case "COMPLETED":
        return "Order Completed";
      case "CANCELLED":
        return "Order Cancelled";
      default:
        return status;
    }
  }
}

export const slackOperationsNotifier = new SlackOperationsNotifier();

