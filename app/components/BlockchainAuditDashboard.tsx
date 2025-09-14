'use client';

import React, { useState, useEffect } from 'react';

interface BlockchainAuditLog {
  id: number;
  action: string;
  tableName: string;
  recordId: string;
  userId: string;
  userType: string;
  ipAddress: string;
  userAgent: string;
  oldValues?: any;
  newValues?: any;
  changes?: any;
  blockchainTxHash: string;
  status: string;
  errorMessage?: string;
  timestamp: string;
}

interface BlockchainStats {
  totalLogs: number;
  actionStats: Array<{ action: string; count: number }>;
  tableStats: Array<{ tableName: string; count: number }>;
  statusStats: Array<{ status: string; count: number }>;
  recentActivity: Array<{
    action: string;
    tableName: string;
    recordId: string;
    blockchainTxHash: string;
    timestamp: string;
    status: string;
  }>;
}

export default function BlockchainAuditDashboard() {
  const [logs, setLogs] = useState<BlockchainAuditLog[]>([]);
  const [stats, setStats] = useState<BlockchainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    tableName: '',
    recordId: '',
    startDate: '',
    endDate: ''
  });

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.tableName) params.append('tableName', filters.tableName);
      if (filters.recordId) params.append('recordId', filters.recordId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await fetch(`/api/blockchain-audit?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data);
      } else {
        setError(data.error || 'Failed to fetch blockchain audit logs');
      }
    } catch (err) {
      setError('Network error while fetching blockchain audit logs');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/blockchain-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'statistics',
          filters: {
            startDate: filters.startDate,
            endDate: filters.endDate
          }
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch blockchain stats:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLogs(), fetchStats()]);
      setLoading(false);
    };

    loadData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLogs();
        fetchStats();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, filters]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-600 bg-green-100';
      case 'UPDATE': return 'text-blue-600 bg-blue-100';
      case 'DELETE': return 'text-red-600 bg-red-100';
      case 'VOTE_SUBMIT': return 'text-purple-600 bg-purple-100';
      case 'BLOCKCHAIN_TX': return 'text-orange-600 bg-orange-100';
      case 'UPDATE_CANDIDATE': return 'text-blue-600 bg-blue-100';
      case 'DELETE_CANDIDATE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      case 'VOTE_SUBMIT': return '🗳️';
      case 'BLOCKCHAIN_TX': return '⛓️';
      case 'UPDATE_CANDIDATE': return '✏️';
      case 'DELETE_CANDIDATE': return '🗑️';
      default: return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateHash = (hash: string) => {
    if (hash.length > 20) {
      return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
    }
    return hash;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Blockchain Audit Trail</h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-2"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={() => {
              fetchLogs();
              fetchStats();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Blockchain Events</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalLogs}</p>
            <p className="text-sm text-gray-500">All blockchain operations</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Successful Operations</h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.statusStats.find(s => s.status === 'success')?.count || 0}
            </p>
            <p className="text-sm text-gray-500">Blockchain transactions</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Failed Operations</h3>
            <p className="text-3xl font-bold text-red-600">
              {stats.statusStats.find(s => s.status === 'failed')?.count || 0}
            </p>
            <p className="text-sm text-gray-500">Blockchain errors</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Most Active Table</h3>
            <p className="text-xl font-bold text-purple-600">
              {stats.tableStats[0]?.tableName || 'None'}
            </p>
            <p className="text-sm text-gray-500">
              {stats.tableStats[0]?.count || 0} operations
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="UPDATE_CANDIDATE">Update Candidate</option>
              <option value="DELETE_CANDIDATE">Delete Candidate</option>
              <option value="VOTE_SUBMIT">Vote Submit</option>
              <option value="BLOCKCHAIN_TX">Blockchain TX</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
            <select
              value={filters.tableName}
              onChange={(e) => setFilters({...filters, tableName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Tables</option>
              <option value="candidates">Candidates</option>
              <option value="elections">Elections</option>
              <option value="votes">Votes</option>
              <option value="voters">Voters</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Record ID</label>
            <input
              type="text"
              value={filters.recordId}
              onChange={(e) => setFilters({...filters, recordId: e.target.value})}
              placeholder="Enter record ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Blockchain Audit Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Blockchain Audit Logs</h2>
          <p className="text-sm text-gray-500">All operations tracked on the blockchain</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No blockchain audit logs found
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)} {log.action}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action} operation on {log.tableName} (ID: {log.recordId})
                      </p>
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="font-medium">User:</span> {log.userId} ({log.userType}) | 
                        <span className="font-medium ml-2">IP:</span> {log.ipAddress} | 
                        <span className="font-medium ml-2">Status:</span> 
                        <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Blockchain TX Hash:</span>
                        <code className="ml-1 bg-gray-100 px-2 py-1 rounded text-xs">
                          {truncateHash(log.blockchainTxHash)}
                        </code>
                      </div>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Changes:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(log.changes).map(([field, changeData]: [string, any]) => (
                              <div key={field} className="ml-2">
                                <span className="font-medium">{field}:</span>
                                <span className="text-red-600 line-through ml-1">{changeData.from}</span>
                                <span className="text-green-600 ml-1">→ {changeData.to}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {log.errorMessage && (
                        <div className="mt-2 text-xs text-red-600">
                          <span className="font-medium">Error:</span> {log.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Breakdown */}
      {stats && stats.actionStats.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Blockchain Operations by Action Type</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.actionStats.map((actionStat) => (
                <div key={actionStat.action} className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getActionColor(actionStat.action)}`}>
                    {getActionIcon(actionStat.action)} {actionStat.action}
                  </div>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{actionStat.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
