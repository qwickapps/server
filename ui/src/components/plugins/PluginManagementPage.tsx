/**
 * PluginManagementPage - Template for full plugin management pages
 *
 * Provides consistent layout for plugin management with search, filters, and actions.
 *
 * @example
 * ```tsx
 * <PluginManagementPage
 *   title="User Management"
 *   description="Manage user accounts and permissions"
 *   icon={<UsersIcon />}
 *   searchPlaceholder="Search users by email or name..."
 *   onSearch={handleSearch}
 *   actions={[
 *     { label: 'Create User', onClick: handleCreate, variant: 'primary' }
 *   ]}
 * >
 *   <DataTable columns={columns} data={users} />
 * </PluginManagementPage>
 * ```
 */

import React, { ReactNode } from 'react';

export interface PluginManagementPageProps {
  /** Page title */
  title: string;

  /** Optional description */
  description?: string;

  /** Optional icon */
  icon?: ReactNode;

  /** Search bar placeholder */
  searchPlaceholder?: string;

  /** Search handler */
  onSearch?: (query: string) => void;

  /** Page-level action buttons */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: ReactNode;
  }>;

  /** Optional filter controls */
  filters?: ReactNode;

  /** Optional tabs for multi-section pages */
  tabs?: Array<{
    id: string;
    label: string;
  }>;

  /** Active tab ID */
  activeTab?: string;

  /** Tab change handler */
  onTabChange?: (tabId: string) => void;

  /** Page content (typically DataTable) */
  children: ReactNode;

  /** Loading state */
  loading?: boolean;

  /** Breadcrumb items */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export const PluginManagementPage: React.FC<PluginManagementPageProps> = ({
  title,
  description,
  icon,
  searchPlaceholder,
  onSearch,
  actions = [],
  filters,
  tabs,
  activeTab,
  onTabChange,
  children,
  loading = false,
  breadcrumbs,
}) => {
  const actionVariants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="hover:text-gray-900 dark:hover:text-gray-100">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {icon && (
              <div className="text-4xl text-gray-600 dark:text-gray-400 mt-1">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors
                    ${actionVariants[action.variant || 'secondary']}
                  `}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Search and Filters */}
      {(onSearch || filters) && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {onSearch && (
            <div className="flex-1">
              <input
                type="search"
                placeholder={searchPlaceholder || 'Search...'}
                onChange={(e) => onSearch(e.target.value)}
                className="
                  w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
              />
            </div>
          )}
          {filters && (
            <div className="flex gap-2">
              {filters}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
};
