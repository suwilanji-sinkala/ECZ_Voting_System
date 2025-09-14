# Change Notification System Guide

## Overview

The Change Notification System provides real-time alerts and monitoring for all changes, deletions, and operations in your election system. It builds on top of the audit logging system to provide user-friendly notifications and dashboards.

## Features

- **Real-time Change Detection** - Monitors changes as they happen
- **Multiple Notification Types** - CREATE, UPDATE, DELETE, VOTE_SUBMIT, BLOCKCHAIN_TX
- **User-friendly Messages** - Human-readable change descriptions
- **Filtering & Search** - Filter by user, table, time period, action type
- **Statistics Dashboard** - Visual analytics of change patterns
- **Critical Change Alerts** - Special notifications for deletions and failures
- **Auto-refresh Dashboard** - Real-time updates every 30 seconds
- **Webhook Integration** - Send notifications to external systems

## Quick Start

### 1. Set Up the System

```bash
# Run database migration (if not already done)
npx prisma db push

# Test the system
node test-change-notifications.js
```

### 2. View Change Notifications

Visit: `http://localhost:3000/change-notifications`

### 3. Use the API

```javascript
// Get recent changes
const response = await fetch('/api/change-notifications?type=recent&minutes=60');
const data = await response.json();

// Get changes by user
const response = await fetch('/api/change-notifications?type=user&userId=admin-001');
const data = await response.json();

// Get critical changes
const response = await fetch('/api/change-notifications?type=critical');
const data = await response.json();

// Get statistics
const response = await fetch('/api/change-notifications?stats=true&hours=24');
const data = await response.json();
```

## API Endpoints

### Get Change Notifications

```http
GET /api/change-notifications
```

**Query Parameters:**
- `type`: Type of changes to fetch
  - `recent` - Recent changes (default)
  - `user` - Changes by specific user
  - `table` - Changes to specific table
  - `critical` - Critical changes (deletions, failures)
  - `stats` - Change statistics
- `minutes`: Minutes to look back for recent changes (default: 60)
- `hours`: Hours to look back for other types (default: 24)
- `limit`: Maximum number of records (default: 50)
- `userId`: User ID for user-specific changes
- `tableName`: Table name for table-specific changes

### Examples

```http
# Get recent changes from last 30 minutes
GET /api/change-notifications?type=recent&minutes=30

# Get all changes by user "admin-001" in last 12 hours
GET /api/change-notifications?type=user&userId=admin-001&hours=12

# Get all changes to "elections" table in last 6 hours
GET /api/change-notifications?type=table&tableName=elections&hours=6

# Get critical changes from last 24 hours
GET /api/change-notifications?type=critical&hours=24

# Get change statistics for last 7 days
GET /api/change-notifications?stats=true&hours=168
```

## Response Format

### Change Notifications Response

```json
{
  "success": true,
  "type": "recent",
  "data": [
    {
      "id": 1,
      "action": "CREATE",
      "tableName": "elections",
      "recordId": "123",
      "userId": "admin-001",
      "userType": "management",
      "timestamp": "2024-01-15T10:30:00Z",
      "changes": null,
      "message": "admin-001 created a new elections record (ID: 123)"
    },
    {
      "id": 2,
      "action": "UPDATE",
      "tableName": "elections",
      "recordId": "123",
      "userId": "admin-001",
      "userType": "management",
      "timestamp": "2024-01-15T10:35:00Z",
      "changes": {
        "status": { "from": "draft", "to": "active" }
      },
      "message": "admin-001 updated elections record (ID: 123) - 1 field(s) changed"
    }
  ],
  "timestamp": "2024-01-15T10:40:00Z"
}
```

### Statistics Response

```json
{
  "success": true,
  "type": "stats",
  "data": {
    "totalChanges": 150,
    "changesByAction": [
      { "action": "CREATE", "count": 45 },
      { "action": "UPDATE", "count": 30 },
      { "action": "DELETE", "count": 5 },
      { "action": "VOTE_SUBMIT", "count": 70 }
    ],
    "changesByUser": [
      { "userId": "admin-001", "count": 80 },
      { "userId": "voter-001", "count": 70 }
    ],
    "changesByTable": [
      { "tableName": "elections", "count": 50 },
      { "tableName": "votes", "count": 70 },
      { "tableName": "candidates", "count": 30 }
    ],
    "criticalChanges": 5,
    "period": "24 hours"
  },
  "timestamp": "2024-01-15T10:40:00Z"
}
```

## Dashboard Features

### Real-time Dashboard

The dashboard at `/change-notifications` provides:

- **Live Statistics Cards** - Total changes, critical changes, most active table/user
- **Recent Changes List** - Real-time list of recent changes with details
- **Action Type Breakdown** - Visual breakdown of changes by action type
- **Auto-refresh** - Automatically updates every 30 seconds
- **Manual Refresh** - Button to manually refresh data
- **Change Details** - Shows what fields changed in updates

### Change Message Examples

- `admin-001 created a new elections record (ID: 123)`
- `voter-001 submitted a vote in election 456`
- `admin-001 updated elections record (ID: 123) - 2 field(s) changed`
- `admin-001 deleted candidates record (ID: 789)`
- `admin-001 performed blockchain transaction for elections (ID: 123)`

## Integration Examples

### 1. Basic Integration

