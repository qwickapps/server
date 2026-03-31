/**
 * Database Operations Widget Component
 * Displays database status and provides manual initialization/recreation controls
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';

export interface DatabaseOperationsWidgetProps {
  // No props needed - will use default values
}

interface DatabaseStatus {
  status: 'healthy' | 'error' | 'unknown';
  connected: boolean;
  database?: string;
  user?: string;
  host?: string;
  port?: number;
  managed?: boolean;
  errorMessage?: string;
  autoInitializeEnabled: boolean;
  adminCredentialsProvided: boolean;
}

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  requiredInput: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  requiredInput,
  onConfirm,
  onCancel,
}) => {
  const [inputValue, setInputValue] = useState('');
  const isValid = inputValue === requiredInput;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {message}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Type "{requiredInput}" to confirm:
        </Typography>
        <TextField
          autoFocus
          fullWidth
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={requiredInput}
          sx={{ fontFamily: 'monospace' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => {
            if (isValid) {
              onConfirm();
              setInputValue('');
            }
          }}
          disabled={!isValid}
          variant="contained"
          color="error"
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface AdminCredentialsDialogProps {
  open: boolean;
  onSubmit: (credentials: { adminUser: string; adminPassword: string }) => void;
  onCancel: () => void;
}

const AdminCredentialsDialog: React.FC<AdminCredentialsDialogProps> = ({
  open,
  onSubmit,
  onCancel,
}) => {
  const [adminUser, setAdminUser] = useState('postgres');
  const [adminPassword, setAdminPassword] = useState('');

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Admin Credentials Required</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Provide PostgreSQL admin credentials to perform this operation:
        </Typography>
        <TextField
          fullWidth
          label="Admin User"
          value={adminUser}
          onChange={(e) => setAdminUser(e.target.value)}
          sx={{ mb: 2 }}
          placeholder="postgres"
        />
        <TextField
          fullWidth
          type="password"
          label="Admin Password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          placeholder="Enter admin password"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => {
            if (adminUser && adminPassword) {
              onSubmit({ adminUser, adminPassword });
              setAdminUser('postgres');
              setAdminPassword('');
            }
          }}
          disabled={!adminUser || !adminPassword}
          variant="contained"
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const DatabaseOperationsWidget: React.FC<DatabaseOperationsWidgetProps> = () => {
  // Use default values since props cannot be passed through WidgetContribution
  // QwickApps Server plugin routes are at /qapi/* when integrated with Next.js apps
  const apiPrefix = '/qapi/postgres:default';
  const instanceName = 'default';
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operating, setOperating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmOperation, setConfirmOperation] = useState<'initialize' | 'recreate'>('initialize');
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{
    adminUser: string;
    adminPassword: string;
  } | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${apiPrefix}/status?instance=${instanceName}`);
      if (!response.ok) throw new Error('Failed to fetch database status');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [apiPrefix, instanceName]);

  const handleInitialize = async (creds?: { adminUser: string; adminPassword: string }) => {
    setOperating(true);
    try {
      const response = await fetch(`${apiPrefix}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instance: instanceName,
          ...creds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to initialize database');
      }

      await fetchStatus();
      alert('Database initialized successfully');
    } catch (err) {
      alert(`Initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setOperating(false);
      setShowConfirmDialog(false);
      setShowAdminDialog(false);
      setAdminCredentials(null);
    }
  };

  const handleRecreate = async (creds?: { adminUser: string; adminPassword: string }) => {
    setOperating(true);
    try {
      const response = await fetch(`${apiPrefix}/recreate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instance: instanceName,
          ...creds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to recreate database');
      }

      await fetchStatus();
      alert('Database recreated successfully');
    } catch (err) {
      alert(`Recreation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setOperating(false);
      setShowConfirmDialog(false);
      setShowAdminDialog(false);
      setAdminCredentials(null);
    }
  };

  const startOperation = (operation: 'initialize' | 'recreate') => {
    setConfirmOperation(operation);

    if (!status?.adminCredentialsProvided) {
      setShowAdminDialog(true);
    } else if (operation === 'recreate') {
      setShowConfirmDialog(true);
    } else {
      handleInitialize();
    }
  };

  const handleAdminCredentialsSubmit = (creds: { adminUser: string; adminPassword: string }) => {
    setAdminCredentials(creds);
    setShowAdminDialog(false);

    if (confirmOperation === 'recreate') {
      setShowConfirmDialog(true);
    } else {
      handleInitialize(creds);
    }
  };

  const handleConfirmDialogConfirm = () => {
    if (confirmOperation === 'recreate') {
      handleRecreate(adminCredentials || undefined);
    } else {
      handleInitialize(adminCredentials || undefined);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading database status...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Database ({instanceName})
          </Typography>
          <Alert severity="error">{error || 'Failed to load database status'}</Alert>
        </CardContent>
      </Card>
    );
  }

  const requiredInput = status.database
    ? `RECREATE ${status.database.toUpperCase()} DATABASE`
    : 'RECREATE DATABASE';

  const statusColor = status.connected ? 'success' : 'error';
  const statusLabel = status.connected ? 'CONNECTED' : 'ERROR';

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Database ({instanceName})</Typography>
            <Chip label={statusLabel} color={statusColor} size="small" />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {operating
              ? 'Processing database operation...'
              : status.connected
              ? `Connected to ${status.database}`
              : status.errorMessage || 'Database connection error'}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Connection
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {statusLabel}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Database
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {status.database || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Host
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {status.host || 'N/A'}:{status.port || 'N/A'}
            </Typography>
          </Box>

          {status.managed && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Managed database (Neon / Supabase). Delete and recreate is disabled — manage your database through the provider dashboard.
            </Alert>
          )}

          {!status.connected && !operating && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => startOperation('initialize')}
                size="small"
              >
                Initialize Database
              </Button>
              {!status.managed && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => startOperation('recreate')}
                  size="small"
                >
                  Recreate Database
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      <AdminCredentialsDialog
        open={showAdminDialog}
        onSubmit={handleAdminCredentialsSubmit}
        onCancel={() => {
          setShowAdminDialog(false);
          setAdminCredentials(null);
        }}
      />

      <ConfirmationDialog
        open={showConfirmDialog}
        title="Confirm Database Recreation"
        message={`This will drop and recreate the database "${status.database}". All data will be lost. This action cannot be undone.`}
        confirmText="Recreate"
        requiredInput={requiredInput}
        onConfirm={handleConfirmDialogConfirm}
        onCancel={() => {
          setShowConfirmDialog(false);
          setAdminCredentials(null);
        }}
      />
    </>
  );
};

export default DatabaseOperationsWidget;
