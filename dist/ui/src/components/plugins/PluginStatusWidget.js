import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StatCard } from '@qwickapps/react-framework';
export const PluginStatusWidget = ({ title, icon, status, health, stats = [], actions = [], message, loading = false, }) => {
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
        return (_jsx("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: _jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" }), _jsxs("div", { className: "space-y-3", children: [_jsx("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" })] })] }) }));
    }
    return (_jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [icon && (_jsx("div", { className: "text-2xl text-gray-600 dark:text-gray-400", children: icon })), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: title }), message && (_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: message }))] })] }), _jsx("div", { className: `w-3 h-3 rounded-full ${statusIndicators[displayStatus]}`, title: displayStatus })] }), stats.length > 0 && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4", children: stats.map((stat, index) => (_jsx(StatCard, { ...stat }, index))) })), actions.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mt-4", children: actions.map((action, index) => (_jsx("button", { onClick: action.onClick, className: `
                px-4 py-2 rounded-md text-sm font-medium
                transition-colors
                ${actionVariants[action.variant || 'secondary']}
              `, children: action.label }, index))) }))] }));
};
//# sourceMappingURL=PluginStatusWidget.js.map