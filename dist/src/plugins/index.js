/**
 * Built-in plugins for @qwickapps/server
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
export { createHealthPlugin } from './health-plugin.js';
export { createCMSPlugin } from './cms/index.js';
export { createLogsPlugin } from './logs-plugin.js';
export { createMaintenancePlugin } from './maintenance-plugin.js';
export { MaintenanceManagementPage, MaintenanceStatusWidget, SeedManagementPage, SeedList, SeedExecutorUI, SeedHistory, } from './maintenance/index.js';
export { createConfigPlugin } from './config-plugin.js';
export { createDiagnosticsPlugin } from './diagnostics-plugin.js';
export { createFrontendAppPlugin } from './frontend-app-plugin.js';
export { createPostgresPlugin, getPostgres, hasPostgres } from './postgres-plugin.js';
export { createCachePlugin, getCache, hasCache } from './cache-plugin.js';
// Auth plugin
export { createAuthPlugin, createAuthPluginFromEnv, getAuthStatus, setAuthConfigStore, registerAuthConfigRoutes, postgresAuthConfigStore, isAuthenticated, getAuthenticatedUser, getAccessToken, requireAuth, requireRoles, requireAnyRole, auth0Adapter, basicAdapter, supabaseAdapter, supertokensAdapter, isAuthenticatedRequest, } from './auth/index.js';
// Users plugin
export { createUsersPlugin, getUserStore, getUserById, getUserByEmail, getUserByIdentifier, linkUserIdentifiers, findOrCreateUser, postgresUserStore, } from './users/index.js';
// Bans plugin (separate from Users, depends on Users)
export { createBansPlugin, getBanStore, isUserBanned, isEmailBanned, getActiveBan, banUser, unbanUser, listActiveBans, postgresBanStore, } from './bans/index.js';
// API Keys plugin (M2M authentication, depends on Users)
export { createApiKeysPlugin, getApiKeysStore, verifyApiKey, createApiKey, listApiKeys, getApiKey, updateApiKey, deleteApiKey, postgresApiKeyStore, bearerTokenAuth, } from './api-keys/index.js';
// Entitlements plugin
export { createEntitlementsPlugin, getEntitlementSource, isSourceReadonly, getEntitlements, refreshEntitlements, hasEntitlement, hasAnyEntitlement, hasAllEntitlements, grantEntitlement, revokeEntitlement, setEntitlements, getAvailableEntitlements, getEntitlementStats, invalidateEntitlementCache, storeExternalIdMapping, invalidateByExternalId, requireEntitlement, requireAnyEntitlement, requireAllEntitlements, postgresEntitlementSource, } from './entitlements/index.js';
// Preferences plugin (depends on Users)
export { createPreferencesPlugin, getPreferencesStore, getPreferences, updatePreferences, deletePreferences, getDefaultPreferences, postgresPreferencesStore, deepMerge, } from './preferences/index.js';
// Rate Limit plugin
export { createRateLimitPlugin, createRateLimitPluginFromEnv, getRateLimitConfigStatus, postgresRateLimitStore, createRateLimitCache, createNoOpCache, createSlidingWindowStrategy, createFixedWindowStrategy, createTokenBucketStrategy, getStrategy, rateLimitMiddleware, rateLimitStatusMiddleware, RateLimitService, getRateLimitService, isLimited, checkLimit, incrementLimit, getRemainingRequests, getLimitStatus, clearLimit, createCleanupJob, } from './rate-limit/index.js';
// Devices plugin
export { createDevicesPlugin, getDeviceStore, getDeviceAdapter, registerDevice, verifyDeviceToken, getDeviceById, updateDevice, deleteDevice, regenerateToken, listUserDevices, listOrgDevices, deactivateDevice, activateDevice, cleanupExpiredTokens, postgresDeviceStore, computeDeviceAdapter, mobileDeviceAdapter, generateDeviceToken, generatePairingCode, hashToken, verifyToken, isValidTokenFormat, isTokenExpired, getTokenExpiration, DeviceTokens, } from './devices/index.js';
// Profiles plugin
export { createProfilesPlugin, getProfileStore, createProfile, getProfileById, updateProfile, deleteProfile, listUserProfiles, getDefaultProfile, setDefaultProfile, getProfilesByAgeGroup, getChildProfiles, getProfileAge, checkTimeRestrictions, getContentFilterLevel, canAccessContent, postgresProfileStore, } from './profiles/index.js';
// Subscriptions plugin
export { createSubscriptionsPlugin, getSubscriptionsStore, createTier, getTierBySlug, getTierById, listTiers, getTierEntitlements, setTierEntitlements, getUserSubscription, createUserSubscription, updateUserSubscription, cancelSubscription, getUserTierSlug, getFeatureLimit, hasFeature, checkFeatureLimit, ensureUserSubscription, postgresSubscriptionsStore, } from './subscriptions/index.js';
// Usage plugin
export { createUsagePlugin, getUsageStore, getDailyUsage, incrementUsage, checkUsageLimit, getFeatureUsageStatus, getDailyUsageSummary, resetUsage, getRemainingQuota, canUseFeature, postgresUsageStore, } from './usage/index.js';
// Parental plugin
export { createParentalPlugin, getParentalStore, getParentalAdapter, getGuardianSettings, createGuardianSettings, updateGuardianSettings, setPin, verifyPin, incrementFailedPinAttempts, resetFailedPinAttempts, getRestrictions, createRestriction, updateRestriction, deleteRestriction, pauseProfile, resumeProfile, checkProfileAccess, logActivity, getActivityLog, postgresParentalStore, kidsAdapter, } from './parental/index.js';
// Notifications plugin
export { createNotificationsPlugin, NotificationsManager, getNotificationsManager, hasNotificationsManager, broadcastToDevice, broadcastToUser, broadcastToAll, } from './notifications/index.js';
// QwickBrain MCP plugin
export { createQwickBrainPlugin, getConnectionStatus, isConnected, } from './qwickbrain/index.js';
//# sourceMappingURL=index.js.map