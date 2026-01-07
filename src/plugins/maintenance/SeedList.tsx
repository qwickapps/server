/**
 * Seed List Component
 *
 * Displays available seed scripts with metadata.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';

export interface SeedListProps {
  apiPrefix: string;
  onExecute: (seedName: string) => void;
}

interface SeedFile {
  name: string;
  path: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

export const SeedList: React.FC<SeedListProps> = ({ apiPrefix, onExecute }) => {
  const [seeds, setSeeds] = useState<SeedFile[]>([]);
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
        No seed scripts found in scripts directory.
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>Available Seed Scripts ({seeds.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Name</th>
            <th style={{ padding: '12px' }}>Size</th>
            <th style={{ padding: '12px' }}>Modified</th>
            <th style={{ padding: '12px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {seeds.map((seed) => (
            <tr key={seed.name} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontFamily: 'monospace' }}>
                {seed.name}
              </td>
              <td style={{ padding: '12px' }}>{formatFileSize(seed.size)}</td>
              <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                {formatDate(seed.modifiedAt)}
              </td>
              <td style={{ padding: '12px' }}>
                <button
                  onClick={() => {
                    if (confirm(`Execute ${seed.name}?`)) {
                      onExecute(seed.name);
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
                  data-testid={`execute-${seed.name}`}
                >
                  Execute
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SeedList;
