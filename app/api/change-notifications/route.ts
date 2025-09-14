import { NextRequest, NextResponse } from 'next/server';
import { 
  getRecentChanges, 
  getChangesByUser, 
  getChangesByTable, 
  getCriticalChanges,
  getChangeStatistics 
} from '@/lib/change-notifications';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const type = searchParams.get('type') || 'recent';
    const minutes = parseInt(searchParams.get('minutes') || '60');
    const hours = parseInt(searchParams.get('hours') || '24');
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');
    const tableName = searchParams.get('tableName');
    const stats = searchParams.get('stats') === 'true';

    let data;

    if (stats) {
      data = await getChangeStatistics(hours);
    } else {
      switch (type) {
        case 'recent':
          data = await getRecentChanges(minutes, limit);
          break;
        case 'user':
          if (!userId) {
            return NextResponse.json(
              { error: 'userId parameter is required for user type' },
              { status: 400 }
            );
          }
          data = await getChangesByUser(userId, hours);
          break;
        case 'table':
          if (!tableName) {
            return NextResponse.json(
              { error: 'tableName parameter is required for table type' },
              { status: 400 }
            );
          }
          data = await getChangesByTable(tableName, hours);
          break;
        case 'critical':
          data = await getCriticalChanges(hours);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid type. Supported types: recent, user, table, critical, stats' },
            { status: 400 }
          );
      }
    }

    return NextResponse.json({
      success: true,
      type,
      data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching change notifications:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch change notifications',
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
      // Advanced search for changes
      const { type, minutes, hours, limit, userId, tableName } = filters || {};
      
      let data;
      
      if (type === 'user' && userId) {
        data = await getChangesByUser(userId, hours || 24);
      } else if (type === 'table' && tableName) {
        data = await getChangesByTable(tableName, hours || 24);
      } else if (type === 'critical') {
        data = await getCriticalChanges(hours || 24);
      } else {
        data = await getRecentChanges(minutes || 60, limit || 50);
      }

      return NextResponse.json({
        success: true,
        data,
        filters,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'statistics') {
      const { hours = 24 } = filters || {};
      const stats = await getChangeStatistics(hours);
      
      return NextResponse.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
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
    console.error('Error processing change notification request:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process change notification request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
