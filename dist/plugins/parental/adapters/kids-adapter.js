/**
 * Kids Parental Adapter
 *
 * Adapter for child safety and parental controls in apps like QwickBot.
 * Focuses on content filtering, time limits, and activity monitoring.
 *
 * Copyright (c) 2025 QwickApps.com. All rights reserved.
 */
/**
 * Activity types for kids adapter
 */
const DEFAULT_ACTIVITY_TYPES = [
    'conversation_start',
    'conversation_end',
    'content_filtered',
    'vision_used',
    'voice_used',
    'time_limit_warning',
    'time_limit_reached',
    'schedule_blocked',
    'profile_paused',
    'profile_resumed',
    'settings_changed',
];
/**
 * Create a kids parental adapter
 */
export function kidsAdapter(config = {}) {
    const { defaultDailyLimit = 60, minAge = 1, maxAge = 17, customActivityTypes = [], } = config;
    const activityTypes = [...DEFAULT_ACTIVITY_TYPES, ...customActivityTypes];
    return {
        name: 'kids',
        getActivityTypes() {
            return activityTypes;
        },
        getDefaultDailyLimit() {
            return defaultDailyLimit;
        },
        validateRestriction(restriction) {
            const errors = [];
            // Validate restriction type
            const validTypes = ['time_limit', 'schedule', 'content_filter', 'feature_block'];
            if (!validTypes.includes(restriction.restriction_type)) {
                errors.push(`Invalid restriction type: ${restriction.restriction_type}. Valid types: ${validTypes.join(', ')}`);
            }
            // Validate daily limit
            if (restriction.daily_limit_minutes !== undefined) {
                if (restriction.daily_limit_minutes < 0) {
                    errors.push('Daily limit cannot be negative');
                }
                if (restriction.daily_limit_minutes > 1440) {
                    errors.push('Daily limit cannot exceed 24 hours (1440 minutes)');
                }
            }
            // Validate schedule format
            if (restriction.schedule) {
                const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                for (const [day, times] of Object.entries(restriction.schedule)) {
                    if (!validDays.includes(day.toLowerCase())) {
                        errors.push(`Invalid day in schedule: ${day}`);
                        continue;
                    }
                    if (!times.start || !times.end) {
                        errors.push(`Schedule for ${day} must have start and end times`);
                        continue;
                    }
                    // Validate time format (HH:MM)
                    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(times.start)) {
                        errors.push(`Invalid start time format for ${day}: ${times.start}. Use HH:MM format.`);
                    }
                    if (!timeRegex.test(times.end)) {
                        errors.push(`Invalid end time format for ${day}: ${times.end}. Use HH:MM format.`);
                    }
                }
            }
            return {
                valid: errors.length === 0,
                errors: errors.length > 0 ? errors : undefined,
            };
        },
        formatActivityDetails(activity) {
            const details = { ...activity.details };
            // Add kid-specific formatting
            switch (activity.activity_type) {
                case 'conversation_start':
                    return {
                        ...details,
                        display_text: 'Started a conversation',
                        icon: 'chat',
                    };
                case 'conversation_end':
                    return {
                        ...details,
                        display_text: `Ended conversation (${details.message_count || 0} messages)`,
                        icon: 'chat_end',
                    };
                case 'content_filtered':
                    return {
                        ...details,
                        display_text: 'Content was filtered for safety',
                        icon: 'shield',
                        severity: 'warning',
                    };
                case 'vision_used':
                    return {
                        ...details,
                        display_text: 'Used camera/image feature',
                        icon: 'camera',
                    };
                case 'voice_used':
                    return {
                        ...details,
                        display_text: 'Used voice feature',
                        icon: 'microphone',
                    };
                case 'time_limit_warning':
                    return {
                        ...details,
                        display_text: `Time limit warning (${details.minutes_remaining || 0} min remaining)`,
                        icon: 'clock',
                        severity: 'info',
                    };
                case 'time_limit_reached':
                    return {
                        ...details,
                        display_text: 'Daily time limit reached',
                        icon: 'clock_stop',
                        severity: 'warning',
                    };
                case 'schedule_blocked':
                    return {
                        ...details,
                        display_text: 'Access blocked outside allowed hours',
                        icon: 'schedule',
                        severity: 'info',
                    };
                case 'profile_paused':
                    return {
                        ...details,
                        display_text: `Profile paused${details.reason ? `: ${details.reason}` : ''}`,
                        icon: 'pause',
                        severity: 'warning',
                    };
                case 'profile_resumed':
                    return {
                        ...details,
                        display_text: 'Profile resumed',
                        icon: 'play',
                        severity: 'success',
                    };
                case 'settings_changed':
                    return {
                        ...details,
                        display_text: 'Parental settings updated',
                        icon: 'settings',
                    };
                default:
                    return details;
            }
        },
        async onRestrictionViolation(profileId, reason) {
            // This hook can be used to send push notifications
            // or trigger other actions when a restriction is violated
            console.log(`[KidsAdapter] Restriction violation for profile ${profileId}: ${reason}`);
        },
        async onDailyLimitReached(profileId) {
            // This hook can be used to send notifications to parents
            // when a child reaches their daily limit
            console.log(`[KidsAdapter] Daily limit reached for profile ${profileId}`);
        },
    };
}
//# sourceMappingURL=kids-adapter.js.map