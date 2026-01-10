/**
 * Devices Plugin Types
 *
 * Type definitions for device management with adapter support.
 * Supports different device types through adapters (compute, mobile, IoT).
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Core device record in the database
 */
export interface Device {
    /** Primary key - UUID */
    id: string;
    /** Organization ID for multi-tenant isolation */
    org_id?: string;
    /** Owner user ID */
    user_id?: string;
    /** Adapter type that created this device */
    adapter_type: string;
    /** Device name */
    name: string;
    /** First 8 characters of token for identification */
    token_prefix?: string;
    /** Token expiration time */
    token_expires_at: Date;
    /** Last time device was seen */
    last_seen_at?: Date;
    /** Last known IP address */
    last_ip?: string;
    /** Whether device is active */
    is_active: boolean;
    /** Adapter-specific metadata */
    metadata: Record<string, unknown>;
    /** When the device was created */
    created_at: Date;
    /** When the device was last updated */
    updated_at: Date;
    /** Soft delete timestamp */
    deleted_at?: Date;
}
/**
 * Device with token (returned only on create)
 */
export interface DeviceWithToken extends Device {
    /** Raw token (only returned on create, never stored) */
    token: string;
}
/**
 * Device creation payload (adapter-agnostic)
 */
export interface CreateDeviceInput {
    /** Organization ID */
    org_id?: string;
    /** Owner user ID */
    user_id?: string;
    /** Device name */
    name: string;
    /** Token validity in days (default: 90) */
    token_validity_days?: number;
    /** Adapter-specific fields */
    metadata?: Record<string, unknown>;
}
/**
 * Device update payload
 */
