/**
 * Vitest Setup
 *
 * Configures the testing environment for React component tests.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import React from 'react';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.confirm
global.confirm = vi.fn(() => true);

// Mock window.alert
global.alert = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock MUI components to avoid loading thousands of icon files
vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }: any) => React.createElement('div', props, children),
  Card: ({ children, ...props }: any) => React.createElement('div', props, children),
  CardContent: ({ children, ...props }: any) => React.createElement('div', props, children),
  Typography: ({ children, ...props }: any) => React.createElement('div', props, children),
  Chip: ({ label, ...props }: any) => React.createElement('div', props, label),
  CircularProgress: (props: any) => React.createElement('div', { ...props, role: 'progressbar' }),
  Alert: ({ children, ...props }: any) => React.createElement('div', { ...props, role: 'alert' }, children),
  Button: ({ children, ...props }: any) => React.createElement('button', props, children),
  Tab: ({ label, ...props }: any) => React.createElement('button', { ...props, role: 'tab' }, label),
  Tabs: ({ children, ...props }: any) => React.createElement('div', { ...props, role: 'tablist' }, children),
  Table: ({ children, ...props }: any) => React.createElement('table', props, children),
  TableHead: ({ children, ...props }: any) => React.createElement('thead', props, children),
  TableBody: ({ children, ...props }: any) => React.createElement('tbody', props, children),
  TableRow: ({ children, ...props }: any) => React.createElement('tr', props, children),
  TableCell: ({ children, ...props }: any) => React.createElement('td', props, children),
  TableContainer: ({ children, ...props }: any) => React.createElement('div', props, children),
  Paper: ({ children, ...props }: any) => React.createElement('div', props, children),
  Grid: ({ children, ...props }: any) => React.createElement('div', props, children),
  TextField: (props: any) => React.createElement('input', { ...props, type: 'text' }),
  Select: ({ children, ...props }: any) => React.createElement('select', props, children),
  MenuItem: ({ children, ...props }: any) => React.createElement('option', props, children),
  FormControl: ({ children, ...props }: any) => React.createElement('div', props, children),
  InputLabel: ({ children, ...props }: any) => React.createElement('label', props, children),
  Checkbox: (props: any) => React.createElement('input', { ...props, type: 'checkbox' }),
}));

// Mock MUI icons
vi.mock('@mui/icons-material', () => ({
  CheckCircle: (props: any) => React.createElement('span', props, '✓'),
  Error: (props: any) => React.createElement('span', props, '✗'),
  Warning: (props: any) => React.createElement('span', props, '⚠'),
  Info: (props: any) => React.createElement('span', props, 'ℹ'),
}));

// Mock @qwickapps/react-framework components
vi.mock('@qwickapps/react-framework', () => ({
  PluginStatusWidget: ({ title, stats, health, loading, error }: any) => {
    if (loading) return React.createElement('div', null, `${title} Loading...`);
    if (error) return React.createElement('div', null, `${title} Error: ${error}`);
    return React.createElement(
      'div',
      null,
      React.createElement('h3', null, title),
      stats && stats.map((stat: any, i: number) =>
        React.createElement('div', { key: i }, `${stat.label}: ${stat.value}`)
      )
    );
  },
  PluginManagementPage: ({ title, tabs, activeTab, children }: any) =>
    React.createElement(
      'div',
      null,
      React.createElement('h1', null, title),
      tabs && React.createElement('div', { role: 'tablist' }, tabs.map((tab: any) =>
        React.createElement('button', { key: tab.value, role: 'tab' }, tab.label)
      )),
      children
    ),
  DataTable: ({ columns, data }: any) =>
    React.createElement(
      'table',
      null,
      React.createElement('thead', null,
        React.createElement('tr', null, columns && columns.map((col: any) =>
          React.createElement('th', { key: col.key }, col.label)
        ))
      ),
      React.createElement('tbody', null, data && data.map((row: any, i: number) =>
        React.createElement('tr', { key: i })
      ))
    ),
  StatCard: ({ label, value }: any) =>
    React.createElement('div', null, `${label}: ${value}`),
  PluginConfigPanel: ({ children }: any) =>
    React.createElement('div', null, children),
}));
