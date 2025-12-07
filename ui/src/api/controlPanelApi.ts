/**
 * Control Panel API Client
 *
 * Communicates with the backend Express API
 */

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  lastChecked: string;
  error?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: Record<string, HealthCheck>;
}

export interface InfoResponse {
  product: string;
  version: string;
  uptime: number;
  links: Array<{ label: string; url: string; external?: boolean }>;
  branding?: {
    primaryColor?: string;
    logo?: string;
  };
}

export interface DiagnosticsResponse {
  timestamp: string;
  product: string;
  version?: string;
  uptime: number;
  health: Record<string, HealthCheck>;
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    memory: {
      total: number;
      used: number;
      free: number;
    };
    cpu: {
      usage: number;
    };
  };
}

export interface ConfigResponse {
  config: Record<string, string | number | boolean>;
  masked: string[];
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source?: string;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface LogSource {
  name: string;
  type: 'file' | 'api';
  available: boolean;
}

class ControlPanelApi {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async getHealth(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getInfo(): Promise<InfoResponse> {
    const response = await fetch(`${this.baseUrl}/api/info`);
    if (!response.ok) {
      throw new Error(`Info request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getDiagnostics(): Promise<DiagnosticsResponse> {
    const response = await fetch(`${this.baseUrl}/api/diagnostics`);
    if (!response.ok) {
      throw new Error(`Diagnostics request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getConfig(): Promise<ConfigResponse> {
    const response = await fetch(`${this.baseUrl}/api/config`);
    if (!response.ok) {
      throw new Error(`Config request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getLogs(options: {
    source?: string;
    level?: string;
    search?: string;
    limit?: number;
    page?: number;
  } = {}): Promise<LogsResponse> {
    const params = new URLSearchParams();
    if (options.source) params.set('source', options.source);
    if (options.level) params.set('level', options.level);
    if (options.search) params.set('search', options.search);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.page) params.set('page', options.page.toString());

    const response = await fetch(`${this.baseUrl}/api/logs?${params}`);
    if (!response.ok) {
      throw new Error(`Logs request failed: ${response.statusText}`);
    }
    return response.json();
  }

  async getLogSources(): Promise<LogSource[]> {
    const response = await fetch(`${this.baseUrl}/api/logs/sources`);
    if (!response.ok) {
      throw new Error(`Log sources request failed: ${response.statusText}`);
    }
    const data = await response.json();
    return data.sources;
  }
}

export const api = new ControlPanelApi();
