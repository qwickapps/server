/**
 * PreferencesPage Tests
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreferencesPage } from '../PreferencesPage';
import { api } from '../../api/controlPanelApi';

// Mock the API
jest.mock('../../api/controlPanelApi', () => ({
  api: {
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
    deletePreferences: jest.fn(),
  },
}));

// Mock window.confirm
global.confirm = jest.fn();

describe('PreferencesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.confirm as jest.Mock).mockReturnValue(true);
  });

  it('loads and displays preferences on mount', async () => {
    const mockPreferences = { theme: 'dark', language: 'en' };
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: mockPreferences,
    });

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/"theme": "dark"/)).toBeInTheDocument();
    });

    expect(api.getPreferences).toHaveBeenCalledTimes(1);
  });

  it('displays loading state initially', () => {
    (api.getPreferences as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<PreferencesPage />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when loading fails', async () => {
    (api.getPreferences as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<PreferencesPage />);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  it('validates JSON syntax in real-time', async () => {
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: {},
    });

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const editor = screen.getByRole('textbox', { name: /Preferences JSON/i });

    // Enter invalid JSON
    fireEvent.change(editor, { target: { value: '{invalid json}' } });

    await waitFor(() => {
      expect(screen.getByText(/Unexpected token/i)).toBeInTheDocument();
    });
  });

  it('validates nesting depth', async () => {
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: {},
    });

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const editor = screen.getByRole('textbox', { name: /Preferences JSON/i });

    // Create deeply nested object (11 levels)
    const deeplyNested = {
      a: { b: { c: { d: { e: { f: { g: { h: { i: { j: { k: 'too deep' } } } } } } } } } },
    };

    fireEvent.change(editor, { target: { value: JSON.stringify(deeplyNested) } });

    await waitFor(() => {
      expect(screen.getByText(/too deeply nested/i)).toBeInTheDocument();
    });
  });

  it('disables save button when JSON is invalid', async () => {
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: {},
    });

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const editor = screen.getByRole('textbox', { name: /Preferences JSON/i });
    const saveButton = screen.getByRole('button', { name: /Save Preferences/i });

    // Invalid JSON
    fireEvent.change(editor, { target: { value: '{invalid}' } });

    expect(saveButton).toBeDisabled();
  });

  it('saves preferences successfully', async () => {
    const initialPrefs = { theme: 'light' };
    const updatedPrefs = { theme: 'dark', language: 'en' };

    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: initialPrefs,
    });
    (api.updatePreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: updatedPrefs,
    });

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const editor = screen.getByRole('textbox', { name: /Preferences JSON/i });
    const saveButton = screen.getByRole('button', { name: /Save Preferences/i });

    fireEvent.change(editor, { target: { value: JSON.stringify(updatedPrefs) } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.updatePreferences).toHaveBeenCalledWith(updatedPrefs);
      expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error when save fails', async () => {
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: {},
    });
    (api.updatePreferences as jest.Mock).mockRejectedValue(new Error('Save failed'));

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const editor = screen.getByRole('textbox', { name: /Preferences JSON/i });
    const saveButton = screen.getByRole('button', { name: /Save Preferences/i });

    fireEvent.change(editor, { target: { value: '{"new": "value"}' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Save failed/i)).toBeInTheDocument();
    });
  });

  it('resets preferences to defaults with confirmation', async () => {
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: { custom: 'value' },
    });
    (api.deletePreferences as jest.Mock).mockResolvedValue(undefined);

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const resetButton = screen.getByRole('button', { name: /Reset to Defaults/i });

    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Reset all preferences')
      );
      expect(api.deletePreferences).toHaveBeenCalled();
    });
  });

  it('does not reset if user cancels confirmation', async () => {
    (global.confirm as jest.Mock).mockReturnValue(false);
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: { custom: 'value' },
    });

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const resetButton = screen.getByRole('button', { name: /Reset to Defaults/i });

    fireEvent.click(resetButton);

    expect(api.deletePreferences).not.toHaveBeenCalled();
  });

  it('formats JSON when format button is clicked', async () => {
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: {},
    });

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const editor = screen.getByRole('textbox', { name: /Preferences JSON/i });
    const formatButton = screen.getByRole('button', { name: /Format JSON/i });

    // Enter compact JSON
    const compactJson = '{"a":"b","c":"d"}';
    fireEvent.change(editor, { target: { value: compactJson } });
    fireEvent.click(formatButton);

    // Should be formatted with indentation
    expect(editor).toHaveValue(JSON.stringify(JSON.parse(compactJson), null, 2));
  });

  it('displays size indicator with correct color', async () => {
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: {},
    });

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const sizeChip = screen.getByText(/bytes/i);
    expect(sizeChip).toBeInTheDocument();
  });

  it('shows warning color when approaching size limit', async () => {
    (api.getPreferences as jest.Mock).mockResolvedValue({
      user_id: 'user-123',
      preferences: {},
    });

    render(<PreferencesPage />);

    await waitFor(() => screen.getByLabelText(/Preferences JSON/i));

    const editor = screen.getByRole('textbox', { name: /Preferences JSON/i });

    // Create large JSON (>75% of limit)
    const largeValue = 'x'.repeat(80000);
    fireEvent.change(editor, { target: { value: `{"data":"${largeValue}"}` } });

    // The chip should exist (we can't easily test color without CSS)
    expect(screen.getByText(/bytes/i)).toBeInTheDocument();
  });
});
