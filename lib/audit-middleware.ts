import { NextRequest, NextResponse } from 'next/server';
import { logCreate, logUpdate, logDelete, logFailedOperation, AuditContext } from './audit';

export interface AuditMiddlewareOptions {
  tableName: string;
  getRecordId?: (data: any) => string;
  getUserContext?: (request: NextRequest) => Promise<{ userId?: string; userType?: 'management' | 'voter' | 'system' }>;
  excludeFields?: string[]; // Fields to exclude from logging
  includeFields?: string[]; // Only include these fields (if specified)
}

/**
 * Create audit middleware for API routes
 */
export function createAuditMiddleware(options: AuditMiddlewareOptions) {
  return {
    /**
     * Wrap a POST handler to log CREATE operations
     */
    wrapCreate: (handler: (req: NextRequest) => Promise<NextResponse>) => {
      return async (req: NextRequest): Promise<NextResponse> => {
        try {
          const response = await handler(req);
          
          // Only log successful creates (2xx status codes)
          if (response.status >= 200 && response.status < 300) {
            try {
              const responseData = await response.clone().json();
              const recordId = options.getRecordId ? options.getRecordId(responseData) : responseData.id || responseData.Election_ID || responseData.Candidate_ID || 'unknown';
              
              const userContext = options.getUserContext ? await options.getUserContext(req) : {};
              const context: AuditContext = {
                request: req,
                ...userContext
              };
              
              // Filter sensitive data
              const filteredData = filterSensitiveData(responseData, options.excludeFields, options.includeFields);
              
              await logCreate(options.tableName, recordId, filteredData, context);
            } catch (auditError) {
              console.error('Audit logging failed for CREATE:', auditError);
            }
          }
          
          return response;
        } catch (error) {
          // Log failed operation
          try {
            const userContext = options.getUserContext ? await options.getUserContext(req) : {};
            const context: AuditContext = {
              request: req,
              ...userContext
            };
            
            await logFailedOperation(
              'CREATE',
              options.tableName,
              'unknown',
              error instanceof Error ? error.message : 'Unknown error',
              context
            );
          } catch (auditError) {
            console.error('Failed to log audit for failed CREATE:', auditError);
          }
          
          throw error;
        }
      };
    },

    /**
     * Wrap a PUT handler to log UPDATE operations
     */
    wrapUpdate: (handler: (req: NextRequest) => Promise<NextResponse>) => {
      return async (req: NextRequest): Promise<NextResponse> => {
        try {
          const response = await handler(req);
          
          // Only log successful updates (2xx status codes)
          if (response.status >= 200 && response.status < 300) {
            try {
              const responseData = await response.clone().json();
              const recordId = options.getRecordId ? options.getRecordId(responseData) : responseData.id || responseData.Election_ID || responseData.Candidate_ID || 'unknown';
              
              const userContext = options.getUserContext ? await options.getUserContext(req) : {};
              const context: AuditContext = {
                request: req,
                ...userContext
              };
              
              // For updates, we'd need to get the old values from the database
              // This is a simplified version - in practice, you'd want to fetch the old values
              const filteredData = filterSensitiveData(responseData, options.excludeFields, options.includeFields);
              
              await logUpdate(options.tableName, recordId, {}, filteredData, context);
            } catch (auditError) {
              console.error('Audit logging failed for UPDATE:', auditError);
            }
          }
          
          return response;
        } catch (error) {
          // Log failed operation
          try {
            const userContext = options.getUserContext ? await options.getUserContext(req) : {};
            const context: AuditContext = {
              request: req,
              ...userContext
            };
            
            await logFailedOperation(
              'UPDATE',
              options.tableName,
              'unknown',
              error instanceof Error ? error.message : 'Unknown error',
              context
            );
          } catch (auditError) {
            console.error('Failed to log audit for failed UPDATE:', auditError);
          }
          
          throw error;
        }
      };
    },

    /**
     * Wrap a DELETE handler to log DELETE operations
     */
    wrapDelete: (handler: (req: NextRequest) => Promise<NextResponse>) => {
      return async (req: NextRequest): Promise<NextResponse> => {
        try {
          const response = await handler(req);
          
          // Only log successful deletes (2xx status codes)
          if (response.status >= 200 && response.status < 300) {
            try {
              const responseData = await response.clone().json();
              const recordId = options.getRecordId ? options.getRecordId(responseData) : responseData.id || responseData.Election_ID || responseData.Candidate_ID || 'unknown';
              
              const userContext = options.getUserContext ? await options.getUserContext(req) : {};
              const context: AuditContext = {
                request: req,
                ...userContext
              };
              
              // For deletes, we'd need to get the old values from the database before deletion
              // This is a simplified version
              const filteredData = filterSensitiveData(responseData, options.excludeFields, options.includeFields);
              
              await logDelete(options.tableName, recordId, filteredData, context);
            } catch (auditError) {
              console.error('Audit logging failed for DELETE:', auditError);
            }
          }
          
          return response;
        } catch (error) {
          // Log failed operation
          try {
            const userContext = options.getUserContext ? await options.getUserContext(req) : {};
            const context: AuditContext = {
              request: req,
              ...userContext
            };
            
            await logFailedOperation(
              'DELETE',
              options.tableName,
              'unknown',
              error instanceof Error ? error.message : 'Unknown error',
              context
            );
          } catch (auditError) {
            console.error('Failed to log audit for failed DELETE:', auditError);
          }
          
          throw error;
        }
      };
    }
  };
}

