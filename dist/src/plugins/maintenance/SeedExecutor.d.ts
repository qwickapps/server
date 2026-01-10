/**
 * Seed Executor Component
 *
 * Executes seed scripts and displays real-time output via SSE.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import React from 'react';
export interface SeedExecutorProps {
    apiPrefix: string;
    seedName: string;
    onComplete: () => void;
    onCancel: () => void;
}
export declare const SeedExecutor: React.FC<SeedExecutorProps>;
export default SeedExecutor;
//# sourceMappingURL=SeedExecutor.d.ts.map