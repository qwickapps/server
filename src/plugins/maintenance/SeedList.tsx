/**
 * Seed List Component
 *
 * Displays available seed scripts and custom tasks with metadata.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';

export interface SeedListProps {
  apiPrefix: string;
  onExecute: (seedName: string, type?: string, options?: any) => void;
}

interface SeedFile {
  type: 'file';
  name: string;
  path: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

interface CustomTask {
  type: 'task';
  id: string;
  name: string;
  description: string;
  options?: Record<string, any>;
}

type SeedItem = SeedFile | CustomTask;

export const SeedList: React.FC<SeedListProps> = ({ apiPrefix, onExecute }) => {
  const [seeds, setSeeds] = useState<SeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSeeds();
  }, [apiPrefix]);

  const fetchSeeds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiPrefix}/seeds/discover`);
      if (!response.ok) throw new Error('Failed to fetch seeds');
      const data = await response.json();
      setSeeds(data.seeds || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const isFileType = (item: SeedItem): item is SeedFile => {
    return item.type === 'file';
  };

  const isTaskType = (item: SeedItem): item is CustomTask => {
    return item.type === 'task';
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading seeds...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: '#d32f2f' }}>
        Error: {error}
      </div>
    );
  }

  if (seeds.length === 0) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        No seed scripts or tasks found.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>Available Seeds & Tasks ({seeds.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Type</th>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>Description</th>
            <th style={{ padding: '12px' }}>Details</th>
            <th style={{ padding: '12px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {seeds.map((seed) => {
            const itemKey = isFileType(seed) ? seed.name : seed.id;
            return (
              <tr key={itemKey} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: isFileType(seed) ? '#e3f2fd' : '#f3e5f5',
                      color: isFileType(seed) ? '#1976d2' : '#7b1fa2',
                    }}
                  >
                    {isFileType(seed) ? 'FILE' : 'TASK'}
                  </span>
                </td>
                <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                  {isFileType(seed) ? seed.name : seed.name}
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                  {isTaskType(seed) ? seed.description : '-'}
                </td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                  {isFileType(seed)
                    ? `${formatFileSize(seed.size)} • ${formatDate(seed.modifiedAt)}`
                    : '-'}
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => {
                      const displayName = isFileType(seed) ? seed.name : seed.name;
                      if (confirm(`Execute ${displayName}?`)) {
                        if (isFileType(seed)) {
                          onExecute(seed.name, 'file');
                        } else {
                          onExecute(seed.id, 'task', seed.options);
                        }
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                    data-testid={`execute-${itemKey}`}
                  >
                    Execute
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SeedList;
