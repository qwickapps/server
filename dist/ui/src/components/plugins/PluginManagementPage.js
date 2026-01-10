import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import React from 'react';
export const PluginManagementPage = ({ title, description, icon, searchPlaceholder, onSearch, actions = [], filters, tabs, activeTab, onTabChange, children, loading = false, breadcrumbs, }) => {
    const actionVariants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [breadcrumbs && breadcrumbs.length > 0 && (_jsx("nav", { className: "mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400", children: breadcrumbs.map((crumb, index) => (_jsxs(React.Fragment, { children: [index > 0 && _jsx("span", { children: "/" }), crumb.href ? (_jsx("a", { href: crumb.href, className: "hover:text-gray-900 dark:hover:text-gray-100", children: crumb.label })) : (_jsx("span", { className: "text-gray-900 dark:text-gray-100 font-medium", children: crumb.label }))] }, index))) })), _jsx("div", { className: "mb-8", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-4", children: [icon && (_jsx("div", { className: "text-4xl text-gray-600 dark:text-gray-400 mt-1", children: icon })), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 dark:text-white", children: title }), description && (_jsx("p", { className: "mt-2 text-gray-600 dark:text-gray-400", children: description }))] })] }), actions.length > 0 && (_jsx("div", { className: "flex gap-2", children: actions.map((action, index) => (_jsxs("button", { onClick: action.onClick, className: `
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                    transition-colors
                    ${actionVariants[action.variant || 'secondary']}
                  `, children: [action.icon, action.label] }, index))) }))] }) }), tabs && tabs.length > 0 && (_jsx("div", { className: "mb-6 border-b border-gray-200 dark:border-gray-700", children: _jsx("nav", { className: "flex space-x-8", children: tabs.map((tab) => (_jsx("button", { onClick: () => onTabChange?.(tab.id), className: `
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}
                `, children: tab.label }, tab.id))) }) })), (onSearch || filters) && (_jsxs("div", { className: "mb-6 flex flex-col sm:flex-row gap-4", children: [onSearch && (_jsx("div", { className: "flex-1", children: _jsx("input", { type: "search", placeholder: searchPlaceholder || 'Search...', onChange: (e) => onSearch(e.target.value), className: "\n                  w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600\n                  bg-white dark:bg-gray-800\n                  text-gray-900 dark:text-white\n                  placeholder-gray-500 dark:placeholder-gray-400\n                  focus:ring-2 focus:ring-blue-500 focus:border-transparent\n                " }) })), filters && (_jsx("div", { className: "flex gap-2", children: filters }))] })), _jsx("div", { className: loading ? 'opacity-50 pointer-events-none' : '', children: children })] }));
};
//# sourceMappingURL=PluginManagementPage.js.map