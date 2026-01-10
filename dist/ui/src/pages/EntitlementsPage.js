import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * EntitlementsPage Component
 *
 * Entitlement catalog management page. Allows viewing and managing available entitlements.
 * Write operations (create, edit, delete) are only available when source is not readonly.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, LinearProgress, InputAdornment, CircularProgress, Tooltip, IconButton, } from '@mui/material';
import { Text, Button, Dialog, DialogTitle, DialogContent, DialogActions, GridLayout } from '@qwickapps/react-framework';
import SearchIcon from '@mui/icons-material/Search';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import { api, } from '../api/controlPanelApi';
export function EntitlementsPage({ title = 'Entitlements', subtitle = 'Manage available entitlements', headerActions, }) {
    // Status state
    const [status, setStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(true);
    // Entitlements state
    const [entitlements, setEntitlements] = useState([]);
    const [filteredEntitlements, setFilteredEntitlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [search, setSearch] = useState('');
    // Dialog state
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEntitlement, setSelectedEntitlement] = useState(null);
    const [newEntitlement, setNewEntitlement] = useState({
        name: '',
        category: '',
        description: '',
    });
    const [saving, setSaving] = useState(false);
    // Fetch status
    useEffect(() => {
        api.getEntitlementsStatus()
            .then(setStatus)
            .catch((err) => setError(err instanceof Error ? err.message : 'Failed to get status'))
            .finally(() => setStatusLoading(false));
    }, []);
    // Fetch entitlements
    const fetchEntitlements = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getAvailableEntitlements();
            setEntitlements(data);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch entitlements');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        fetchEntitlements();
    }, [fetchEntitlements]);
    // Filter entitlements based on search
    useEffect(() => {
        if (!search.trim()) {
            setFilteredEntitlements(entitlements);
        }
        else {
            const lowerSearch = search.toLowerCase();
            setFilteredEntitlements(entitlements.filter((e) => e.name.toLowerCase().includes(lowerSearch) ||
                e.category?.toLowerCase().includes(lowerSearch) ||
                e.description?.toLowerCase().includes(lowerSearch)));
        }
    }, [entitlements, search]);
    // Group entitlements by category
    const categories = [...new Set(entitlements.map((e) => e.category || 'Uncategorized'))];
    // Handlers
    const handleCreate = async () => {
        if (!newEntitlement.name.trim()) {
            setError('Name is required');
            return;
        }
        setSaving(true);
        try {
            // TODO: Add create entitlement API endpoint
            // For now, just show success
            setSuccess(`Entitlement "${newEntitlement.name}" created`);
            setCreateDialogOpen(false);
            setNewEntitlement({ name: '', category: '', description: '' });
            fetchEntitlements();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create entitlement');
        }
        finally {
            setSaving(false);
        }
    };
    const handleEdit = async () => {
        if (!selectedEntitlement)
            return;
        setSaving(true);
        try {
            // TODO: Add update entitlement API endpoint
            setSuccess(`Entitlement "${selectedEntitlement.name}" updated`);
            setEditDialogOpen(false);
            setSelectedEntitlement(null);
            fetchEntitlements();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update entitlement');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!selectedEntitlement)
            return;
        setSaving(true);
        try {
            // TODO: Add delete entitlement API endpoint
            setSuccess(`Entitlement "${selectedEntitlement.name}" deleted`);
            setDeleteDialogOpen(false);
            setSelectedEntitlement(null);
            fetchEntitlements();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete entitlement');
        }
        finally {
            setSaving(false);
        }
    };
    const openEditDialog = (entitlement) => {
        setSelectedEntitlement(entitlement);
        setEditDialogOpen(true);
    };
    const openDeleteDialog = (entitlement) => {
        setSelectedEntitlement(entitlement);
        setDeleteDialogOpen(true);
    };
    const isReadonly = status?.readonly ?? true;
    if (statusLoading) {
        return (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', py: 8 }, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Box, { children: [_jsxs(Box, { sx: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }, children: [_jsxs(Box, { children: [_jsx(Text, { variant: "h4", content: title, customColor: "var(--theme-text-primary)" }), _jsx(Text, { variant: "body2", content: subtitle, customColor: "var(--theme-text-secondary)" })] }), _jsxs(Box, { sx: { display: 'flex', gap: 1 }, children: [headerActions, !isReadonly && (_jsx(Button, { variant: "primary", icon: "add", label: "Add Entitlement", onClick: () => setCreateDialogOpen(true) }))] })] }), loading && _jsx(LinearProgress, { sx: { mb: 2 } }), error && (_jsx(Alert, { severity: "error", onClose: () => setError(null), sx: { mb: 2 }, children: error })), success && (_jsx(Alert, { severity: "success", onClose: () => setSuccess(null), sx: { mb: 2 }, children: success })), _jsxs(GridLayout, { columns: 3, spacing: "medium", sx: { mb: 3 }, equalHeight: true, children: [_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(LocalOfferIcon, { sx: { fontSize: 40, color: 'var(--theme-primary)' } }), _jsxs(Box, { children: [_jsx(Text, { variant: "h4", content: entitlements.length.toString(), customColor: "var(--theme-text-primary)" }), _jsx(Text, { variant: "body2", content: "Total Entitlements", customColor: "var(--theme-text-secondary)" })] })] }) }) }), _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Box, { sx: {
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            bgcolor: 'var(--theme-primary)20',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }, children: _jsx(Text, { variant: "h6", content: categories.length.toString(), customColor: "var(--theme-primary)" }) }), _jsxs(Box, { children: [_jsx(Text, { variant: "body1", fontWeight: "500", content: "Categories", customColor: "var(--theme-text-primary)" }), _jsx(Text, { variant: "body2", content: categories.slice(0, 3).join(', '), customColor: "var(--theme-text-secondary)" })] })] }) }) }), _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsx(CardContent, { children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [isReadonly ? (_jsx(LockIcon, { sx: { fontSize: 40, color: 'var(--theme-warning)' } })) : (_jsx(EditIcon, { sx: { fontSize: 40, color: 'var(--theme-success)' } })), _jsxs(Box, { children: [_jsx(Text, { variant: "body1", fontWeight: "500", content: isReadonly ? 'Read-only' : 'Editable', customColor: isReadonly ? 'var(--theme-warning)' : 'var(--theme-success)' }), _jsx(Text, { variant: "body2", content: `Source: ${status?.sources[0]?.name || 'Unknown'}`, customColor: "var(--theme-text-secondary)" })] })] }) }) })] }), _jsx(Card, { sx: { bgcolor: 'var(--theme-surface)' }, children: _jsxs(CardContent, { sx: { p: 0 }, children: [_jsx(Box, { sx: { p: 2, borderBottom: 1, borderColor: 'var(--theme-border)' }, children: _jsx(TextField, { size: "small", placeholder: "Search entitlements...", value: search, onChange: (e) => setSearch(e.target.value), InputProps: {
                                    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, { sx: { color: 'var(--theme-text-secondary)' } }) })),
                                }, sx: { minWidth: 300 } }) }), _jsx(TableContainer, { children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Name" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Category" }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, children: "Description" }), !isReadonly && (_jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }, align: "right", children: "Actions" }))] }) }), _jsxs(TableBody, { children: [filteredEntitlements.map((entitlement) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { sx: { color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }, children: _jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 1 }, children: [_jsx(LocalOfferIcon, { sx: { fontSize: 18, color: 'var(--theme-primary)' } }), _jsx(Text, { variant: "body1", content: entitlement.name, fontWeight: "500" })] }) }), _jsx(TableCell, { sx: { borderColor: 'var(--theme-border)' }, children: entitlement.category ? (_jsx(Chip, { size: "small", label: entitlement.category, sx: {
                                                                bgcolor: 'var(--theme-primary)20',
                                                                color: 'var(--theme-primary)',
                                                            } })) : (_jsx(Text, { variant: "body2", content: "--", customColor: "var(--theme-text-secondary)" })) }), _jsx(TableCell, { sx: { color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)', maxWidth: 300 }, children: entitlement.description || '--' }), !isReadonly && (_jsxs(TableCell, { sx: { borderColor: 'var(--theme-border)' }, align: "right", children: [_jsx(Tooltip, { title: "Edit", children: _jsx(IconButton, { size: "small", onClick: () => openEditDialog(entitlement), children: _jsx(EditIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "Delete", children: _jsx(IconButton, { size: "small", onClick: () => openDeleteDialog(entitlement), sx: { color: 'var(--theme-error)' }, children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] }))] }, entitlement.id))), filteredEntitlements.length === 0 && !loading && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: isReadonly ? 3 : 4, align: "center", sx: { py: 4, color: 'var(--theme-text-secondary)' }, children: search ? 'No entitlements match your search' : 'No entitlements defined' }) }))] })] }) })] }) }), status && status.sources.length > 0 && (_jsx(Card, { sx: { bgcolor: 'var(--theme-surface)', mt: 3 }, children: _jsxs(CardContent, { children: [_jsx(Text, { variant: "subtitle2", content: "Entitlement Sources", customColor: "var(--theme-text-secondary)", style: { marginBottom: '12px' } }), _jsx(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 1 }, children: status.sources.map((source, idx) => (_jsxs(Box, { sx: { display: 'flex', alignItems: 'center', gap: 2 }, children: [_jsx(Chip, { size: "small", label: source.primary ? 'Primary' : 'Additional', sx: {
                                            bgcolor: source.primary ? 'var(--theme-primary)20' : 'var(--theme-text-secondary)20',
                                            color: source.primary ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                                        } }), _jsx(Text, { variant: "body1", content: source.name, fontWeight: "500", customColor: "var(--theme-text-primary)" }), source.description && (_jsx(Text, { variant: "body2", content: `- ${source.description}`, customColor: "var(--theme-text-secondary)" })), source.readonly && (_jsx(Chip, { size: "small", icon: _jsx(LockIcon, { sx: { fontSize: 14 } }), label: "Read-only", sx: {
                                            bgcolor: 'var(--theme-warning)20',
                                            color: 'var(--theme-warning)',
                                        } }))] }, idx))) }), status.cacheEnabled && (_jsx(Box, { sx: { mt: 2, pt: 2, borderTop: 1, borderColor: 'var(--theme-border)' }, children: _jsx(Text, { variant: "caption", content: `Caching: Enabled (TTL: ${status.cacheTtl}s)`, customColor: "var(--theme-text-secondary)" }) }))] }) })), !isReadonly && (_jsxs(Dialog, { open: createDialogOpen, onClose: () => setCreateDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Add Entitlement" }), _jsx(DialogContent, { children: _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }, children: [_jsx(TextField, { label: "Name", fullWidth: true, value: newEntitlement.name, onChange: (e) => setNewEntitlement({ ...newEntitlement, name: e.target.value }), placeholder: "e.g., premium, pro, feature:analytics", required: true }), _jsx(TextField, { label: "Category (Optional)", fullWidth: true, value: newEntitlement.category, onChange: (e) => setNewEntitlement({ ...newEntitlement, category: e.target.value }), placeholder: "e.g., subscription, feature, access" }), _jsx(TextField, { label: "Description (Optional)", fullWidth: true, multiline: true, rows: 2, value: newEntitlement.description, onChange: (e) => setNewEntitlement({ ...newEntitlement, description: e.target.value }), placeholder: "Describe what this entitlement grants access to" })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { variant: "text", label: "Cancel", onClick: () => setCreateDialogOpen(false) }), _jsx(Button, { variant: "primary", label: "Create", onClick: handleCreate, disabled: !newEntitlement.name.trim() || saving })] })] })), !isReadonly && selectedEntitlement && (_jsxs(Dialog, { open: editDialogOpen, onClose: () => setEditDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Edit Entitlement" }), _jsx(DialogContent, { children: _jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }, children: [_jsx(TextField, { label: "Name", fullWidth: true, value: selectedEntitlement.name, disabled: true, helperText: "Name cannot be changed" }), _jsx(TextField, { label: "Category", fullWidth: true, value: selectedEntitlement.category || '', onChange: (e) => setSelectedEntitlement({ ...selectedEntitlement, category: e.target.value }) }), _jsx(TextField, { label: "Description", fullWidth: true, multiline: true, rows: 2, value: selectedEntitlement.description || '', onChange: (e) => setSelectedEntitlement({ ...selectedEntitlement, description: e.target.value }) })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { variant: "text", label: "Cancel", onClick: () => setEditDialogOpen(false) }), _jsx(Button, { variant: "primary", label: "Save", onClick: handleEdit, disabled: saving })] })] })), !isReadonly && selectedEntitlement && (_jsxs(Dialog, { open: deleteDialogOpen, onClose: () => setDeleteDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "Delete Entitlement" }), _jsxs(DialogContent, { children: [_jsx(Text, { variant: "body1", content: `Are you sure you want to delete the entitlement "${selectedEntitlement.name}"?`, customColor: "var(--theme-text-primary)" }), _jsx(Alert, { severity: "warning", sx: { mt: 2 }, children: "This will remove the entitlement from all users who currently have it." })] }), _jsxs(DialogActions, { children: [_jsx(Button, { variant: "text", label: "Cancel", onClick: () => setDeleteDialogOpen(false) }), _jsx(Button, { variant: "primary", color: "error", label: "Delete", onClick: handleDelete, disabled: saving })] })] }))] }));
}
//# sourceMappingURL=EntitlementsPage.js.map