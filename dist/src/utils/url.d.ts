/**
 * Sanitizes a URL to prevent javascript: and other dangerous protocol injections
 * when interpolating user-supplied URLs into HTML href attributes.
 *
 * Allows: http:, https:, and relative URLs (starting with /).
 * Returns fallback for any other protocol (e.g., javascript:, data:, vbscript:).
 */
export declare function sanitizeUrl(url: string, fallback?: string): string;
//# sourceMappingURL=url.d.ts.map