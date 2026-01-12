/**
 * Built-in plugins for @qwickapps/server
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createHealthPlugin } from './health-plugin.js';
export type { HealthPluginConfig } from './health-plugin.js';
export { createCMSPlugin } from './cms/index.js';
export type { CMSPluginConfig } from './cms/index.js';
export { createLogsPlugin } from './logs-plugin.js';
export type { LogsPluginConfig } from './logs-plugin.js';
export { createMaintenancePlugin } from './maintenance-plugin.js';
export type { MaintenancePluginConfig } from './maintenance-plugin.js';
export { MaintenanceManagementPage, MaintenanceStatusWidget, SeedManagementPage, SeedList, SeedExecutorUI, SeedHistory, } from './maintenance/index.js';
export type { MaintenanceManagementPageProps, MaintenanceStatusWidgetProps, SeedManagementPageProps, SeedListProps, SeedExecutorProps, SeedHistoryProps, } from './maintenance/index.js';
export { createConfigPlugin } from './config-plugin.js';
export type { ConfigPluginConfig } from './config-plugin.js';
export { createDiagnosticsPlugin } from './diagnostics-plugin.js';
export type { DiagnosticsPluginConfig } from './diagnostics-plugin.js';
export { createFrontendAppPlugin } from './frontend-app-plugin.js';
export type { FrontendAppPluginConfig } from './frontend-app-plugin.js';
export { createPostgresPlugin, getPostgres, hasPostgres } from './postgres-plugin.js';
export type { PostgresPluginConfig, PostgresInstance, TransactionCallback } from './postgres-plugin.js';
export { createCachePlugin, getCache, hasCache } from './cache-plugin.js';
export type { CachePluginConfig, CacheInstance } from './cache-plugin.js';
export { createAuthPlugin, createAuthPluginFromEnv, getAuthStatus, setAuthConfigStore, registerAuthConfigRoutes, postgresAuthConfigStore, isAuthenticated, getAuthenticatedUser, getAccessToken, requireAuth, requireRoles, requireAnyRole, auth0Adapter, basicAdapter, supabaseAdapter, supertokensAdapter, isAuthenticatedRequest, } from './auth/index.js';
export type { AuthPluginConfig, AuthAdapter, AuthenticatedUser, AuthenticatedRequest, Auth0AdapterConfig, SupabaseAdapterConfig, BasicAdapterConfig, SupertokensAdapterConfig, AuthPluginState, AuthEnvPluginOptions, AuthConfigStatus, AuthConfigStore, PostgresAuthConfigStoreConfig, } from './auth/index.js';
export { createUsersPlugin, getUserStore, getUserById, getUserByEmail, getUserByIdentifier, linkUserIdentifiers, findOrCreateUser, postgresUserStore, } from './users/index.js';
export type { UsersPluginConfig, UserStore, User, CreateUserInput, UpdateUserInput, UserSearchParams, UserListResponse, PostgresUserStoreConfig, UserSyncConfig, UsersApiConfig, UsersUiConfig, UserIdentifiers, StoredIdentifiers, } from './users/index.js';
export { createTenantsPlugin, getTenantStore, postgresTenantStore } from './tenants/index.js';
export type { TenantsPluginConfig, TenantStore, Tenant, TenantType, CreateTenantInput, UpdateTenantInput, TenantSearchParams, TenantListResponse, TenantMembership, CreateTenantMembershipInput, UpdateTenantMembershipInput, TenantWithMembership, PostgresTenantStoreConfig, } from './tenants/index.js';
export { createBansPlugin, getBanStore, isUserBanned, isEmailBanned, getActiveBan, banUser, unbanUser, listActiveBans, postgresBanStore, } from './bans/index.js';
export type { BansPluginConfig, BanStore, Ban, CreateBanInput, RemoveBanInput, BanCallbacks, PostgresBanStoreConfig, } from './bans/index.js';
export { createApiKeysPlugin, getApiKeysStore, verifyApiKey, createApiKey, listApiKeys, getApiKey, updateApiKey, deleteApiKey, postgresApiKeyStore, bearerTokenAuth, } from './api-keys/index.js';
export type { ApiKeysPluginConfig, ApiKeyStore, ApiKey, ApiKeyWithPlaintext, ApiKeyScope, ApiKeyType, CreateApiKeyParams, UpdateApiKeyParams, PostgresApiKeyStoreConfig, ApiKeysApiConfig, } from './api-keys/index.js';
export { createEntitlementsPlugin, getEntitlementSource, isSourceReadonly, getEntitlements, refreshEntitlements, hasEntitlement, hasAnyEntitlement, hasAllEntitlements, grantEntitlement, revokeEntitlement, setEntitlements, getAvailableEntitlements, getEntitlementStats, invalidateEntitlementCache, storeExternalIdMapping, invalidateByExternalId, requireEntitlement, requireAnyEntitlement, requireAllEntitlements, postgresEntitlementSource, } from './entitlements/index.js';
export type { EntitlementsPluginConfig, EntitlementSource, EntitlementResult, EntitlementDefinition, EntitlementCallbacks, EntitlementsCacheConfig, EntitlementsApiConfig, PostgresEntitlementSourceConfig, UserEntitlement, CachedEntitlements, EntitlementStats, } from './entitlements/index.js';
export { createPreferencesPlugin, getPreferencesStore, getPreferences, updatePreferences, deletePreferences, getDefaultPreferences, postgresPreferencesStore, deepMerge, } from './preferences/index.js';
export type { PreferencesPluginConfig, PreferencesStore, UserPreferences, PostgresPreferencesStoreConfig, PreferencesApiConfig, } from './preferences/index.js';
export { createRateLimitPlugin, createRateLimitPluginFromEnv, getRateLimitConfigStatus, postgresRateLimitStore, createRateLimitCache, createNoOpCache, createSlidingWindowStrategy, createFixedWindowStrategy, createTokenBucketStrategy, getStrategy, rateLimitMiddleware, rateLimitStatusMiddleware, RateLimitService, getRateLimitService, isLimited, checkLimit, incrementLimit, getRemainingRequests, getLimitStatus, clearLimit, createCleanupJob, } from './rate-limit/index.js';
export type { RateLimitPluginConfig, RateLimitEnvPluginOptions, RateLimitStrategy, LimitStatus, Strategy, StrategyOptions, StrategyContext, StoredLimit, IncrementOptions, RateLimitStore, PostgresRateLimitStoreConfig, CachedLimit, RateLimitCache, RateLimitCacheConfig, RateLimitMiddlewareOptions, CheckLimitOptions, CleanupJob, CleanupJobConfig, } from './rate-limit/index.js';
export { createDevicesPlugin, getDeviceStore, getDeviceAdapter, registerDevice, verifyDeviceToken, getDeviceById, updateDevice, deleteDevice, regenerateToken, listUserDevices, listOrgDevices, deactivateDevice, activateDevice, cleanupExpiredTokens, postgresDeviceStore, computeDeviceAdapter, mobileDeviceAdapter, generateDeviceToken, generatePairingCode, hashToken, verifyToken, isValidTokenFormat, isTokenExpired, getTokenExpiration, DeviceTokens, } from './devices/index.js';
export type { Device, DeviceWithToken, CreateDeviceInput, UpdateDeviceInput, DeviceSearchParams, DeviceListResponse, TokenVerificationResult, DeviceAdapter, ValidationResult as DeviceValidationResult, DeviceStore, DevicesPluginConfig, DevicesApiConfig, PostgresDeviceStoreConfig, ComputeDeviceMetadata, MobileDeviceMetadata, IoTDeviceMetadata, ComputeAdapterConfig, MobileAdapterConfig, DeviceTokenPair, } from './devices/index.js';
export { createProfilesPlugin, getProfileStore, createProfile, getProfileById, updateProfile, deleteProfile, listUserProfiles, getDefaultProfile, setDefaultProfile, getProfilesByAgeGroup, getChildProfiles, getProfileAge, checkTimeRestrictions, getContentFilterLevel, canAccessContent, postgresProfileStore, } from './profiles/index.js';
export type { Profile, CreateProfileInput, UpdateProfileInput, ProfileSearchParams, ProfileListResponse, TimeRestrictionResult, ContentFilterLevel, AgeGroup, ProfileStore, ProfilesPluginConfig, ProfilesApiConfig, PostgresProfileStoreConfig, AgeThresholds, QwickBotProfileMetadata, GamingProfileMetadata, } from './profiles/index.js';
export { createSubscriptionsPlugin, getSubscriptionsStore, createTier, getTierBySlug, getTierById, listTiers, getTierEntitlements, setTierEntitlements, getUserSubscription, createUserSubscription, updateUserSubscription, cancelSubscription, getUserTierSlug, getFeatureLimit, hasFeature, checkFeatureLimit, ensureUserSubscription, postgresSubscriptionsStore, } from './subscriptions/index.js';
export type { SubscriptionTier, SubscriptionEntitlement, UserSubscription, UserSubscriptionWithTier, SubscriptionStatus, FeatureLimitResult, CreateTierInput, UpdateTierInput, CreateEntitlementInput, CreateUserSubscriptionInput, UpdateUserSubscriptionInput, SubscriptionsStore, SubscriptionsPluginConfig, SubscriptionsApiConfig, PostgresSubscriptionsStoreConfig, } from './subscriptions/index.js';
export { createUsagePlugin, getUsageStore, getDailyUsage, incrementUsage, checkUsageLimit, getFeatureUsageStatus, getDailyUsageSummary, resetUsage, getRemainingQuota, canUseFeature, postgresUsageStore, } from './usage/index.js';
export type { DailyUsage, MonthlyUsage, UsageIncrementResult, UsageStatus, UsageSummary, UsageStore, UsagePluginConfig, UsageApiConfig, UsageCleanupConfig, PostgresUsageStoreConfig, } from './usage/index.js';
export { createParentalPlugin, getParentalStore, getParentalAdapter, getGuardianSettings, createGuardianSettings, updateGuardianSettings, setPin, verifyPin, incrementFailedPinAttempts, resetFailedPinAttempts, getRestrictions, createRestriction, updateRestriction, deleteRestriction, pauseProfile, resumeProfile, checkProfileAccess, logActivity, getActivityLog, postgresParentalStore, kidsAdapter, } from './parental/index.js';
export type { GuardianSettings, ProfileRestriction, ActivityLog, AccessCheckResult, CreateGuardianSettingsInput, UpdateGuardianSettingsInput, CreateRestrictionInput, LogActivityInput, ParentalAdapter, ParentalStore, ParentalPluginConfig, ParentalApiConfig, PostgresParentalStoreConfig, KidsAdapterConfig, } from './parental/index.js';
export { createNotificationsPlugin, NotificationsManager, getNotificationsManager, hasNotificationsManager, broadcastToDevice, broadcastToUser, broadcastToAll, } from './notifications/index.js';
export type { NotificationsPluginConfig, SSEClient, NotifyPayload, SSEEvent, NotificationsStats, ConnectionHealth, NotificationsManagerInterface, } from './notifications/index.js';
export { createQwickBrainPlugin, getConnectionStatus, isConnected, } from './qwickbrain/index.js';
export type { QwickBrainPluginConfig, MCPToolDefinition, MCPToolCallRequest, MCPToolCallResponse, QwickBrainConnectionStatus, MCPRateLimitConfig, } from './qwickbrain/index.js';
//# sourceMappingURL=index.d.ts.map