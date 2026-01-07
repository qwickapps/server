/**
 * useJobStream Hook
 *
 * React hook for real-time job updates via Server-Sent Events (SSE).
 * Based on the QwickForge useRealtimeEvents pattern.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/controlPanelApi';

export interface Job {
  id: string;
  userId: string;
  requestId?: string;
  jobType: 'generate_variants' | 'publish' | 'index_content' | 'sync_analytics';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface JobChangeEvent {
  type: 'insert' | 'update' | 'delete';
  table: string;
  record: Job;
}

export interface UseJobStreamOptions {
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export interface UseJobStreamReturn {
  jobs: Job[];
  connected: boolean;
  error: string | null;
  reconnecting: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for streaming real-time job updates
 */
export function useJobStream(options: UseJobStreamOptions = {}): UseJobStreamReturn {
  const { enabled = true, onError } = options;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Maximum reconnection attempts
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Fetch initial jobs via REST API
  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`${api.getBaseUrl()}/api/contentops/jobs`, {
        credentials: 'same-origin',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }
      const data = await response.json();
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(message);
      onError?.(err instanceof Error ? err : new Error(message));
    }
  }, [onError]);

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current) {
      return;
    }

    try {
      setReconnecting(true);
      const eventSource = new EventSource(`${api.getBaseUrl()}/api/contentops/jobs/stream`, {
        withCredentials: true,
      });

      eventSource.addEventListener('connected', () => {
        setConnected(true);
        setReconnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      eventSource.addEventListener('initial-jobs', (event) => {
        const data = JSON.parse(event.data);
        setJobs(data.jobs || []);
      });

      eventSource.addEventListener('job-change', (event) => {
        const change: JobChangeEvent = JSON.parse(event.data);

        setJobs((currentJobs) => {
          if (change.type === 'insert') {
            return [change.record, ...currentJobs];
          }

          if (change.type === 'update') {
            return currentJobs.map((job) =>
              job.id === change.record.id ? change.record : job
            );
          }

          if (change.type === 'delete') {
            return currentJobs.filter((job) => job.id !== change.record.id);
          }

          return currentJobs;
        });
      });

      eventSource.onerror = () => {
        setConnected(false);
        setReconnecting(true);

        // Clean up current connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt reconnection with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          const errorMessage = 'SSE connection failed after multiple attempts';
          setError(errorMessage);
          setReconnecting(false);
          onError?.(new Error(errorMessage));
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to SSE';
      setError(message);
      setReconnecting(false);
      onError?.(err instanceof Error ? err : new Error(message));
    }
  }, [enabled, onError]);

  // Disconnect from SSE stream
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnected(false);
    setReconnecting(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    jobs,
    connected,
    error,
    reconnecting,
    refresh,
  };
}
