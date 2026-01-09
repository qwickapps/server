/**
 * useJobStream Hook
 *
 * React hook for real-time job updates via Server-Sent Events (SSE).
 * Based on the QwickForge useRealtimeEvents pattern.
 */
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
export declare function useJobStream(options?: UseJobStreamOptions): UseJobStreamReturn;
