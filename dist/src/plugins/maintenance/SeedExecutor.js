import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Seed Executor Component
 *
 * Executes seed scripts and displays real-time output via SSE.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import { useEffect, useRef, useState } from 'react';
export const SeedExecutor = ({ apiPrefix, seedName, onComplete, onCancel, }) => {
    const [status, setStatus] = useState('idle');
    const [output, setOutput] = useState([]);
    const [exitCode, setExitCode] = useState(null);
    const outputRef = useRef(null);
    const eventSourceRef = useRef(null);
    useEffect(() => {
        executeScript();
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [seedName]);
    useEffect(() => {
        // Auto-scroll to bottom
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);
    const executeScript = async () => {
        try {
            setStatus('running');
            setOutput([]);
            setExitCode(null);
            const response = await fetch(`${apiPrefix}/seeds/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: seedName }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Execution failed');
            }
            // Set up EventSource for SSE
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) {
                throw new Error('No response body');
            }
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        try {
                            const event = JSON.parse(data);
                            setOutput((prev) => [...prev, event]);
                            if (event.type === 'exit') {
                                const exitData = JSON.parse(event.data);
                                setExitCode(exitData.exitCode);
                                setStatus(exitData.exitCode === 0 ? 'completed' : 'failed');
                            }
                        }
                        catch (e) {
                            console.error('Failed to parse SSE event:', e);
                        }
                    }
                }
            }
        }
        catch (err) {
            setStatus('failed');
            setOutput((prev) => [
                ...prev,
                {
                    type: 'error',
                    data: err instanceof Error ? err.message : String(err),
                    timestamp: new Date().toISOString(),
                },
            ]);
        }
    };
    const getStatusColor = () => {
        switch (status) {
            case 'running':
                return '#1976d2';
            case 'completed':
                return '#2e7d32';
            case 'failed':
                return '#d32f2f';
            default:
                return '#666';
        }
    };
    const getStatusText = () => {
        switch (status) {
            case 'running':
                return 'Running...';
            case 'completed':
                return `Completed (exit code: ${exitCode})`;
            case 'failed':
                return `Failed (exit code: ${exitCode})`;
            default:
                return 'Idle';
        }
    };
    return (_jsxs("div", { style: { padding: '20px' }, children: [_jsxs("div", { style: { marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("h3", { children: ["Executing: ", seedName] }), _jsxs("div", { children: [_jsx("span", { style: {
                                    padding: '6px 12px',
                                    backgroundColor: getStatusColor(),
                                    color: 'white',
                                    borderRadius: '4px',
                                    marginRight: '12px',
                                    fontSize: '14px',
                                }, "data-testid": "execution-status", children: getStatusText() }), status !== 'running' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: onComplete, style: {
                                            padding: '6px 12px',
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginRight: '8px',
                                        }, children: "View History" }), _jsx("button", { onClick: onCancel, style: {
                                            padding: '6px 12px',
                                            backgroundColor: '#f5f5f5',
                                            color: 'black',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }, children: "Back to List" })] }))] })] }), _jsxs("div", { ref: outputRef, "data-testid": "seed-output", style: {
                    backgroundColor: '#1e1e1e',
                    color: '#d4d4d4',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    padding: '16px',
                    borderRadius: '4px',
                    height: '500px',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                }, children: [output.length === 0 && status === 'running' && (_jsx("div", { style: { color: '#888' }, children: "Waiting for output..." })), output.map((line, index) => (_jsx("div", { style: {
                            color: line.type === 'stderr' ? '#f48771' : line.type === 'error' ? '#ff5555' : '#d4d4d4',
                            marginBottom: '2px',
                        }, children: line.data }, index)))] })] }));
};
export default SeedExecutor;
//# sourceMappingURL=SeedExecutor.js.map