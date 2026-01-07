/**
 * Seed Executor Component
 *
 * Executes seed scripts and displays real-time output via SSE.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useRef, useState } from 'react';

export interface SeedExecutorProps {
  apiPrefix: string;
  seedName: string;
  onComplete: () => void;
  onCancel: () => void;
}

type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed';

interface OutputLine {
  type: 'stdout' | 'stderr' | 'exit' | 'error';
  data: string;
  timestamp: string;
}

export const SeedExecutor: React.FC<SeedExecutorProps> = ({
  apiPrefix,
  seedName,
  onComplete,
  onCancel,
}) => {
  const [status, setStatus] = useState<ExecutionStatus>('idle');
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    executeScript();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [seedName]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const executeScript = async () => {
    try {
      setStatus('running');
      setOutput([]);
      setExitCode(null);

      const response = await fetch(`${apiPrefix}/seeds/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: seedName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Execution failed');
      }

      // Set up EventSource for SSE
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const event = JSON.parse(data);
              setOutput((prev) => [...prev, event]);

              if (event.type === 'exit') {
                const exitData = JSON.parse(event.data);
                setExitCode(exitData.exitCode);
                setStatus(exitData.exitCode === 0 ? 'completed' : 'failed');
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', e);
            }
          }
        }
      }
    } catch (err) {
      setStatus('failed');
      setOutput((prev) => [
        ...prev,
        {
          type: 'error',
          data: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case 'running':
        return '#1976d2';
      case 'completed':
        return '#2e7d32';
      case 'failed':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case 'running':
        return 'Running...';
      case 'completed':
        return `Completed (exit code: ${exitCode})`;
      case 'failed':
        return `Failed (exit code: ${exitCode})`;
      default:
        return 'Idle';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Executing: {seedName}</h3>
        <div>
          <span
            style={{
              padding: '6px 12px',
              backgroundColor: getStatusColor(),
              color: 'white',
              borderRadius: '4px',
              marginRight: '12px',
              fontSize: '14px',
            }}
            data-testid="execution-status"
          >
            {getStatusText()}
          </span>
          {status !== 'running' && (
            <>
              <button
                onClick={onComplete}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '8px',
                }}
              >
                View History
              </button>
              <button
                onClick={onCancel}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f5f5f5',
                  color: 'black',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Back to List
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={outputRef}
        data-testid="seed-output"
        style={{
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          fontFamily: 'monospace',
          fontSize: '13px',
          padding: '16px',
          borderRadius: '4px',
          height: '500px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {output.length === 0 && status === 'running' && (
          <div style={{ color: '#888' }}>Waiting for output...</div>
        )}
        {output.map((line, index) => (
          <div
            key={index}
            style={{
              color: line.type === 'stderr' ? '#f48771' : line.type === 'error' ? '#ff5555' : '#d4d4d4',
              marginBottom: '2px',
            }}
          >
            {line.data}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeedExecutor;