```typescript
import { getRecentChanges, getCriticalChanges } from '@/lib/change-notifications';

// Get recent changes
const recentChanges = await getRecentChanges(60, 20);
console.log(`Found ${recentChanges.length} recent changes`);

// Get critical changes
const criticalChanges = await getCriticalChanges(24);
console.log(`Found ${criticalChanges.length} critical changes`);
```

### 2. Real-time Monitoring

```typescript
import { ChangeMonitor } from '@/lib/change-notifications';

const monitor = new ChangeMonitor({
  enabled: true,
  notifyOnCreate: true,
  notifyOnUpdate: true,
  notifyOnDelete: true,
  notifyOnVote: true,
  notifyOnBlockchain: true,
  webhookUrl: 'https://your-webhook-url.com/notifications',
  emailRecipients: ['admin@example.com']
});

// Start monitoring (checks every 30 seconds)
monitor.start();

// Stop monitoring
monitor.stop();
```

### 3. Custom Notifications

```typescript
import { sendChangeNotification } from '@/lib/change-notifications';

const notification = {
  id: 1,
  action: 'DELETE',
  tableName: 'elections',
  recordId: '123',
  userId: 'admin-001',
  userType: 'management',
  timestamp: new Date(),
  message: 'admin-001 deleted elections record (ID: 123)'
};

await sendChangeNotification(notification, {
  enabled: true,
  notifyOnDelete: true,
  webhookUrl: 'https://your-webhook-url.com/notifications'
});
```

## Configuration

### Notification Settings

```typescript
interface NotificationSettings {
  enabled: boolean;                    // Enable/disable notifications
  notifyOnCreate: boolean;            // Notify on CREATE operations
  notifyOnUpdate: boolean;            // Notify on UPDATE operations
  notifyOnDelete: boolean;            // Notify on DELETE operations
  notifyOnVote: boolean;              // Notify on VOTE_SUBMIT operations
  notifyOnBlockchain: boolean;        // Notify on BLOCKCHAIN_TX operations
  webhookUrl?: string;                // Webhook URL for external notifications
  emailRecipients?: string[];         // Email addresses for notifications
}
```

### Change Monitor Settings

```typescript
const monitor = new ChangeMonitor({
  enabled: true,                      // Enable monitoring
  notifyOnCreate: true,              // Monitor CREATE operations
  notifyOnUpdate: true,              // Monitor UPDATE operations
  notifyOnDelete: true,              // Monitor DELETE operations
  notifyOnVote: true,                // Monitor VOTE_SUBMIT operations
  notifyOnBlockchain: true,          // Monitor BLOCKCHAIN_TX operations
  webhookUrl: 'https://hooks.slack.com/...',  // Slack webhook
  emailRecipients: ['admin@example.com']      // Email notifications
});

// Start with custom interval (check every 10 seconds)
monitor.start(10000);
```

## Webhook Integration

### Slack Webhook Example

```javascript
const webhookUrl = 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK';

const monitor = new ChangeMonitor({
  enabled: true,
  notifyOnDelete: true,
  webhookUrl: webhookUrl
});

// The system will send POST requests to your webhook with:
// {
//   "type": "change_notification",
//   "data": { ... change notification data ... },
//   "timestamp": "2024-01-15T10:30:00Z"
// }
```

### Discord Webhook Example

```javascript
const webhookUrl = 'https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK';

const monitor = new ChangeMonitor({
  enabled: true,
  notifyOnCritical: true,
  webhookUrl: webhookUrl
});
```

## Security Considerations

1. **Access Control** - Ensure only authorized users can view change notifications
2. **Sensitive Data** - Change messages are filtered to exclude sensitive information
3. **Rate Limiting** - Consider rate limiting for webhook notifications
4. **Log Retention** - Implement log rotation for audit logs to maintain performance

## Troubleshooting

### Common Issues

1. **No changes showing** - Check if audit logging is enabled in your API endpoints
2. **Webhook not working** - Verify webhook URL and check server logs
3. **Performance issues** - Consider pagination and indexing for large datasets
4. **Missing notifications** - Ensure the change monitor is started

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG_CHANGE_NOTIFICATIONS=true
```

## Best Practices

1. **Monitor Critical Changes** - Always monitor DELETE operations and failed operations
2. **Set Up Alerts** - Configure webhook notifications for critical changes
3. **Regular Cleanup** - Archive old audit logs to maintain performance
4. **User Training** - Train users on how to interpret change notifications
5. **Documentation** - Document your notification policies and procedures

## File Structure

```
lib/
├── change-notifications.ts          # Core change notification functions
├── audit.ts                         # Audit logging functions
└── audit-middleware.ts              # Audit middleware

app/
├── api/
│   └── change-notifications/
│       └── route.ts                 # Change notification API endpoint
├── components/
│   └── ChangeNotificationDashboard.tsx  # Dashboard component
└── change-notifications/
    └── page.tsx                     # Dashboard page

test-change-notifications.js         # Test script
CHANGE_NOTIFICATIONS_GUIDE.md        # This guide
```

## Next Steps

1. **Integrate with Your APIs** - Add change notifications to your existing API endpoints
2. **Set Up Monitoring** - Start the change monitor for real-time notifications
3. **Configure Webhooks** - Set up webhook notifications for your team
4. **Customize Dashboard** - Modify the dashboard to match your needs
5. **Set Up Alerts** - Configure alerts for critical changes
6. **Train Users** - Train your team on using the change notification system

Your change notification system is now ready to provide real-time visibility into all changes in your election system! 🎉
