import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Seed History Component
 *
 * Displays execution history with filtering and pagination.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
export const SeedHistory = ({ apiPrefix }) => {
    const [executions, setExecutions] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [offset, setOffset] = useState(0);
    const [selectedExecution, setSelectedExecution] = useState(null);
    const [executionDetails, setExecutionDetails] = useState(null);
    const limit = 20;
    useEffect(() => {
        fetchHistory();
    }, [apiPrefix, statusFilter, searchQuery, offset]);
    const fetchHistory = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: offset.toString(),
            });
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            const response = await fetch(`${apiPrefix}/seeds/history?${params}`);
            if (!response.ok)
                throw new Error('Failed to fetch history');
            const data = await response.json();
            setExecutions(data.executions || []);
            setTotal(data.total || 0);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchExecutionDetails = async (id) => {
        try {
            const response = await fetch(`${apiPrefix}/seeds/history/${id}`);
            if (!response.ok)
                throw new Error('Failed to fetch execution details');
            const data = await response.json();
            setExecutionDetails(data.execution);
        }
        catch (err) {
            console.error('Failed to fetch execution details:', err);
        }
    };
    const formatDuration = (ms) => {
        if (ms === null)
            return '-';
        if (ms < 1000)
            return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };
    const formatDateTime = (dateString) => {
        if (!dateString)
            return '-';
        return new Date(dateString).toLocaleString();
    };
    const getStatusBadge = (status) => {
        const colors = {
            running: '#1976d2',
            completed: '#2e7d32',
            failed: '#d32f2f',
        };
        return (_jsx("span", { style: {
                padding: '4px 8px',
                backgroundColor: colors[status] || '#666',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
            }, children: status.toUpperCase() }));
    };
    if (loading && executions.length === 0) {
        return _jsx("div", { style: { padding: '20px' }, children: "Loading history..." });
    }
    if (error) {
        return (_jsxs("div", { style: { padding: '20px', color: '#d32f2f' }, children: ["Error: ", error] }));
    }
    return (_jsxs("div", { style: { padding: '20px' }, children: [_jsxs("div", { style: { marginBottom: '20px', display: 'flex', gap: '12px' }, children: [_jsxs("select", { value: statusFilter, onChange: (e) => {
                            setStatusFilter(e.target.value);
                            setOffset(0);
                        }, style: {
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                        }, children: [_jsx("option", { value: "all", children: "All Status" }), _jsx("option", { value: "running", children: "Running" }), _jsx("option", { value: "completed", children: "Completed" }), _jsx("option", { value: "failed", children: "Failed" })] }), _jsx("input", { type: "text", placeholder: "Search by name...", value: searchQuery, onChange: (e) => {
                            setSearchQuery(e.target.value);
                            setOffset(0);
                        }, style: {
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            flex: 1,
                        } })] }), _jsxs("h3", { children: ["Execution History (", total, " total)"] }), executions.length === 0 ? (_jsx("div", { style: { padding: '20px', color: '#666' }, children: "No executions found." })) : (_jsxs(_Fragment, { children: [_jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { borderBottom: '2px solid #ddd', textAlign: 'left' }, children: [_jsx("th", { style: { padding: '12px' }, children: "Name" }), _jsx("th", { style: { padding: '12px' }, children: "Status" }), _jsx("th", { style: { padding: '12px' }, children: "Started" }), _jsx("th", { style: { padding: '12px' }, children: "Duration" }), _jsx("th", { style: { padding: '12px' }, children: "Exit Code" }), _jsx("th", { style: { padding: '12px' }, children: "Action" })] }) }), _jsx("tbody", { children: executions.map((execution) => (_jsxs("tr", { style: { borderBottom: '1px solid #eee' }, children: [_jsx("td", { style: { padding: '12px', fontFamily: 'monospace' }, children: execution.name }), _jsx("td", { style: { padding: '12px' }, children: getStatusBadge(execution.status) }), _jsx("td", { style: { padding: '12px', fontSize: '14px' }, children: formatDateTime(execution.started_at) }), _jsx("td", { style: { padding: '12px' }, children: formatDuration(execution.duration_ms) }), _jsx("td", { style: { padding: '12px', textAlign: 'center' }, children: execution.exit_code !== null ? execution.exit_code : '-' }), _jsx("td", { style: { padding: '12px' }, children: _jsx("button", { onClick: () => {
                                                    setSelectedExecution(execution);
                                                    fetchExecutionDetails(execution.id);
                                                }, style: {
                                                    padding: '4px 8px',
                                                    backgroundColor: '#1976d2',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                }, children: "View Details" }) })] }, execution.id))) })] }), _jsxs("div", { style: { marginTop: '20px', display: 'flex', justifyContent: 'space-between' }, children: [_jsx("button", { onClick: () => setOffset(Math.max(0, offset - limit)), disabled: offset === 0, style: {
                                    padding: '8px 16px',
                                    backgroundColor: offset === 0 ? '#f5f5f5' : '#1976d2',
                                    color: offset === 0 ? '#999' : 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: offset === 0 ? 'not-allowed' : 'pointer',
                                }, children: "Previous" }), _jsxs("span", { style: { padding: '8px' }, children: ["Showing ", offset + 1, "-", Math.min(offset + limit, total), " of ", total] }), _jsx("button", { onClick: () => setOffset(offset + limit), disabled: offset + limit >= total, style: {
                                    padding: '8px 16px',
                                    backgroundColor: offset + limit >= total ? '#f5f5f5' : '#1976d2',
                                    color: offset + limit >= total ? '#999' : 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: offset + limit >= total ? 'not-allowed' : 'pointer',
                                }, children: "Next" })] })] })), selectedExecution && executionDetails && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                }, onClick: () => setSelectedExecution(null), children: _jsxs("div", { style: {
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '8px',
                        maxWidth: '800px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        width: '90%',
                    }, onClick: (e) => e.stopPropagation(), children: [_jsxs("h3", { children: ["Execution Details: ", selectedExecution.name] }), _jsxs("div", { style: { marginTop: '16px' }, children: [_jsxs("p", { children: [_jsx("strong", { children: "Status:" }), " ", getStatusBadge(selectedExecution.status)] }), _jsxs("p", { children: [_jsx("strong", { children: "Started:" }), " ", formatDateTime(selectedExecution.started_at)] }), _jsxs("p", { children: [_jsx("strong", { children: "Completed:" }), " ", formatDateTime(selectedExecution.completed_at)] }), _jsxs("p", { children: [_jsx("strong", { children: "Duration:" }), " ", formatDuration(selectedExecution.duration_ms)] }), _jsxs("p", { children: [_jsx("strong", { children: "Exit Code:" }), " ", selectedExecution.exit_code !== null ? selectedExecution.exit_code : '-'] }), executionDetails.output && (_jsxs(_Fragment, { children: [_jsx("h4", { style: { marginTop: '20px' }, children: "Output:" }), _jsx("pre", { style: {
                                                backgroundColor: '#1e1e1e',
                                                color: '#d4d4d4',
                                                padding: '12px',
                                                borderRadius: '4px',
                                                overflow: 'auto',
                                                maxHeight: '300px',
                                                fontSize: '12px',
                                            }, children: executionDetails.output })] })), executionDetails.error && (_jsxs(_Fragment, { children: [_jsx("h4", { style: { marginTop: '20px', color: '#d32f2f' }, children: "Error:" }), _jsx("pre", { style: {
                                                backgroundColor: '#ffebee',
                                                color: '#c62828',
                                                padding: '12px',
                                                borderRadius: '4px',
                                                overflow: 'auto',
                                                maxHeight: '200px',
                                                fontSize: '12px',
                                            }, children: executionDetails.error })] }))] }), _jsx("button", { onClick: () => setSelectedExecution(null), style: {
                                marginTop: '20px',
                                padding: '8px 16px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }, children: "Close" })] }) }))] }));
};
export default SeedHistory;
//# sourceMappingURL=SeedHistory.js.map