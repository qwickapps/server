import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PluginConfigPanel - Live configuration editor for plugins
 *
 * Provides form-based config editing with validation and real-time updates.
 *
 * @example
 * ```tsx
 * <PluginConfigPanel
 *   title="Rate Limit Configuration"
 *   description="Adjust rate limiting settings"
 *   config={config}
 *   schema={[
 *     { key: 'maxRequests', label: 'Max Requests', type: 'number', min: 1 },
 *     { key: 'windowMs', label: 'Window (ms)', type: 'number', min: 1000 },
 *     { key: 'strategy', label: 'Strategy', type: 'select', options: [...] }
 *   ]}
 *   onSave={handleSave}
 *   onReset={handleReset}
 * />
 * ```
 */
import { useState, useEffect } from 'react';
export const PluginConfigPanel = ({ title, description, config, schema, onSave, onReset, loading = false, readOnly = false, }) => {
    const [localConfig, setLocalConfig] = useState(config);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    useEffect(() => {
        setLocalConfig(config);
    }, [config]);
    const validateField = (field, value) => {
        if (field.required && (value === undefined || value === null || value === '')) {
            return `${field.label} is required`;
        }
        if (field.pattern && typeof value === 'string' && !field.pattern.test(value)) {
            return `${field.label} format is invalid`;
        }
        if (field.validate) {
            return field.validate(value);
        }
        return null;
    };
    const handleChange = (key, value) => {
        setLocalConfig({ ...localConfig, [key]: value });
        setSaved(false);
        // Clear error for this field
        if (errors[key]) {
            setErrors({ ...errors, [key]: '' });
        }
    };
    const handleSave = async () => {
        // Validate all fields
        const newErrors = {};
        schema.forEach((field) => {
            const error = validateField(field, localConfig[field.key]);
            if (error) {
                newErrors[field.key] = error;
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setSaving(true);
        try {
            await onSave(localConfig);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        catch (error) {
            console.error('Failed to save config:', error);
        }
        finally {
            setSaving(false);
        }
    };
    const renderField = (field) => {
        const value = localConfig[field.key];
        const hasError = Boolean(errors[field.key]);
        const baseClasses = `
      w-full px-3 py-2 rounded-md border
      ${hasError
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-white
      focus:ring-2 focus:border-transparent
      disabled:opacity-50 disabled:cursor-not-allowed
    `;
        switch (field.type) {
            case 'boolean':
                return (_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: Boolean(value), onChange: (e) => handleChange(field.key, e.target.checked), disabled: readOnly || loading, className: "rounded" }), _jsx("span", { className: "text-sm text-gray-700 dark:text-gray-300", children: field.description || 'Enable' })] }));
            case 'select':
                return (_jsx("select", { value: String(value ?? ''), onChange: (e) => handleChange(field.key, e.target.value), disabled: readOnly || loading, className: baseClasses, children: field.options?.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }));
            case 'textarea':
                return (_jsx("textarea", { value: String(value ?? ''), onChange: (e) => handleChange(field.key, e.target.value), disabled: readOnly || loading, rows: 4, className: baseClasses }));
            case 'number':
                return (_jsx("input", { type: "number", value: Number(value ?? 0), onChange: (e) => handleChange(field.key, Number(e.target.value)), min: field.min, max: field.max, step: field.step, disabled: readOnly || loading, className: baseClasses }));
            case 'text':
            default:
                return (_jsx("input", { type: "text", value: String(value ?? ''), onChange: (e) => handleChange(field.key, e.target.value), disabled: readOnly || loading, className: baseClasses }));
        }
    };
    return (_jsxs("div", { className: "rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: title }), description && (_jsx("p", { className: "mt-1 text-gray-600 dark:text-gray-400", children: description }))] }), _jsx("div", { className: "space-y-6", children: schema.map((field) => (_jsxs("div", { children: [field.type !== 'boolean' && (_jsxs("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: [field.label, field.required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] })), renderField(field), field.description && field.type !== 'boolean' && (_jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: field.description })), errors[field.key] && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors[field.key] }))] }, field.key))) }), !readOnly && (_jsxs("div", { className: "mt-6 flex items-center gap-3", children: [_jsx("button", { onClick: handleSave, disabled: saving || loading, className: "\n              px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white\n              rounded-md text-sm font-medium\n              disabled:opacity-50 disabled:cursor-not-allowed\n              transition-colors\n            ", children: saving ? 'Saving...' : 'Save Changes' }), _jsx("button", { onClick: onReset, disabled: saving || loading, className: "\n              px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900\n              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white\n              rounded-md text-sm font-medium\n              disabled:opacity-50 disabled:cursor-not-allowed\n              transition-colors\n            ", children: "Reset" }), saved && (_jsx("span", { className: "text-sm text-green-600 dark:text-green-400", children: "\u2713 Saved successfully" }))] }))] }));
};
//# sourceMappingURL=PluginConfigPanel.js.map