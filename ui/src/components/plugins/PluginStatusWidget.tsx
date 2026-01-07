/**
 * PluginStatusWidget - Template for plugin dashboard widgets
 *
 * Provides consistent layout for plugin status displays on the dashboard.
 * Supports stats, health indicators, and quick actions.
 *
 * @example
 * ```tsx
 * <PluginStatusWidget
 *   title="PostgreSQL"
 *   icon={<DatabaseIcon />}
 *   status="healthy"
 *   stats={[
 *     { label: 'Connections', value: 42, status: 'healthy' },
 *     { label: 'Queries/sec', value: 1250, status: 'info' }
 *   ]}
 *   actions={[
 *     { label: 'View Details', onClick: () => navigate('/postgres') }
 *   ]}
 * />
 * ```
 */

import React from 'react';
import { StatCard, StatCardProps } from '@qwickapps/react-framework';

export interface PluginStatusWidgetProps {
  /** Plugin name */
  title: string;

  /** Optional icon */
  icon?: React.ReactNode;

  /** Overall plugin status */
  status?: 'healthy' | 'warning' | 'error' | 'disabled';

  /** Overall plugin health (alias for status, for backward compatibility) */
  health?: 'healthy' | 'warning' | 'error' | 'disabled';

  /** Array of stats to display */
  stats?: StatCardProps[];

  /** Quick action buttons */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;

  /** Optional message or description */
  message?: string;

  /** Loading state */
  loading?: boolean;

  /** Error message */
  error?: string | null;

  /** Path to details page */
  detailsPath?: string;
}

export const PluginStatusWidget: React.FC<PluginStatusWidgetProps> = ({
  title,
  icon,
  status,
  health,
  stats = [],
  actions = [],
  message,
  loading = false,
}) => {
  // Use health as fallback for status (backward compatibility)
  const displayStatus = status || health || 'disabled';
  const statusIndicators = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    disabled: 'bg-gray-400',
  };

  const actionVariants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="text-2xl text-gray-600 dark:text-gray-400">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {message}
              </p>
            )}
          </div>
        </div>
        <div
          className={`w-3 h-3 rounded-full ${statusIndicators[displayStatus]}`}
          title={displayStatus}
        />
      </div>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors
                ${actionVariants[action.variant || 'secondary']}
              `}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
