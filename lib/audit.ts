import { prisma } from './prisma';
import { NextRequest } from 'next/server';

export interface AuditLogData {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VOTE_SUBMIT' | 'BLOCKCHAIN_TX';
  tableName: string;
  recordId?: string;
  userId?: string;
  userType?: 'management' | 'voter' | 'system';
  ipAddress?: string;
  userAgent?: string;
  oldValues?: any;
  newValues?: any;
  changes?: any;
  blockchainTxHash?: string;
  status?: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}

export interface AuditContext {
  request?: NextRequest;
  userId?: string;
  userType?: 'management' | 'voter' | 'system';
}

/**
 * Extract client information from request
 */
export function extractClientInfo(request?: NextRequest) {
  if (!request) return { ipAddress: undefined, userAgent: undefined };
  
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   request.ip || 
                   'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}

/**
 * Extract user context from request
 */
export async function extractUserContext(request?: NextRequest): Promise<AuditContext> {
  const clientInfo = extractClientInfo(request);
  
  // Try to extract user info from headers or session
  const userId = request?.headers.get('x-user-id') || 'system';
  const userType = (request?.headers.get('x-user-type') as 'management' | 'voter' | 'system') || 'system';
  
  return {
    request,
    userId,
    userType,
    ...clientInfo
  };
}

/**
 * Calculate changes between old and new values
 */
export function calculateChanges(oldValues: any, newValues: any): any {
  if (!oldValues || !newValues) return null;
  
  const changes: any = {};
  const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
  
  for (const key of allKeys) {
    const oldValue = oldValues[key];
    const newValue = newValues[key];
    
    if (oldValue !== newValue) {
      changes[key] = {
        from: oldValue,
        to: newValue
      };
    }
  }
  
  return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(data: AuditLogData, context?: AuditContext): Promise<void> {
  try {
    const { ipAddress, userAgent } = extractClientInfo(context?.request);
    
    await prisma.auditLogs.create({
      data: {
        action: data.action,
        tableName: data.tableName,
        recordId: data.recordId,
        userId: data.userId || context?.userId,
        userType: data.userType || context?.userType,
        ipAddress,
        userAgent,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
        newValues: data.newValues ? JSON.stringify(data.newValues) : null,
        changes: data.changes ? JSON.stringify(data.changes) : null,
        blockchainTxHash: data.blockchainTxHash,
        status: data.status || 'success',
        errorMessage: data.errorMessage,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw error to avoid breaking the main operation
  }
}

/**
 * Log a CREATE operation
 */
export async function logCreate(
  tableName: string,
  recordId: string,
  newValues: any,
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action: 'CREATE',
    tableName,
    recordId,
    newValues,
    status: 'success'
  }, context);
}

/**
 * Log an UPDATE operation
 */
export async function logUpdate(
  tableName: string,
  recordId: string,
  oldValues: any,
  newValues: any,
  context?: AuditContext
): Promise<void> {
  const changes = calculateChanges(oldValues, newValues);
  
  await logAuditEvent({
    action: 'UPDATE',
    tableName,
    recordId,
    oldValues,
    newValues,
    changes,
    status: 'success'
  }, context);
}

/**
 * Log a DELETE operation
 */
export async function logDelete(
  tableName: string,
  recordId: string,
  oldValues: any,
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action: 'DELETE',
    tableName,
    recordId,
    oldValues,
    status: 'success'
  }, context);
}

/**
 * Log a LOGIN operation
 */
export async function logLogin(
  userId: string,
  userType: 'management' | 'voter',
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action: 'LOGIN',
    tableName: 'auth',
    recordId: userId,
    userId,
    userType,
    status: 'success'
  }, context);
}

/**
 * Log a LOGOUT operation
 */
export async function logLogout(
  userId: string,
  userType: 'management' | 'voter',
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action: 'LOGOUT',
    tableName: 'auth',
    recordId: userId,
    userId,
    userType,
    status: 'success'
  }, context);
}

/**
 * Log a VOTE_SUBMIT operation
 */
export async function logVoteSubmit(
  voterId: string,
  electionId: string,
  candidateId: string,
  blockchainTxHash?: string,
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action: 'VOTE_SUBMIT',
    tableName: 'votes',
    recordId: `${voterId}-${electionId}`,
    userId: voterId,
    userType: 'voter',
    blockchainTxHash,
    status: 'success'
  }, context);
}

/**
 * Log a BLOCKCHAIN_TX operation
 */
export async function logBlockchainTx(
  action: string,
  tableName: string,
  recordId: string,
  txHash: string,
  status: 'success' | 'failed' | 'pending' = 'pending',
  errorMessage?: string,
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action: 'BLOCKCHAIN_TX',
    tableName,
    recordId,
    blockchainTxHash: txHash,
    status,
    errorMessage
  }, context);
}

/**
 * Log a failed operation
 */
export async function logFailedOperation(
  action: string,
  tableName: string,
  recordId: string,
  errorMessage: string,
  context?: AuditContext
): Promise<void> {
  await logAuditEvent({
    action: action as any,
    tableName,
    recordId,
    status: 'failed',
    errorMessage
  }, context);
}

/**
 * Get audit logs with filtering and pagination
 */
export async function getAuditLogs(
  filters: {
    action?: string;
    tableName?: string;
    userId?: string;
    userType?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  } = {},
  pagination: {
    page?: number;
    limit?: number;
  } = {}
) {
  const { page = 1, limit = 50 } = pagination;
  const skip = (page - 1) * limit;
  
  const where: any = {};
  
  if (filters.action) where.action = filters.action;
  if (filters.tableName) where.tableName = filters.tableName;
  if (filters.userId) where.userId = filters.userId;
  if (filters.userType) where.userType = filters.userType;
  if (filters.status) where.status = filters.status;
  
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = filters.startDate;
    if (filters.endDate) where.timestamp.lte = filters.endDate;
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLogs.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit
    }),
    prisma.auditLogs.count({ where })
  ]);
  
  return {
    logs: logs.map(log => ({
      ...log,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null,
      changes: log.changes ? JSON.parse(log.changes) : null
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get audit statistics
 */
export async function getAuditStats(startDate?: Date, endDate?: Date) {
  const where: any = {};
  
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = startDate;
    if (endDate) where.timestamp.lte = endDate;
  }
  
  const [
    totalLogs,
    actionStats,
    userTypeStats,
    statusStats,
    recentActivity
  ] = await Promise.all([
    prisma.auditLogs.count({ where }),
    prisma.auditLogs.groupBy({
      by: ['action'],
      where,
      _count: { action: true }
    }),
    prisma.auditLogs.groupBy({
      by: ['userType'],
      where,
      _count: { userType: true }
    }),
    prisma.auditLogs.groupBy({
      by: ['status'],
      where,
      _count: { status: true }
    }),
    prisma.auditLogs.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: {
        action: true,
        tableName: true,
        userId: true,
        userType: true,
        timestamp: true,
        status: true
      }
    })
  ]);
  
  return {
    totalLogs,
    actionStats: actionStats.map(stat => ({
      action: stat.action,
      count: stat._count.action
    })),
    userTypeStats: userTypeStats.map(stat => ({
      userType: stat.userType,
      count: stat._count.userType
    })),
    statusStats: statusStats.map(stat => ({
      status: stat.status,
      count: stat._count.status
    })),
    recentActivity
  };
}
