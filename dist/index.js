/**
 * @qwickapps/server
 *
 * Independent control panel and management UI for QwickApps services
 * Runs on a separate port, provides health checks, logs, config, and diagnostics
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
// Core exports
export { createControlPanel } from './core/control-panel.js';
export { createGateway } from './core/gateway.js';
export { HealthManager } from './core/health-manager.js';
// Plugin Registry exports (event-driven architecture v2.0)
export { createPluginRegistry, getPluginRegistry, hasPluginRegistry, resetPluginRegistry, PluginRegistryImpl, } from './core/plugin-registry.js';
// Route guards (for control panel protection)
export { createRouteGuard } from './core/guards.js';
// Logging exports
export { initializeLogging, getControlPanelLogger, getLoggingSubsystem, } from './core/logging.js';
// Built-in plugins
export { createHealthPlugin, createLogsPlugin, createMaintenancePlugin, createConfigPlugin, createDiagnosticsPlugin, createFrontendAppPlugin, createCMSPlugin, 
// Postgres plugin
createPostgresPlugin, getPostgres, hasPostgres, 
// Cache plugin
createCachePlugin, getCache, hasCache, 
// Auth plugin
createAuthPlugin, createAuthPluginFromEnv, getAuthStatus, setAuthConfigStore, registerAuthConfigRoutes, postgresAuthConfigStore, isAuthenticated, getAuthenticatedUser, getAccessToken, requireAuth, requireRoles, requireAnyRole, auth0Adapter, basicAdapter, supabaseAdapter, supertokensAdapter, isAuthenticatedRequest, 
// Users plugin
createUsersPlugin, getUserStore, getUserById, getUserByEmail, getUserByIdentifier, linkUserIdentifiers, findOrCreateUser, postgresUserStore, 
// Bans plugin (separate from Users, depends on Users)
createBansPlugin, getBanStore, isUserBanned, isEmailBanned, getActiveBan, banUser, unbanUser, listActiveBans, postgresBanStore, 
// API Keys plugin (M2M authentication, depends on Users)
createApiKeysPlugin, getApiKeysStore, verifyApiKey, createApiKey, listApiKeys, getApiKey, updateApiKey, deleteApiKey, postgresApiKeyStore, bearerTokenAuth, 
// Entitlements plugin
createEntitlementsPlugin, getEntitlementSource, isSourceReadonly, getEntitlements, refreshEntitlements, hasEntitlement, hasAnyEntitlement, hasAllEntitlements, grantEntitlement, revokeEntitlement, setEntitlements, getAvailableEntitlements, getEntitlementStats, invalidateEntitlementCache, storeExternalIdMapping, invalidateByExternalId, requireEntitlement, requireAnyEntitlement, requireAllEntitlements, postgresEntitlementSource, 
// Rate Limit plugin
createRateLimitPlugin, createRateLimitPluginFromEnv, getRateLimitConfigStatus, postgresRateLimitStore, createRateLimitCache, createNoOpCache, createSlidingWindowStrategy, createFixedWindowStrategy, createTokenBucketStrategy, getStrategy, rateLimitMiddleware, rateLimitStatusMiddleware, RateLimitService, getRateLimitService, isLimited, checkLimit, incrementLimit, getRemainingRequests, getLimitStatus, clearLimit, createCleanupJob, 
// Devices plugin
createDevicesPlugin, getDeviceStore, getDeviceAdapter, registerDevice, verifyDeviceToken, getDeviceById, updateDevice, deleteDevice, regenerateToken, listUserDevices, listOrgDevices, deactivateDevice, activateDevice, cleanupExpiredTokens, postgresDeviceStore, computeDeviceAdapter, mobileDeviceAdapter, generateDeviceToken, generatePairingCode, hashToken, verifyToken, isValidTokenFormat, isTokenExpired, getTokenExpiration, DeviceTokens, 
// Profiles plugin
createProfilesPlugin, getProfileStore, createProfile, getProfileById, updateProfile, deleteProfile, listUserProfiles, getDefaultProfile, setDefaultProfile, getProfilesByAgeGroup, getChildProfiles, getProfileAge, checkTimeRestrictions, getContentFilterLevel, canAccessContent, postgresProfileStore, 
// Subscriptions plugin
createSubscriptionsPlugin, getSubscriptionsStore, createTier, getTierBySlug, getTierById, listTiers, getTierEntitlements, setTierEntitlements, getUserSubscription, createUserSubscription, updateUserSubscription, cancelSubscription, getUserTierSlug, getFeatureLimit, hasFeature, checkFeatureLimit, ensureUserSubscription, postgresSubscriptionsStore, 
// Usage plugin
createUsagePlugin, getUsageStore, getDailyUsage, incrementUsage, checkUsageLimit, getFeatureUsageStatus, getDailyUsageSummary, resetUsage, getRemainingQuota, canUseFeature, postgresUsageStore, 
// Parental plugin
createParentalPlugin, getParentalStore, getParentalAdapter, getGuardianSettings, createGuardianSettings, updateGuardianSettings, setPin, verifyPin, incrementFailedPinAttempts, resetFailedPinAttempts, getRestrictions, createRestriction, updateRestriction, deleteRestriction, pauseProfile, resumeProfile, checkProfileAccess, logActivity, getActivityLog, postgresParentalStore, kidsAdapter, 
// QwickBrain plugin
createQwickBrainPlugin, getConnectionStatus, isConnected, } from './plugins/index.js';
//# sourceMappingURL=index.js.map