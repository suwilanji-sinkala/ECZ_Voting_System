import { prisma } from './prisma';
import { AuditLogData } from './audit';

export interface ChangeNotification {
  id: number;
  action: string;
  tableName: string;
  recordId: string;
  userId: string;
  userType: string;
  timestamp: Date;
  changes?: any;
  message: string;
}

export interface NotificationSettings {
  enabled: boolean;
  notifyOnCreate: boolean;
  notifyOnUpdate: boolean;
  notifyOnDelete: boolean;
  notifyOnVote: boolean;
  notifyOnBlockchain: boolean;
  webhookUrl?: string;
  emailRecipients?: string[];
}

/**
 * Get recent changes and deletions
 */
export async function getRecentChanges(
  minutes: number = 60,
  limit: number = 50
): Promise<ChangeNotification[]> {
  const since = new Date(Date.now() - minutes * 60 * 1000);
  
  const logs = await prisma.auditLogs.findMany({
    where: {
      timestamp: {
        gte: since
      },
      action: {
        in: ['CREATE', 'UPDATE', 'DELETE', 'VOTE_SUBMIT']
      }
    },
    orderBy: { timestamp: 'desc' },
    take: limit
  });

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    tableName: log.tableName,
    recordId: log.recordId || 'unknown',
    userId: log.userId || 'system',
    userType: log.userType || 'system',
    timestamp: log.timestamp,
    changes: log.changes ? JSON.parse(log.changes) : null,
    message: generateChangeMessage(log)
  }));
}

/**
 * Generate a human-readable message for a change
 */
function generateChangeMessage(log: any): string {
  const user = log.userId || 'System';
  const table = log.tableName;
  const recordId = log.recordId || 'unknown';
  
  switch (log.action) {
    case 'CREATE':
      return `${user} created a new ${table} record (ID: ${recordId})`;
    
    case 'UPDATE':
      const changes = log.changes ? JSON.parse(log.changes) : {};
      const changeCount = Object.keys(changes).length;
      return `${user} updated ${table} record (ID: ${recordId}) - ${changeCount} field(s) changed`;
    
    case 'DELETE':
      return `${user} deleted ${table} record (ID: ${recordId})`;
    
    case 'VOTE_SUBMIT':
      return `${user} submitted a vote in election ${recordId}`;
    
    case 'BLOCKCHAIN_TX':
      return `${user} performed blockchain transaction for ${table} (ID: ${recordId})`;
    
    default:
      return `${user} performed ${log.action} on ${table} (ID: ${recordId})`;
  }
}

/**
 * Get changes by specific user
 */
export async function getChangesByUser(
  userId: string,
  hours: number = 24
): Promise<ChangeNotification[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const logs = await prisma.auditLogs.findMany({
    where: {
      userId: userId,
      timestamp: {
        gte: since
      }
    },
    orderBy: { timestamp: 'desc' }
  });

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    tableName: log.tableName,
    recordId: log.recordId || 'unknown',
    userId: log.userId || 'system',
    userType: log.userType || 'system',
    timestamp: log.timestamp,
    changes: log.changes ? JSON.parse(log.changes) : null,
    message: generateChangeMessage(log)
  }));
}

/**
 * Get changes by table
 */
export async function getChangesByTable(
  tableName: string,
  hours: number = 24
): Promise<ChangeNotification[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const logs = await prisma.auditLogs.findMany({
    where: {
      tableName: tableName,
      timestamp: {
        gte: since
      }
    },
    orderBy: { timestamp: 'desc' }
  });

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    tableName: log.tableName,
    recordId: log.recordId || 'unknown',
    userId: log.userId || 'system',
    userType: log.userType || 'system',
    timestamp: log.timestamp,
    changes: log.changes ? JSON.parse(log.changes) : null,
    message: generateChangeMessage(log)
  }));
}

/**
 * Get critical changes (deletions, failed operations)
 */
export async function getCriticalChanges(
  hours: number = 24
): Promise<ChangeNotification[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const logs = await prisma.auditLogs.findMany({
    where: {
      timestamp: {
        gte: since
      },
      OR: [
        { action: 'DELETE' },
        { status: 'failed' }
      ]
    },
    orderBy: { timestamp: 'desc' }
  });

  return logs.map(log => ({
    id: log.id,
    action: log.action,
    tableName: log.tableName,
    recordId: log.recordId || 'unknown',
    userId: log.userId || 'system',
    userType: log.userType || 'system',
    timestamp: log.timestamp,
    changes: log.changes ? JSON.parse(log.changes) : null,
    message: generateChangeMessage(log)
  }));
}

