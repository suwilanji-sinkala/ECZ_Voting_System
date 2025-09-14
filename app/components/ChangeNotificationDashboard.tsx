'use client';

import React, { useState, useEffect } from 'react';

interface ChangeNotification {
  id: number;
  action: string;
  tableName: string;
  recordId: string;
  userId: string;
  userType: string;
  timestamp: string;
  changes?: any;
  message: string;
}

interface ChangeStats {
  totalChanges: number;
  changesByAction: Array<{ action: string; count: number }>;
  changesByUser: Array<{ userId: string; count: number }>;
  changesByTable: Array<{ tableName: string; count: number }>;
  criticalChanges: number;
  period: string;
}

export default function ChangeNotificationDashboard() {
  const [changes, setChanges] = useState<ChangeNotification[]>([]);
  const [stats, setStats] = useState<ChangeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchChanges = async () => {
    try {
      const response = await fetch('/api/change-notifications?type=recent&minutes=60&limit=20');
      const data = await response.json();
      
      if (data.success) {
        setChanges(data.data);
      } else {
        setError(data.error || 'Failed to fetch changes');
      }
    } catch (err) {
      setError('Network error while fetching changes');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/change-notifications?stats=true&hours=24');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchChanges(), fetchStats()]);
      setLoading(false);
    };

    loadData();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchChanges();
        fetchStats();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-600 bg-green-100';
      case 'UPDATE': return 'text-blue-600 bg-blue-100';
      case 'DELETE': return 'text-red-600 bg-red-100';
      case 'VOTE_SUBMIT': return 'text-purple-600 bg-purple-100';
      case 'BLOCKCHAIN_TX': return 'text-orange-600 bg-orange-100';
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
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Change Notifications</h1>
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
              fetchChanges();
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
            <h3 className="text-lg font-semibold text-gray-700">Total Changes</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalChanges}</p>
            <p className="text-sm text-gray-500">Last {stats.period}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Critical Changes</h3>
            <p className="text-3xl font-bold text-red-600">{stats.criticalChanges}</p>
            <p className="text-sm text-gray-500">Deletions & Failures</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Most Active Table</h3>
            <p className="text-xl font-bold text-green-600">
              {stats.changesByTable[0]?.tableName || 'None'}
            </p>
            <p className="text-sm text-gray-500">
              {stats.changesByTable[0]?.count || 0} changes
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Most Active User</h3>
            <p className="text-xl font-bold text-purple-600">
              {stats.changesByUser[0]?.userId || 'None'}
            </p>
            <p className="text-sm text-gray-500">
              {stats.changesByUser[0]?.count || 0} changes
            </p>
          </div>
        </div>
      )}

      {/* Recent Changes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Changes</h2>
          <p className="text-sm text-gray-500">Last 60 minutes</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {changes.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No recent changes found
            </div>
          ) : (
            changes.map((change) => (
              <div key={change.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(change.action)}`}>
                      {getActionIcon(change.action)} {change.action}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {change.message}
                      </p>
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="font-medium">Table:</span> {change.tableName} | 
                        <span className="font-medium ml-2">Record ID:</span> {change.recordId} | 
                        <span className="font-medium ml-2">User:</span> {change.userId} ({change.userType})
                      </div>
                      {change.changes && Object.keys(change.changes).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          <span className="font-medium">Changes:</span>
                          <div className="mt-1 space-y-1">
                            {Object.entries(change.changes).map(([field, changeData]: [string, any]) => (
                              <div key={field} className="ml-2">
                                <span className="font-medium">{field}:</span>
                                <span className="text-red-600 line-through ml-1">{changeData.from}</span>
                                <span className="text-green-600 ml-1">→ {changeData.to}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTimestamp(change.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Breakdown */}
      {stats && stats.changesByAction.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Changes by Action Type</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.changesByAction.map((actionStat) => (
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
