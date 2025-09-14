# Election System Audit Logging Guide

## Overview

The audit logging system provides comprehensive tracking of all changes, deletions, and operations in the election system. It logs both database operations and blockchain transactions, providing a complete audit trail for security and compliance purposes.

## Features

- **Complete Operation Tracking**: Logs CREATE, UPDATE, DELETE operations
- **User Context**: Tracks who performed each action (management users, voters, system)
- **Blockchain Integration**: Logs blockchain transactions with transaction hashes
- **Security Information**: Captures IP addresses, user agents, and timestamps
- **Change Tracking**: For updates, tracks what changed from old to new values
- **Error Logging**: Logs failed operations with error messages
- **Filtering & Search**: Advanced filtering and search capabilities
- **Statistics**: Provides audit statistics and analytics

## Database Schema

The audit system uses the `AuditLogs` table with the following structure:

```sql
model AuditLogs {
  id            Int      @id @default(autoincrement())
  action        String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, VOTE_SUBMIT, BLOCKCHAIN_TX
  tableName     String   // Name of the database table affected
  recordId      String?  // ID of the affected record
  userId        String?  // ID of the user performing the action
  userType      String?  // 'management', 'voter', 'system'
  ipAddress     String?  // IP address of the user
  userAgent     String?  // User agent string
  oldValues     String?  // JSON string of old values (for updates/deletes)
  newValues     String?  // JSON string of new values (for creates/updates)
  changes       String?  // JSON string of specific changes made
  blockchainTxHash String? // Transaction hash if blockchain operation
  status        String   @default("success") // success, failed, pending
  errorMessage  String?  // Error message if operation failed
  timestamp     DateTime @default(now())
  createdAt     DateTime @default(now())
}
```

## Usage Examples

### 1. Basic Audit Logging

```typescript
import { logCreate, logUpdate, logDelete, extractUserContext } from '@/lib/audit';

// Log a CREATE operation
await logCreate(
  'elections',
  '123',
  { title: 'Presidential Election', year: 2024 },
  { request, userId: 'admin-001', userType: 'management' }
);

// Log an UPDATE operation
await logUpdate(
  'elections',
  '123',
  { title: 'Presidential Election', year: 2024 },
  { title: 'Presidential Election 2024', year: 2024 },
  { request, userId: 'admin-001', userType: 'management' }
);

// Log a DELETE operation
await logDelete(
  'elections',
  '123',
  { title: 'Presidential Election', year: 2024 },
  { request, userId: 'admin-001', userType: 'management' }
);
```

### 2. Blockchain Transaction Logging

```typescript
import { logBlockchainTx, logVoteSubmit } from '@/lib/audit';

// Log a blockchain transaction
await logBlockchainTx(
  'CREATE_ELECTION',
  'elections',
  '123',
  '0x1234567890abcdef...',
  'success',
  undefined,
  { request, userId: 'admin-001', userType: 'management' }
);

// Log a vote submission
await logVoteSubmit(
  'voter-001',
  'election-123',
  'candidate-456',
  '0x1234567890abcdef...',
  { request, userId: 'voter-001', userType: 'voter' }
);
```

### 3. Using Audit Middleware

```typescript
import { createAuditMiddleware, extractUserContext } from '@/lib/audit-middleware';

const auditMiddleware = createAuditMiddleware({
  tableName: 'elections',
  getRecordId: (data) => data.Election_ID?.toString(),
  getUserContext: extractUserContext,
  excludeFields: ['password', 'secret']
});

// Wrap your handlers
export const POST = auditMiddleware.wrapCreate(async (req) => {
  // Your existing POST logic
});

export const PUT = auditMiddleware.wrapUpdate(async (req) => {
  // Your existing PUT logic
});

export const DELETE = auditMiddleware.wrapDelete(async (req) => {
  // Your existing DELETE logic
});
```

