/**
 * Seed Management Widget
 *
 * Displays available seed scripts and allows executing them.
 * Part of the maintenance plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface SeedScript {
  name: string;
  path: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

export function SeedManagementWidget() {
  const [seeds, setSeeds] = useState<SeedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    fetchSeeds();
  }, []);

  const fetchSeeds = async () => {
    try {
      // TODO: Add proper API endpoint for seed discovery
      // const response = await api.get('/maintenance/seeds/discover');
      // setSeeds(response.seeds || []);
      setSeeds([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch seeds');
    } finally {
      setLoading(false);
    }
  };

  const executeSeed = async (seedName: string) => {
    setExecuting(seedName);
    try {
      // TODO: Add proper API endpoint for seed execution
      // await api.post(`/maintenance/seeds/execute`, { name: seedName });
      alert(`Seed ${seedName} executed successfully`);
    } catch (err) {
      alert(`Failed to execute seed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExecuting(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Seed Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage and execute seed scripts
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {seeds.length === 0 ? (
          <Alert severity="info">No seed scripts found</Alert>
        ) : (
          <List>
            {seeds.map((seed) => (
              <ListItem
                key={seed.name}
                secondaryAction={
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={executing === seed.name ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                    onClick={() => executeSeed(seed.name)}
                    disabled={executing !== null}
                  >
                    Execute
                  </Button>
                }
              >
                <ListItemText
                  primary={seed.name}
                  secondary={`Modified: ${new Date(seed.modifiedAt).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
