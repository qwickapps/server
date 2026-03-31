/**
 * Sanitizes a URL to prevent javascript: and other dangerous protocol injections
 * when interpolating user-supplied URLs into HTML href attributes.
 *
 * Allows: http:, https:, and relative URLs (starting with /).
 * Returns fallback for any other protocol (e.g., javascript:, data:, vbscript:).
 */
export function sanitizeUrl(url, fallback = '#') {
    if (!url)
        return fallback;
    // Allow relative URLs
    if (url.startsWith('/'))
        return url;
    try {
        const parsed = new URL(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            return url;
        }
        return fallback;
    }
    catch {
        return fallback;
    }
}
//# sourceMappingURL=url.js.map