export interface UpdateDeviceInput {
    /** Device name */
    name?: string;
    /** Whether device is active */
    is_active?: boolean;
    /** Adapter-specific metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Device search parameters
 */
export interface DeviceSearchParams {
    /** Organization ID filter */
    org_id?: string;
    /** User ID filter */
    user_id?: string;
    /** Adapter type filter */
    adapter_type?: string;
    /** Active status filter */
    is_active?: boolean;
    /** Search query (searches name) */
    query?: string;
    /** Page number (1-indexed) */
    page?: number;
    /** Items per page */
    limit?: number;
    /** Sort field */
    sortBy?: 'name' | 'created_at' | 'last_seen_at';
    /** Sort direction */
    sortOrder?: 'asc' | 'desc';
}
/**
 * Paginated device list response
 */
export interface DeviceListResponse {
    devices: Device[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
/**
 * Token verification result
 */
export interface TokenVerificationResult {
    /** Whether the token is valid */
    valid: boolean;
    /** The device if valid */
    device?: Device;
    /** Error message if invalid */
    error?: string;
}
/**
 * Validation result from adapter
 */
export interface ValidationResult {
    /** Whether validation passed */
    valid: boolean;
    /** Error messages if invalid */
    errors?: string[];
}
/**
 * Device adapter interface - all adapters must implement this
 */
export interface DeviceAdapter {
    /** Adapter name (e.g., 'compute', 'mobile', 'iot') */
    name: string;
    /** Token prefix for this adapter (e.g., 'qwf_dev', 'qwb_mob') */
    tokenPrefix: string;
    /**
     * Validate device input before creation
     */
    validateDeviceInput(input: CreateDeviceInput): ValidationResult;
    /**
     * Transform input for storage (add adapter-specific defaults)
     */
    transformForStorage(input: CreateDeviceInput): Record<string, unknown>;
    /**
     * Transform row from storage to typed device
     */
    transformFromStorage(row: Record<string, unknown>): Record<string, unknown>;
    /**
     * Hook called after device is created (optional)
     */
    onDeviceCreated?(device: Device): Promise<void>;
    /**
     * Hook called after device is deleted (optional)
     */
    onDeviceDeleted?(device: Device): Promise<void>;
    /**
     * Hook called when device token is verified (optional)
     */
    onDeviceVerified?(device: Device, ip?: string): Promise<void>;
}
/**
 * Device store interface - all storage backends must implement this
 */
export interface DeviceStore {
    /** Store name (e.g., 'postgres', 'memory') */
    name: string;
    /**
     * Initialize the store (create tables, etc.)
     */
    initialize(): Promise<void>;
    /**
     * Get a device by ID
     */
    getById(id: string): Promise<Device | null>;
    /**
     * Get a device by token hash
     */
    getByTokenHash(tokenHash: string): Promise<Device | null>;
    /**
     * Create a new device (stores token hash, not raw token)
     */
    create(input: CreateDeviceInput & {
        tokenHash: string;
        tokenPrefix: string;
        tokenExpiresAt: Date;
        adapterType: string;
    }): Promise<Device>;
    /**
     * Update an existing device
     */
    update(id: string, input: UpdateDeviceInput): Promise<Device | null>;
    /**
     * Soft delete a device
     */
    delete(id: string): Promise<boolean>;
    /**
     * Search/list devices
     */
    search(params: DeviceSearchParams): Promise<DeviceListResponse>;
    /**
     * Update last seen timestamp
     */
    updateLastSeen(id: string, ip?: string): Promise<void>;
    /**
     * Regenerate token for a device (returns new token hash and prefix)
     */
    updateToken(id: string, tokenHash: string, tokenPrefix: string, expiresAt: Date): Promise<boolean>;
    /**
     * Cleanup expired tokens
     */
    cleanupExpired(): Promise<number>;
    /**
     * Shutdown the store
     */
    shutdown(): Promise<void>;
}
/**
 * PostgreSQL device store configuration
 */
export interface PostgresDeviceStoreConfig {
    /** PostgreSQL pool instance or a function that returns one (for lazy initialization) */
    pool: unknown | (() => unknown);
    /** Devices table name (default: 'devices') */
    tableName?: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Auto-create tables on init (default: true) */
    autoCreateTables?: boolean;
}
/**
 * API configuration
 */
export interface DevicesApiConfig {
    /** API route prefix (default: '/devices') */
    prefix?: string;
    /** Enable CRUD endpoints */
    crud?: boolean;
    /** Enable token verification endpoint */
    verify?: boolean;
}
/**
 * Devices plugin configuration
 */
export interface DevicesPluginConfig {
    /** Device storage backend */
    store: DeviceStore;
    /** Device adapter (defines device type) */
    adapter: DeviceAdapter;
    /** Default token validity in days (default: 90) */
    defaultTokenValidityDays?: number;
    /** API configuration */
    api?: DevicesApiConfig;
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Compute device metadata (QwickForge - laptops, containers)
 */
export interface ComputeDeviceMetadata {
    /** Hostname of the device */
    hostname?: string;
    /** Operating system (darwin, linux, win32) */
    os?: string;
    /** OS version */
    os_version?: string;
    /** CPU architecture (x64, arm64) */
    arch?: string;
    /** CLI capabilities */
    cli_capabilities?: string[];
    /** Container ID if running in container */
    container_id?: string;
    /** Node.js version */
    node_version?: string;
}
/**
 * Mobile device metadata (QwickBot - phones, tablets)
 */
export interface MobileDeviceMetadata {
    /** Device model (iPhone 15 Pro, Pixel 8) */
    device_model?: string;
    /** OS name (iOS, Android) */
    os_name?: string;
    /** OS version */
    os_version?: string;
    /** App version */
    app_version?: string;
    /** Push notification token (FCM/APNs) */
    push_token?: string;
    /** Screen width */
    screen_width?: number;
    /** Screen height */
    screen_height?: number;
}
/**
 * IoT device metadata (future - robots, sensors)
 */
export interface IoTDeviceMetadata {
    /** Firmware version */
    firmware_version?: string;
    /** Available sensors */
    sensors?: string[];
    /** Device capabilities */
    capabilities?: string[];
    /** MAC address */
    mac_address?: string;
}
//# sourceMappingURL=types.d.ts.map