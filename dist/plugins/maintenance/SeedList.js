import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Seed List Component
 *
 * Displays available seed scripts with metadata.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useState } from 'react';
export const SeedList = ({ apiPrefix, onExecute }) => {
    const [seeds, setSeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetchSeeds();
    }, [apiPrefix]);
    const fetchSeeds = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${apiPrefix}/seeds/discover`);
            if (!response.ok)
                throw new Error('Failed to fetch seeds');
            const data = await response.json();
            setSeeds(data.seeds || []);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
        finally {
            setLoading(false);
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    if (loading) {
        return _jsx("div", { style: { padding: '20px' }, children: "Loading seeds..." });
    }
    if (error) {
        return (_jsxs("div", { style: { padding: '20px', color: '#d32f2f' }, children: ["Error: ", error] }));
    }
    if (seeds.length === 0) {
        return (_jsx("div", { style: { padding: '20px', color: '#666' }, children: "No seed scripts found in scripts directory." }));
    }
    return (_jsxs("div", { style: { padding: '20px' }, children: [_jsxs("h3", { children: ["Available Seed Scripts (", seeds.length, ")"] }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { borderBottom: '2px solid #ddd', textAlign: 'left' }, children: [_jsx("th", { style: { padding: '12px' }, children: "Name" }), _jsx("th", { style: { padding: '12px' }, children: "Size" }), _jsx("th", { style: { padding: '12px' }, children: "Modified" }), _jsx("th", { style: { padding: '12px' }, children: "Action" })] }) }), _jsx("tbody", { children: seeds.map((seed) => (_jsxs("tr", { style: { borderBottom: '1px solid #eee' }, children: [_jsx("td", { style: { padding: '12px', fontFamily: 'monospace' }, children: seed.name }), _jsx("td", { style: { padding: '12px' }, children: formatFileSize(seed.size) }), _jsx("td", { style: { padding: '12px', fontSize: '14px', color: '#666' }, children: formatDate(seed.modifiedAt) }), _jsx("td", { style: { padding: '12px' }, children: _jsx("button", { onClick: () => {
                                            if (confirm(`Execute ${seed.name}?`)) {
                                                onExecute(seed.name);
                                            }
                                        }, style: {
                                            padding: '6px 12px',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }, "data-testid": `execute-${seed.name}`, children: "Execute" }) })] }, seed.name))) })] })] }));
};
export default SeedList;
//# sourceMappingURL=SeedList.js.map