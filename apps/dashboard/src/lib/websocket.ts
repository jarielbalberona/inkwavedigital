type WebSocketMessage = {
  type: "order_created" | "order_status_changed";
  venueId: string;
  data: any;
};

type WebSocketCallback = (message: WebSocketMessage) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private callbacks: Set<WebSocketCallback> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private venueId: string | null = null;

  connect(venueId: string): void {
    this.venueId = venueId;
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("WebSocket connected");
      // Subscribe to venue
      this.ws?.send(JSON.stringify({ type: "subscribe", venueId }));
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.callbacks.forEach((callback) => callback(message));
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected, reconnecting...");
      this.reconnectTimeout = setTimeout(() => {
        if (this.venueId) {
          this.connect(this.venueId);
        }
      }, 3000);
    };
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
    this.ws = null;
    this.venueId = null;
  }

  subscribe(callback: WebSocketCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
}

export const wsClient = new WebSocketClient();



