import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, getAuditStats } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Check if this is a stats request
    const stats = searchParams.get('stats');
    if (stats === 'true') {
      const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
      const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
      
      const auditStats = await getAuditStats(startDate, endDate);
      return NextResponse.json(auditStats);
    }
    
    // Parse filters
    const filters = {
      action: searchParams.get('action') || undefined,
      tableName: searchParams.get('tableName') || undefined,
      userId: searchParams.get('userId') || undefined,
      userType: searchParams.get('userType') || undefined,
      startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
      endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
      status: searchParams.get('status') || undefined
    };
    
    // Parse pagination
    const pagination = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100 per page
    };
    
    const result = await getAuditLogs(filters, pagination);
    
    return NextResponse.json({
      success: true,
      data: result.logs,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch audit logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, filters, pagination } = await req.json();
    
    if (action === 'search') {
      // Advanced search with custom filters
      const result = await getAuditLogs(filters || {}, pagination || {});
      
      return NextResponse.json({
        success: true,
        data: result.logs,
        pagination: result.pagination
      });
    }
    
    if (action === 'export') {
      // Export audit logs (simplified version)
      const result = await getAuditLogs(filters || {}, { limit: 10000 }); // Large limit for export
      
      return NextResponse.json({
        success: true,
        data: result.logs,
        exportedAt: new Date().toISOString(),
        totalRecords: result.pagination.total
      });
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid action. Supported actions: search, export'
      },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error processing audit log request:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process audit log request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
