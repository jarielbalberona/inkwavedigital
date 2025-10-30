# Monitoring & Operations

## Overview
Comprehensive monitoring system with WebSocket health tracking, Slack notifications, and operational alerts for production systems.

## WebSocket Monitoring

### Purpose
Track WebSocket server health, connection metrics, and detect issues before they impact users.

### Metrics Tracked
- **Active Connections**: Current connected clients
- **Total Messages**: Sent and received counts
- **Connection Events**: Connects and disconnects
- **Errors**: Connection errors and failures
- **Rooms**: Active venue rooms
- **Latency**: Message delivery times
- **Memory**: Server memory usage

### Implementation
**File**: `apps/api/src/infrastructure/websocket/WebSocketMonitor.ts`

```typescript
class WebSocketMonitor {
  private metrics: {
    activeConnections: number;
    totalMessagesSent: number;
    totalMessagesReceived: number;
    connectionErrors: number;
    // ... more metrics
  };
  
  trackConnection(socketId: string): void;
  trackDisconnection(socketId: string): void;
  trackMessage(direction: 'sent' | 'received'): void;
  trackError(error: Error): void;
  getStats(): MetricsSnapshot;
}
```

### Monitoring Endpoints
```
GET /api/v1/monitoring/websocket/stats    # Current statistics
GET /api/v1/monitoring/websocket/health   # Health check status
```

### Health Check Response
```json
{
  "status": "healthy",
  "connections": 45,
  "uptime": 3600,
  "errorRate": 0.001,
  "memoryUsage": {
    "heapUsed": 125000000,
    "heapTotal": 200000000
  }
}
```

## Slack Integration

### Purpose
Real-time operational alerts and notifications sent to Slack channels for immediate team awareness.

### Alert Types

#### WebSocket Alerts
- Connection spike detected
- High error rate
- Server restart
- Memory threshold exceeded

#### Order Alerts
- New order placed
- Order status changed
- Failed order creation
- Payment issues

#### System Alerts
- API errors
- Database connection issues
- Authentication failures
- Rate limit exceeded

### Slack Channels

#### #operations (Main Channel)
- System health updates
- Error notifications
- Deployment notifications
- General operational alerts

#### #orders (Order-Specific)
- New order notifications
- Order status changes
- Customer feedback
- Order analytics

### Message Format

**Order Notification**:
```
🛒 New Order #1234
Venue: Main Branch
Table: Table 5
Items: 3 items
Total: $42.50
Time: 2024-01-01 12:30 PM
```

**Error Alert**:
```
⚠️ WebSocket Error
Type: Connection Failed
Affected Clients: 5
Error: ECONNREFUSED
Time: 2024-01-01 12:30 PM
Action Required: Check server status
```

**Health Update**:
```
✅ System Healthy
Active Connections: 45
Messages/min: 120
Error Rate: 0.01%
Uptime: 24 hours
```

### Setup

#### 1. Create Slack App
1. Go to api.slack.com/apps
2. Create new app
3. Choose "From manifest"
4. Upload `slack-app-manifest.yaml`

#### 2. Install to Workspace
1. Install app to workspace
2. Authorize permissions
3. Copy Bot Token

#### 3. Configure Environment
```bash
# Operations Channel
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_BOT_TOKEN=xoxb-...
SLACK_OPERATIONS_CHANNEL_ID=C...

# Orders Channel
SLACK_ORDERS_CHANNEL_ID=C...
```

#### 4. Test Integration
```bash
# Test webhook
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test notification"}'
```

### Slack Service Implementation
**File**: `apps/api/src/infrastructure/notifications/SlackService.ts`

```typescript
class SlackService {
  async sendMessage(channel: string, message: string): Promise<void>;
  async sendOrderNotification(order: Order): Promise<void>;
  async sendErrorAlert(error: Error, context: object): Promise<void>;
  async sendHealthUpdate(metrics: Metrics): Promise<void>;
}
```

### Alert Thresholds

#### Connection Spike
- Trigger: 50+ new connections in 1 minute
- Action: Alert operations channel
- Info: Connection count, source IPs

#### High Error Rate
- Trigger: Error rate > 5%
- Action: Alert operations channel
- Info: Error types, affected operations

#### Memory Warning
- Trigger: Heap usage > 90%
- Action: Alert operations channel
- Info: Memory stats, request queue

#### WebSocket Latency
- Trigger: Average latency > 1000ms
- Action: Alert operations channel
- Info: Latency histogram, connection count

## Application Performance Monitoring (APM)

