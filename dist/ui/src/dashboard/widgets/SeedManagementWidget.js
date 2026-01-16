import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Seed Management Widget
 *
 * Displays available seed scripts and allows executing them.
 * Part of the maintenance plugin.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, List, ListItem, ListItemText, CircularProgress, Alert, Box, } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
export function SeedManagementWidget() {
    const [seeds, setSeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [executing, setExecuting] = useState(null);
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch seeds');
        }
        finally {
            setLoading(false);
        }
    };
    const executeSeed = async (seedName) => {
        setExecuting(seedName);
        try {
            // TODO: Add proper API endpoint for seed execution
            // await api.post(`/maintenance/seeds/execute`, { name: seedName });
            alert(`Seed ${seedName} executed successfully`);
        }
        catch (err) {
            alert(`Failed to execute seed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
        finally {
            setExecuting(null);
        }
    };
    if (loading) {
        return (_jsx(Card, { children: _jsx(CardContent, { children: _jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 2 }, children: _jsx(CircularProgress, { size: 24 }) }) }) }));
    }
    return (_jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Seed Management" }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 2 }, children: "Manage and execute seed scripts" }), error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error })), seeds.length === 0 ? (_jsx(Alert, { severity: "info", children: "No seed scripts found" })) : (_jsx(List, { children: seeds.map((seed) => (_jsx(ListItem, { secondaryAction: _jsx(Button, { variant: "contained", size: "small", startIcon: executing === seed.name ? _jsx(CircularProgress, { size: 16 }) : _jsx(PlayArrowIcon, {}), onClick: () => executeSeed(seed.name), disabled: executing !== null, children: "Execute" }), children: _jsx(ListItemText, { primary: seed.name, secondary: `Modified: ${new Date(seed.modifiedAt).toLocaleDateString()}` }) }, seed.name))) }))] }) }));
}
//# sourceMappingURL=SeedManagementWidget.js.map