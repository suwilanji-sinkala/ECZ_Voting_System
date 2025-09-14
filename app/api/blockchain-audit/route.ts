import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const action = searchParams.get('action') || undefined;
    const tableName = searchParams.get('tableName') || undefined;
    const recordId = searchParams.get('recordId') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
      blockchainTxHash: {
        not: null
      }
    };

    if (action) where.action = action;
    if (tableName) where.tableName = tableName;
    if (recordId) where.recordId = recordId;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    // Get blockchain audit logs
    const [logs, total] = await Promise.all([
      prisma.auditLogs.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLogs.count({ where })
    ]);

    // Format the response
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      tableName: log.tableName,
      recordId: log.recordId,
      userId: log.userId,
      userType: log.userType,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null,
      changes: log.changes ? JSON.parse(log.changes) : null,
      blockchainTxHash: log.blockchainTxHash,
      status: log.status,
      errorMessage: log.errorMessage,
      timestamp: log.timestamp
    }));

    return NextResponse.json({
      success: true,
      data: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching blockchain audit logs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch blockchain audit logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, filters } = await req.json();

    if (action === 'search') {
      const { 
        action: filterAction, 
        tableName, 
        recordId, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 50 
      } = filters || {};
      
      const where: any = {
        blockchainTxHash: {
          not: null
        }
      };

      if (filterAction) where.action = filterAction;
      if (tableName) where.tableName = tableName;
      if (recordId) where.recordId = recordId;
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate);
        if (endDate) where.timestamp.lte = new Date(endDate);
      }

      const skip = (page - 1) * limit;
      
      const [logs, total] = await Promise.all([
        prisma.auditLogs.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          skip,
          take: limit
        }),
        prisma.auditLogs.count({ where })
      ]);

      const formattedLogs = logs.map(log => ({
        id: log.id,
        action: log.action,
        tableName: log.tableName,
        recordId: log.recordId,
        userId: log.userId,
        userType: log.userType,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null,
        changes: log.changes ? JSON.parse(log.changes) : null,
        blockchainTxHash: log.blockchainTxHash,
        status: log.status,
        errorMessage: log.errorMessage,
        timestamp: log.timestamp
      }));

      return NextResponse.json({
        success: true,
        data: formattedLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    if (action === 'statistics') {
      const { startDate, endDate } = filters || {};
      
      const where: any = {
        blockchainTxHash: {
          not: null
        }
      };

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate);
        if (endDate) where.timestamp.lte = new Date(endDate);
      }

      const [
        totalLogs,
        actionStats,
        tableStats,
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
          by: ['tableName'],
          where,
          _count: { tableName: true }
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
            recordId: true,
            blockchainTxHash: true,
            timestamp: true,
            status: true
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        data: {
          totalLogs,
          actionStats: actionStats.map(stat => ({
            action: stat.action,
            count: stat._count.action
          })),
          tableStats: tableStats.map(stat => ({
            tableName: stat.tableName,
            count: stat._count.tableName
          })),
          statusStats: statusStats.map(stat => ({
            status: stat.status,
            count: stat._count.status
          })),
          recentActivity
        }
      });
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid action. Supported actions: search, statistics'
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing blockchain audit request:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process blockchain audit request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
