/**
 * Health Check Status Widget Component
 * Displays aggregated health status of all registered health checks
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  PluginStatusWidget,
  type PluginStatusWidgetProps,
} from '@qwickapps/server/ui';

export interface HealthStatusWidgetProps {
  apiPrefix?: string;
}

interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  message?: string;
  lastChecked: string;
}

interface HealthSummary {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  totalChecks: number;
  healthyChecks: number;
  unhealthyChecks: number;
  degradedChecks: number;
  checks: HealthCheckResult[];
}

export const HealthStatusWidget: React.FC<HealthStatusWidgetProps> = ({
  apiPrefix = '/api/plugins/health',
}) => {
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(`${apiPrefix}/summary`);
        if (!response.ok) throw new Error('Failed to fetch health');
        const data = await response.json();
        setSummary(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [apiPrefix]);

  if (loading) {
    return (
      <PluginStatusWidget
        title="Service Health"
        status="healthy"
        loading={true}
      />
    );
  }

  if (error || !summary) {
    return (
      <PluginStatusWidget
        title="Service Health"
        status="error"
        message={error || 'Failed to load health status'}
      />
    );
  }

  const widgetStats: PluginStatusWidgetProps['stats'] = [
    {
      label: 'Total Checks',
      value: summary.totalChecks,
      status: 'info',
    },
    {
      label: 'Healthy',
      value: summary.healthyChecks,
      status: 'healthy',
    },
    {
      label: 'Degraded',
      value: summary.degradedChecks,
      status: summary.degradedChecks > 0 ? 'warning' : 'info',
    },
    {
      label: 'Unhealthy',
      value: summary.unhealthyChecks,
      status: summary.unhealthyChecks > 0 ? 'error' : 'info',
    },
  ];

  const overallStatus: PluginStatusWidgetProps['status'] =
    summary.overall === 'healthy' ? 'healthy' :
    summary.overall === 'degraded' ? 'warning' : 'error';

  return (
    <PluginStatusWidget
      title="Service Health"
      status={overallStatus}
      stats={widgetStats}
      message={
        summary.unhealthyChecks > 0
          ? `${summary.unhealthyChecks} service(s) unhealthy`
          : summary.degradedChecks > 0
          ? `${summary.degradedChecks} service(s) degraded`
          : 'All services operational'
      }
      actions={[
        {
          label: 'View Details',
          onClick: () => {
            window.location.href = '/cpanel/plugins/health';
          },
          variant: 'secondary',
        },
      ]}
    />
  );
};

export default HealthStatusWidget;