### Sentry Integration
**Purpose**: Track errors, performance, and user sessions

#### Setup
```bash
# Environment Variables
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=1.0.0
```

#### Features
- Error tracking and grouping
- Performance monitoring
- User session replay
- Release tracking
- Custom context and tags

#### Implementation
**Files**:
- `apps/api/src/lib/sentry.ts`
- `apps/dashboard/src/lib/sentry.ts`
- `apps/customer/src/lib/sentry.ts`

### Custom Error Tracking
```typescript
import * as Sentry from '@sentry/node';

Sentry.captureException(error, {
  tags: {
    feature: 'orders',
    venue_id: venueId,
  },
  extra: {
    order_data: orderData,
  },
});
```

## Performance Middleware

### Request Timing
**File**: `apps/api/src/interfaces/middlewares/performance.middleware.ts`

Tracks:
- Request duration
- Response size
- Slow query detection
- Memory usage per request

### Slow Query Alerts
- Threshold: > 1000ms
- Action: Log and alert
- Info: Query, duration, parameters

## Logging Strategy

### Log Levels
- **ERROR**: System errors, exceptions
- **WARN**: Warnings, deprecated usage
- **INFO**: Important events, orders, auth
- **DEBUG**: Detailed debugging info

### Structured Logging
```typescript
import { createLogger } from '@inkwave/utils';

const logger = createLogger('order-service');

logger.info({
  event: 'order_created',
  orderId: order.id,
  venueId: order.venueId,
  total: order.totalAmount,
}, 'New order placed');
```

### Log Aggregation
- **Development**: Console logs
- **Production**: Log aggregation service (planned)
- **Options**: CloudWatch, Datadog, LogRocket

## Health Checks

### Endpoints
```
GET /health                              # Basic health check
GET /api/v1/monitoring/websocket/health  # WebSocket health
GET /api/v1/monitoring/database/health   # Database health
```

### Health Check Response
```json
{
  "status": "healthy",
  "checks": {
    "database": "healthy",
    "websocket": "healthy",
    "redis": "healthy"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Monitoring Dashboard (Planned)

### Metrics to Display
- Active users/connections
- Orders per hour
- Revenue per hour
- Average order value
- Response times
- Error rates
- WebSocket health
- Database performance

### Visualization
- Real-time graphs
- Historical trends
- Alert history
- System status

## Operational Procedures

### Daily Monitoring
1. Check Slack for overnight alerts
2. Review error rates in Sentry
3. Check WebSocket health metrics
4. Review order volumes
5. Check for anomalies

### Incident Response
1. Receive Slack alert
2. Check monitoring dashboard
3. Review logs and errors
4. Identify root cause
5. Implement fix
6. Monitor recovery
7. Post-mortem analysis

### Regular Maintenance
- Weekly: Review error trends
- Monthly: Analyze performance metrics
- Quarterly: Capacity planning
- As needed: Optimize slow queries

## Alert Configuration

### Critical Alerts
- Database connection lost
- API server down
- Authentication service failure
- Payment processing errors

### Warning Alerts
- High error rate (> 1%)
- Slow responses (> 2s average)
- Memory usage high (> 80%)
- WebSocket disconnections spike

### Info Notifications
- Daily summary
- Weekly reports
- Deployment notifications
- New tenant signups

## Best Practices

### Alert Fatigue Prevention
- Set appropriate thresholds
- Group similar alerts
- Use alert escalation
- Regular threshold review

### On-Call Rotation
- Clear escalation path
- Runbook documentation
- Access to all systems
- Contact information

### Documentation
- Keep runbooks updated
- Document common issues
- Track incident patterns
- Share learnings

## Troubleshooting

### Slack Notifications Not Sending
- Check `SLACK_WEBHOOK_URL` is set
- Verify bot token is valid
- Test webhook manually
- Check channel permissions

### WebSocket Metrics Not Updating
- Verify monitoring is initialized
- Check metrics collection code
- Review endpoint responses
- Check monitoring service status

### High Memory Usage
- Review active connections
- Check for memory leaks
- Analyze request patterns
- Consider scaling

### Performance Degradation
- Check database query times
- Review API response times
- Analyze WebSocket latency
- Check server resources

## Future Enhancements

### Planned Features
- **Custom Dashboards**: Grafana integration
- **Advanced Alerts**: ML-based anomaly detection
- **Automated Responses**: Auto-scaling, self-healing
- **User Analytics**: Customer behavior tracking
- **Business Intelligence**: Revenue forecasting
- **Mobile Monitoring**: Push notifications for alerts
- **Status Page**: Public system status