/**
 * Filter sensitive data from audit logs
 */
function filterSensitiveData(data: any, excludeFields?: string[], includeFields?: string[]): any {
  if (!data || typeof data !== 'object') return data;
  
  const filtered = { ...data };
  
  // Default sensitive fields to exclude
  const defaultExcludeFields = [
    'password',
    'passwordHash',
    'token',
    'secret',
    'privateKey',
    'apiKey',
    'accessToken',
    'refreshToken'
  ];
  
  const fieldsToExclude = [...(excludeFields || []), ...defaultExcludeFields];
  
  // Remove excluded fields
  fieldsToExclude.forEach(field => {
    delete filtered[field];
  });
  
  // If includeFields is specified, only keep those fields
  if (includeFields && includeFields.length > 0) {
    const result: any = {};
    includeFields.forEach(field => {
      if (filtered.hasOwnProperty(field)) {
        result[field] = filtered[field];
      }
    });
    return result;
  }
  
  return filtered;
}

/**
 * Helper function to extract user context from request headers/cookies
 */
export async function extractUserContext(request: NextRequest): Promise<{ userId?: string; userType?: 'management' | 'voter' | 'system' }> {
  try {
    // Try to get user info from cookies or headers
    const authCookie = request.cookies.get('auth-token');
    const userTypeHeader = request.headers.get('x-user-type');
    
    if (authCookie) {
      // In a real implementation, you'd decode the JWT token here
      // For now, we'll return a placeholder
      return {
        userId: 'authenticated-user',
        userType: (userTypeHeader as 'management' | 'voter') || 'management'
      };
    }
    
    return {
      userId: 'anonymous',
      userType: 'system'
    };
  } catch (error) {
    console.error('Failed to extract user context:', error);
    return {
      userId: 'unknown',
      userType: 'system'
    };
  }
}

/**
 * Simple audit wrapper for individual operations
 */
export async function withAuditLogging<T>(
  operation: () => Promise<T>,
  auditData: {
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    tableName: string;
    recordId: string;
    oldValues?: any;
    newValues?: any;
    context?: AuditContext;
  }
): Promise<T> {
  try {
    const result = await operation();
    
    // Log successful operation
    const { logCreate, logUpdate, logDelete } = await import('./audit');
    
    switch (auditData.action) {
      case 'CREATE':
        await logCreate(auditData.tableName, auditData.recordId, auditData.newValues, auditData.context);
        break;
      case 'UPDATE':
        await logUpdate(auditData.tableName, auditData.recordId, auditData.oldValues, auditData.newValues, auditData.context);
        break;
      case 'DELETE':
        await logDelete(auditData.tableName, auditData.recordId, auditData.oldValues, auditData.context);
        break;
    }
    
    return result;
  } catch (error) {
    // Log failed operation
    const { logFailedOperation } = await import('./audit');
    await logFailedOperation(
      auditData.action,
      auditData.tableName,
      auditData.recordId,
      error instanceof Error ? error.message : 'Unknown error',
      auditData.context
    );
    
    throw error;
  }
}