### 4. Manual Integration in API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { logCreate, logUpdate, logDelete, extractUserContext } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const userContext = await extractUserContext(req);
    
    // Perform your operation
    const result = await prisma.elections.create({ data });
    
    // Log the operation
    await logCreate(
      'elections',
      result.Election_ID.toString(),
      data,
      { request: req, ...userContext }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    // Log failed operation
    await logFailedOperation(
      'CREATE',
      'elections',
      'unknown',
      error.message,
      { request: req, ...userContext }
    );
    
    throw error;
  }
}
```

## API Endpoints

### Get Audit Logs

```http
GET /api/audit-logs?action=CREATE&tableName=elections&page=1&limit=50
```

**Query Parameters:**
- `action`: Filter by action type (CREATE, UPDATE, DELETE, etc.)
- `tableName`: Filter by table name
- `userId`: Filter by user ID
- `userType`: Filter by user type (management, voter, system)
- `startDate`: Filter by start date (ISO format)
- `endDate`: Filter by end date (ISO format)
- `status`: Filter by status (success, failed, pending)
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 50, max: 100)

### Get Audit Statistics

```http
GET /api/audit-logs?stats=true&startDate=2024-01-01&endDate=2024-12-31
```

### Advanced Search

```http
POST /api/audit-logs
Content-Type: application/json

{
  "action": "search",
  "filters": {
    "action": "CREATE",
    "tableName": "elections",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  },
  "pagination": {
    "page": 1,
    "limit": 100
  }
}
```

### Export Audit Logs

```http
POST /api/audit-logs
Content-Type: application/json

{
  "action": "export",
  "filters": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T23:59:59Z"
  }
}
```

## Response Format

### Audit Logs Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "action": "CREATE",
      "tableName": "elections",
      "recordId": "123",
      "userId": "admin-001",
      "userType": "management",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "oldValues": null,
      "newValues": {
        "title": "Presidential Election",
        "year": 2024
      },
      "changes": null,
      "blockchainTxHash": "0x1234567890abcdef...",
      "status": "success",
      "errorMessage": null,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### Audit Statistics Response

```json
{
  "totalLogs": 150,
  "actionStats": [
    { "action": "CREATE", "count": 45 },
    { "action": "UPDATE", "count": 30 },
    { "action": "DELETE", "count": 5 },
    { "action": "VOTE_SUBMIT", "count": 70 }
  ],
  "userTypeStats": [
    { "userType": "management", "count": 80 },
    { "userType": "voter", "count": 70 }
  ],
  "statusStats": [
    { "status": "success", "count": 145 },
    { "status": "failed", "count": 5 }
  ],
  "recentActivity": [
    {
      "action": "VOTE_SUBMIT",
      "tableName": "votes",
      "userId": "voter-001",
      "userType": "voter",
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "success"
    }
  ]
}
```

## Security Considerations

1. **Sensitive Data**: The audit system automatically excludes sensitive fields like passwords, tokens, and secrets
2. **IP Address Tracking**: IP addresses are captured for security monitoring
3. **User Agent Logging**: User agents are logged for device/browser tracking
4. **Blockchain Verification**: Blockchain transaction hashes provide immutable verification
5. **Error Logging**: Failed operations are logged with error messages for debugging

## Best Practices

1. **Always Log Operations**: Log all CREATE, UPDATE, DELETE operations
2. **Include User Context**: Always provide user context for proper attribution
3. **Handle Failures Gracefully**: Don't let audit logging failures break main operations
4. **Filter Sensitive Data**: Use excludeFields to prevent logging sensitive information
5. **Regular Cleanup**: Consider archiving old audit logs to maintain performance
6. **Monitor Audit Logs**: Regularly review audit logs for suspicious activity

## Integration Checklist

- [ ] Add AuditLogs model to Prisma schema
- [ ] Run database migration
- [ ] Import audit functions in API routes
- [ ] Add audit logging to CREATE operations
- [ ] Add audit logging to UPDATE operations
- [ ] Add audit logging to DELETE operations
- [ ] Add blockchain transaction logging
- [ ] Add user context extraction
- [ ] Test audit logging functionality
- [ ] Verify audit log viewing API
- [ ] Set up audit log monitoring

## Example Integration

See the following files for complete examples:
- `app/api/elections/route-with-audit.ts` - Elections API with audit logging
- `app/api/vote/route-with-audit.ts` - Voting API with audit logging
- `lib/audit.ts` - Core audit logging functions
- `lib/audit-middleware.ts` - Audit middleware for automatic logging
- `app/api/audit-logs/route.ts` - Audit log viewing API

## Troubleshooting

### Common Issues

1. **Audit logging fails silently**: Check console for error messages
2. **Missing user context**: Ensure extractUserContext is properly implemented
3. **Performance issues**: Consider pagination and indexing
4. **Large audit logs**: Implement log rotation and archiving

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG_AUDIT=true
```

This will provide detailed console output for audit operations.
