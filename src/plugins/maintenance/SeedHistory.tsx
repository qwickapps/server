/**
 * Seed History Component
 *
 * Displays execution history with filtering and pagination.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';

export interface SeedHistoryProps {
  apiPrefix: string;
}

interface Execution {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  exit_code: number | null;
  duration_ms: number | null;
}

export const SeedHistory: React.FC<SeedHistoryProps> = ({ apiPrefix }) => {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [executionDetails, setExecutionDetails] = useState<any | null>(null);

  const limit = 20;

  useEffect(() => {
    fetchHistory();
  }, [apiPrefix, statusFilter, searchQuery, offset]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`${apiPrefix}/seeds/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch history');

      const data = await response.json();
      setExecutions(data.executions || []);
      setTotal(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionDetails = async (id: string) => {
    try {
      const response = await fetch(`${apiPrefix}/seeds/history/${id}`);
      if (!response.ok) throw new Error('Failed to fetch execution details');

      const data = await response.json();
      setExecutionDetails(data.execution);
    } catch (err) {
      console.error('Failed to fetch execution details:', err);
    }
  };

  const formatDuration = (ms: number | null): string => {
    if (ms === null) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string): React.ReactElement => {
    const colors = {
      running: '#1976d2',
      completed: '#2e7d32',
      failed: '#d32f2f',
    };

    return (
      <span
        style={{
          padding: '4px 8px',
          backgroundColor: colors[status as keyof typeof colors] || '#666',
          color: 'white',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading && executions.length === 0) {
    return <div style={{ padding: '20px' }}>Loading history...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#d32f2f' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setOffset(0);
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        >
          <option value="all">All Status</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>

        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOffset(0);
          }}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            flex: 1,
          }}
        />
      </div>

      <h3>Execution History ({total} total)</h3>

      {executions.length === 0 ? (
        <div style={{ padding: '20px', color: '#666' }}>
          No executions found.
        </div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px' }}>Started</th>
                <th style={{ padding: '12px' }}>Duration</th>
                <th style={{ padding: '12px' }}>Exit Code</th>
                <th style={{ padding: '12px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((execution) => (
                <tr key={execution.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                    {execution.name}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {getStatusBadge(execution.status)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {formatDateTime(execution.started_at)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {formatDuration(execution.duration_ms)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {execution.exit_code !== null ? execution.exit_code : '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => {
                        setSelectedExecution(execution);
                        fetchExecutionDetails(execution.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: offset === 0 ? '#f5f5f5' : '#1976d2',
                color: offset === 0 ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: offset === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <span style={{ padding: '8px' }}>
              Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
            </span>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              style={{
                padding: '8px 16px',
                backgroundColor: offset + limit >= total ? '#f5f5f5' : '#1976d2',
                color: offset + limit >= total ? '#999' : 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: offset + limit >= total ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {selectedExecution && executionDetails && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedExecution(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflow: 'auto',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Execution Details: {selectedExecution.name}</h3>
            <div style={{ marginTop: '16px' }}>
              <p><strong>Status:</strong> {getStatusBadge(selectedExecution.status)}</p>
              <p><strong>Started:</strong> {formatDateTime(selectedExecution.started_at)}</p>
              <p><strong>Completed:</strong> {formatDateTime(selectedExecution.completed_at)}</p>
              <p><strong>Duration:</strong> {formatDuration(selectedExecution.duration_ms)}</p>
              <p><strong>Exit Code:</strong> {selectedExecution.exit_code !== null ? selectedExecution.exit_code : '-'}</p>

              {executionDetails.output && (
                <>
                  <h4 style={{ marginTop: '20px' }}>Output:</h4>
                  <pre
                    style={{
                      backgroundColor: '#1e1e1e',
                      color: '#d4d4d4',
                      padding: '12px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '300px',
                      fontSize: '12px',
                    }}
                  >
                    {executionDetails.output}
                  </pre>
                </>
              )}

              {executionDetails.error && (
                <>
                  <h4 style={{ marginTop: '20px', color: '#d32f2f' }}>Error:</h4>
                  <pre
                    style={{
                      backgroundColor: '#ffebee',
                      color: '#c62828',
                      padding: '12px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '200px',
                      fontSize: '12px',
                    }}
                  >
                    {executionDetails.error}
                  </pre>
                </>
              )}
            </div>
            <button
              onClick={() => setSelectedExecution(null)}
              style={{
                marginTop: '20px',
                padding: '8px 16px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeedHistory;
