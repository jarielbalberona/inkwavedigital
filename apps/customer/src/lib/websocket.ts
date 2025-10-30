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
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private venueId: string | null = null;

  connect(venueId: string): void {
    this.venueId = venueId;
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";
    
    console.log(`[WebSocket] Connecting to ${wsUrl} for venue ${venueId}`);
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log("[WebSocket] Connected successfully");
      this.reconnectAttempts = 0; // Reset attempts on successful connection
      
      // Subscribe to venue
      this.ws?.send(JSON.stringify({ type: "subscribe", venueId }));
      console.log(`[WebSocket] Subscribed to venue: ${venueId}`);
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log("[WebSocket] Message received:", message.type);
        this.callbacks.forEach((callback) => callback(message));
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
      }
    };

    this.ws.onerror = (error) => {
      console.error("[WebSocket] Error:", error);
    };

    this.ws.onclose = (event) => {
      console.log(`[WebSocket] Connection closed (code: ${event.code})`);
      
      // Attempt reconnection with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts && this.venueId) {
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Max 30s
        this.reconnectAttempts++;
        
        console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        this.reconnectTimeout = setTimeout(() => {
          if (this.venueId) {
            this.connect(this.venueId);
          }
        }, delay);
      } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("[WebSocket] Max reconnection attempts reached");
      }
    };
  }

  disconnect(): void {
    console.log("[WebSocket] Disconnecting");
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.reconnectAttempts = 0;
    this.ws?.close();
    this.ws = null;
    this.venueId = null;
  }

  subscribe(callback: WebSocketCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();

