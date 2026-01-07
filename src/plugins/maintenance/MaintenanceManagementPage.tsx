/**
 * Maintenance Management Page Component
 * Provides operational tools for CMS applications
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { PluginManagementPage } from '@qwickapps/server/ui';
import { StatCard } from '@qwickapps/react-framework';
import { Card, CardContent, Typography } from '@mui/material';

export interface MaintenanceManagementPageProps {
  apiPrefix?: string;
}

interface MaintenanceStatus {
  status: 'ok' | 'error';
  features: {
    seeds: boolean;
    serviceControl: boolean;
    envManagement: boolean;
    databaseOps: boolean;
  };
  config: {
    scriptsPath: string;
    envFilePath: string;
    backupsPath: string;
  };
}

export const MaintenanceManagementPage: React.FC<MaintenanceManagementPageProps> = ({
  apiPrefix = '/api/plugins/maintenance',
}) => {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${apiPrefix}/status`);
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch maintenance status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [apiPrefix]);

  return (
    <PluginManagementPage
      title="Maintenance & Operations"
      description="Operational tools for managing your CMS application"
      breadcrumbs={[
        { label: 'Control Panel', href: '/cpanel' },
        { label: 'Plugins', href: '/cpanel/plugins' },
        { label: 'Maintenance' },
      ]}
      loading={loading}
    >
      {/* Feature Status Overview */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Seed Management"
            value={status.features.seeds ? 'Enabled' : 'Disabled'}
            status={status.features.seeds ? 'healthy' : 'info'}
          />
          <StatCard
            label="Service Control"
            value={status.features.serviceControl ? 'Enabled' : 'Disabled'}
            status={status.features.serviceControl ? 'healthy' : 'info'}
          />
          <StatCard
            label="Environment Variables"
            value={status.features.envManagement ? 'Enabled' : 'Disabled'}
            status={status.features.envManagement ? 'healthy' : 'info'}
          />
          <StatCard
            label="Database Operations"
            value={status.features.databaseOps ? 'Enabled' : 'Disabled'}
            status={status.features.databaseOps ? 'healthy' : 'info'}
          />
        </div>
      )}

      {/* Feature Sections */}
      <div className="space-y-6">
        {/* Seed Management */}
        {status?.features.seeds && (
          <Card>
            <CardContent>
              <Typography variant="h6">Seed Management</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage database seed scripts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seed management UI will be implemented in issue #702
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Service Control */}
        {status?.features.serviceControl && (
          <Card>
            <CardContent>
              <Typography variant="h6">Service Control</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start, stop, and restart services
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Service control UI will be implemented in issue #703
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Environment Variables */}
        {status?.features.envManagement && (
          <Card>
            <CardContent>
              <Typography variant="h6">Environment Variables</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                View and manage environment configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Environment variable management UI will be implemented in issue #704
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Database Operations */}
        {status?.features.databaseOps && (
          <Card>
            <CardContent>
              <Typography variant="h6">Database Operations</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Backup and restore database operations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Database operations UI will be implemented in issue #705
              </Typography>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Configuration Info */}
      {status && (
        <div className="mt-6">
          <Card>
            <CardContent>
              <Typography variant="h6">Configuration</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current maintenance plugin configuration
              </Typography>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Scripts Path:</span>
                  <code className="text-sm text-gray-900 dark:text-gray-100">
                    {status.config.scriptsPath}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Environment File:</span>
                  <code className="text-sm text-gray-900 dark:text-gray-100">
                    {status.config.envFilePath}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Backups Path:</span>
                  <code className="text-sm text-gray-900 dark:text-gray-100">
                    {status.config.backupsPath}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PluginManagementPage>
  );
};

export default MaintenanceManagementPage;
