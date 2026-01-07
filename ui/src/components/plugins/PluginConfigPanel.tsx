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

import React, { useState, useEffect } from 'react';

export type ConfigFieldType = 'text' | 'number' | 'boolean' | 'select' | 'textarea';

export interface ConfigField {
  /** Config key */
  key: string;

  /** Display label */
  label: string;

  /** Field type */
  type: ConfigFieldType;

  /** Field description */
  description?: string;

  /** For number type */
  min?: number;
  max?: number;
  step?: number;

  /** For select type */
  options?: Array<{ value: string | number; label: string }>;

  /** Validation */
  required?: boolean;
  pattern?: RegExp;
  validate?: (value: unknown) => string | null; // Return error message or null
}

export interface PluginConfigPanelProps {
  /** Panel title */
  title: string;

  /** Optional description */
  description?: string;

  /** Current configuration */
  config: Record<string, unknown>;

  /** Schema defining config fields */
  schema: ConfigField[];

  /** Save handler */
  onSave: (newConfig: Record<string, unknown>) => Promise<void>;

  /** Reset handler */
  onReset: () => void;

  /** Loading state */
  loading?: boolean;

  /** Read-only mode */
  readOnly?: boolean;
}

export const PluginConfigPanel: React.FC<PluginConfigPanelProps> = ({
  title,
  description,
  config,
  schema,
  onSave,
  onReset,
  loading = false,
  readOnly = false,
}) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const validateField = (field: ConfigField, value: unknown): string | null => {
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

  const handleChange = (key: string, value: unknown) => {
    setLocalConfig({ ...localConfig, [key]: value });
    setSaved(false);

    // Clear error for this field
    if (errors[key]) {
      setErrors({ ...errors, [key]: '' });
    }
  };

  const handleSave = async () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
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
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: ConfigField) => {
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
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => handleChange(field.key, e.target.checked)}
              disabled={readOnly || loading}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {field.description || 'Enable'}
            </span>
          </label>
        );

      case 'select':
        return (
          <select
            value={String(value ?? '')}
            onChange={(e) => handleChange(field.key, e.target.value)}
            disabled={readOnly || loading}
            className={baseClasses}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={String(value ?? '')}
            onChange={(e) => handleChange(field.key, e.target.value)}
            disabled={readOnly || loading}
            rows={4}
            className={baseClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={Number(value ?? 0)}
            onChange={(e) => handleChange(field.key, Number(e.target.value))}
            min={field.min}
            max={field.max}
            step={field.step}
            disabled={readOnly || loading}
            className={baseClasses}
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => handleChange(field.key, e.target.value)}
            disabled={readOnly || loading}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-6">
        {schema.map((field) => (
          <div key={field.key}>
            {field.type !== 'boolean' && (
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {renderField(field)}
            {field.description && field.type !== 'boolean' && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {field.description}
              </p>
            )}
            {errors[field.key] && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors[field.key]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="
              px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
              rounded-md text-sm font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={onReset}
            disabled={saving || loading}
            className="
              px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white
              rounded-md text-sm font-medium
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Reset
          </button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">
              ✓ Saved successfully
            </span>
          )}
        </div>
      )}
    </div>
  );
};
