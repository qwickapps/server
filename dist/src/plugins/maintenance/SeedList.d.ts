/**
 * Seed List Component
 *
 * Displays available seed scripts and custom tasks with metadata.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import React from 'react';
export interface SeedListProps {
    apiPrefix: string;
    onExecute: (seedName: string, type?: string, options?: any) => void;
}
export declare const SeedList: React.FC<SeedListProps>;
export default SeedList;
//# sourceMappingURL=SeedList.d.ts.map