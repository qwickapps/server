/**
 * Seed List Component
 *
 * Displays available seed scripts with metadata.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
import React from 'react';
export interface SeedListProps {
    apiPrefix: string;
    onExecute: (seedName: string) => void;
}
export declare const SeedList: React.FC<SeedListProps>;
export default SeedList;
//# sourceMappingURL=SeedList.d.ts.map