/**
 * Send change notification (placeholder for webhook/email integration)
 */
export async function sendChangeNotification(
  notification: ChangeNotification,
  settings: NotificationSettings
): Promise<void> {
  if (!settings.enabled) return;

  // Check if this type of change should be notified
  const shouldNotify = 
    (notification.action === 'CREATE' && settings.notifyOnCreate) ||
    (notification.action === 'UPDATE' && settings.notifyOnUpdate) ||
    (notification.action === 'DELETE' && settings.notifyOnDelete) ||
    (notification.action === 'VOTE_SUBMIT' && settings.notifyOnVote) ||
    (notification.action === 'BLOCKCHAIN_TX' && settings.notifyOnBlockchain);

  if (!shouldNotify) return;

  // Send webhook notification
  if (settings.webhookUrl) {
    try {
      await fetch(settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'change_notification',
          data: notification,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  // Send email notification (placeholder)
  if (settings.emailRecipients && settings.emailRecipients.length > 0) {
    console.log(`Email notification would be sent to: ${settings.emailRecipients.join(', ')}`);
    console.log(`Message: ${notification.message}`);
  }

  // Console notification
  console.log(`🔔 CHANGE NOTIFICATION: ${notification.message}`);
}

/**
 * Monitor changes in real-time (polling-based)
 */
export class ChangeMonitor {
  private intervalId: NodeJS.Timeout | null = null;
  private lastCheck: Date = new Date();
  private settings: NotificationSettings;

  constructor(settings: NotificationSettings) {
    this.settings = settings;
  }

  start(intervalMs: number = 30000) { // Check every 30 seconds
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      await this.checkForChanges();
    }, intervalMs);

    console.log('🔍 Change monitor started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('🔍 Change monitor stopped');
  }

  private async checkForChanges() {
    try {
      const changes = await getRecentChanges(1); // Last minute
      const newChanges = changes.filter(change => 
        change.timestamp > this.lastCheck
      );

      for (const change of newChanges) {
        await sendChangeNotification(change, this.settings);
      }

      this.lastCheck = new Date();
    } catch (error) {
      console.error('Error checking for changes:', error);
    }
  }
}

/**
 * Get change statistics
 */
export async function getChangeStatistics(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  const [
    totalChanges,
    changesByAction,
    changesByUser,
    changesByTable,
    criticalChanges
  ] = await Promise.all([
    prisma.auditLogs.count({
      where: {
        timestamp: { gte: since },
        action: { in: ['CREATE', 'UPDATE', 'DELETE', 'VOTE_SUBMIT'] }
      }
    }),
    prisma.auditLogs.groupBy({
      by: ['action'],
      where: {
        timestamp: { gte: since },
        action: { in: ['CREATE', 'UPDATE', 'DELETE', 'VOTE_SUBMIT'] }
      },
      _count: { action: true }
    }),
    prisma.auditLogs.groupBy({
      by: ['userId'],
      where: {
        timestamp: { gte: since },
        action: { in: ['CREATE', 'UPDATE', 'DELETE', 'VOTE_SUBMIT'] }
      },
      _count: { userId: true }
    }),
    prisma.auditLogs.groupBy({
      by: ['tableName'],
      where: {
        timestamp: { gte: since },
        action: { in: ['CREATE', 'UPDATE', 'DELETE', 'VOTE_SUBMIT'] }
      },
      _count: { tableName: true }
    }),
    prisma.auditLogs.count({
      where: {
        timestamp: { gte: since },
        OR: [
          { action: 'DELETE' },
          { status: 'failed' }
        ]
      }
    })
  ]);

  return {
    totalChanges,
    changesByAction: changesByAction.map(stat => ({
      action: stat.action,
      count: stat._count.action
    })),
    changesByUser: changesByUser.map(stat => ({
      userId: stat.userId,
      count: stat._count.userId
    })),
    changesByTable: changesByTable.map(stat => ({
      tableName: stat.tableName,
      count: stat._count.tableName
    })),
    criticalChanges,
    period: `${hours} hours`
  };
}
