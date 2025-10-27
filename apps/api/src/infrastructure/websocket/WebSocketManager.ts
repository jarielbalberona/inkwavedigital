import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { createLogger } from "@inkwave/utils";
import { injectable } from "tsyringe";

interface WebSocketMessage {
  type: "order_created" | "order_status_changed";
  venueId: string;
  data: any;
}

@injectable()
export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private logger = createLogger("websocket");
  private clients: Map<string, Set<WebSocket>> = new Map();

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: "/ws" });
    
    this.wss.on("connection", (ws: WebSocket, req) => {
      this.logger.info("New WebSocket connection");
      
      ws.on("message", (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === "subscribe" && data.venueId) {
            this.subscribeToVenue(ws, data.venueId);
          }
        } catch (error) {
          this.logger.error({ error }, "Failed to parse WebSocket message");
        }
      });

      ws.on("close", () => {
        this.unsubscribeAll(ws);
        this.logger.info("WebSocket connection closed");
      });

      ws.on("error", (error) => {
        this.logger.error({ error }, "WebSocket error");
      });
    });

    this.logger.info("WebSocket server initialized on /ws");
  }

  private subscribeToVenue(ws: WebSocket, venueId: string): void {
    if (!this.clients.has(venueId)) {
      this.clients.set(venueId, new Set());
    }
    this.clients.get(venueId)!.add(ws);
    this.logger.info({ venueId }, "Client subscribed to venue");
  }

  private unsubscribeAll(ws: WebSocket): void {
    for (const [venueId, clients] of this.clients.entries()) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(venueId);
      }
    }
  }

  broadcastOrderCreated(venueId: string, order: any): void {
    this.broadcast(venueId, {
      type: "order_created",
      venueId,
      data: order,
    });
  }

  broadcastOrderStatusChanged(venueId: string, orderId: string, status: string): void {
    this.broadcast(venueId, {
      type: "order_status_changed",
      venueId,
      data: { orderId, status },
    });
  }

  private broadcast(venueId: string, message: WebSocketMessage): void {
    const clients = this.clients.get(venueId);
    if (!clients || clients.size === 0) {
      return;
    }

    const messageStr = JSON.stringify(message);
    let sent = 0;

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
        sent++;
      }
    });

    this.logger.info({ venueId, type: message.type, clients: sent }, "Broadcast message");
  }
}



