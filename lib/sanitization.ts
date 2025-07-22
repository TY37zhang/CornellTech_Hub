/**
 * HTML Sanitization and Content Security
 * 
 * This module provides utilities for sanitizing user-generated content
 * to prevent XSS attacks and ensure content safety.
 */

// Allowed HTML tags for rich content (forums, reviews, etc.)
const ALLOWED_TAGS = new Set([
    'p', 'br', 'strong', 'em', 'u', 'b', 'i',
    'ul', 'ol', 'li', 'blockquote', 'code',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
]);

// Allowed attributes for HTML tags
const ALLOWED_ATTRIBUTES = new Map([
    ['*', new Set(['class'])],  // Allow class attribute on all tags
    ['a', new Set(['href', 'title', 'rel'])],
    ['img', new Set(['src', 'alt', 'title', 'width', 'height'])],
    ['blockquote', new Set(['cite'])],
]);

// Dangerous patterns to completely remove
const DANGEROUS_PATTERNS = [
    /javascript:/gi,
    /vbscript:/gi,
    /data:(?!image\/)/gi,  // Allow data: URLs only for images
    /on\w+\s*=/gi,         // Remove event handlers (onclick, onload, etc.)
    /<script[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?<\/iframe>/gi,
    /<object[\s\S]*?<\/object>/gi,
    /<embed[\s\S]*?<\/embed>/gi,
    /<form[\s\S]*?<\/form>/gi,
    /<meta[\s\S]*?>/gi,
    /<link[\s\S]*?>/gi,
    /<style[\s\S]*?<\/style>/gi,
];

// Profanity filter patterns (basic implementation)
const PROFANITY_PATTERNS = [
    // Add patterns as needed for content moderation
    /\b(spam|advertisement|buy now|click here)\b/gi,
];

/**
 * Sanitizes HTML content by removing dangerous elements and attributes
 */
export function sanitizeHTML(content: string): string {
    if (!content || typeof content !== 'string') {
        return '';
    }

    let sanitized = content;

    // Remove dangerous patterns first
    DANGEROUS_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '');
    });

    // Basic HTML tag sanitization
    sanitized = sanitized.replace(/<(\/?[^>]+)>/g, (match, tagContent) => {
        const isClosingTag = tagContent.startsWith('/');
        const tagName = isClosingTag 
            ? tagContent.slice(1).toLowerCase().trim()
            : tagContent.split(/\s/)[0].toLowerCase();

        // Allow only whitelisted tags
        if (!ALLOWED_TAGS.has(tagName)) {
            return ''; // Remove disallowed tags
        }

        if (isClosingTag) {
            return `</${tagName}>`;
        }

        // For opening tags, sanitize attributes
        const attributes = tagContent.includes(' ') 
            ? tagContent.substring(tagName.length).trim()
            : '';

        if (!attributes) {
            return `<${tagName}>`;
        }

        const sanitizedAttributes = sanitizeAttributes(tagName, attributes);
        return sanitizedAttributes 
            ? `<${tagName} ${sanitizedAttributes}>`
            : `<${tagName}>`;
    });

    // Remove any remaining malicious patterns
    sanitized = sanitized
        .replace(/\bjavascript\s*:/gi, '')
        .replace(/\bvbscript\s*:/gi, '')
        .replace(/\bon\w+\s*=/gi, '');

    return sanitized.trim();
}

/**
 * Sanitizes HTML attributes for a given tag
 */
function sanitizeAttributes(tagName: string, attributes: string): string {
    const allowedForTag = ALLOWED_ATTRIBUTES.get(tagName) || new Set();
    const allowedForAll = ALLOWED_ATTRIBUTES.get('*') || new Set();
    const allAllowed = new Set([...allowedForTag, ...allowedForAll]);

    // Parse and filter attributes
    const attributePattern = /(\w+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
    const sanitizedAttrs: string[] = [];

    let match;
    while ((match = attributePattern.exec(attributes)) !== null) {
        const [, attrName, doubleQuoted, singleQuoted, unquoted] = match;
        const attrValue = doubleQuoted || singleQuoted || unquoted || '';

        if (allAllowed.has(attrName.toLowerCase())) {
            const sanitizedValue = sanitizeAttributeValue(attrName, attrValue);
            if (sanitizedValue !== null) {
                sanitizedAttrs.push(`${attrName}="${sanitizedValue}"`);
            }
        }
    }

    return sanitizedAttrs.join(' ');
}

/**
 * Sanitizes individual attribute values
 */
function sanitizeAttributeValue(attrName: string, value: string): string | null {
    if (!value) return value;

    const lower = attrName.toLowerCase();

    // Special handling for different attribute types
    switch (lower) {
        case 'href':
            // Allow only safe URL schemes
            if (!/^(https?|mailto|tel):/i.test(value) && !value.startsWith('/')) {
                return null; // Block dangerous URLs
            }
            break;
        
        case 'src':
            // Allow only safe image sources
            if (!/^(https?:|data:image\/|\/)/i.test(value)) {
                return null;
            }
            break;
        
        case 'class':
            // Allow only safe class names (alphanumeric, dash, underscore)
            if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
                return null;
            }
            break;
    }

    // Remove any javascript: or other dangerous patterns
    return value
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
}

/**
 * Sanitizes plain text content (for comments, reviews, etc.)
 */
export function sanitizeText(content: string): string {
    if (!content || typeof content !== 'string') {
        return '';
    }

    // Remove HTML tags entirely for plain text
    let sanitized = content
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&lt;/g, '<')   // Decode HTML entities
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'");

    // Trim whitespace and normalize line breaks
    sanitized = sanitized
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks
        .trim();

    return sanitized;
}

/**
 * Basic profanity and spam detection
 */
export function checkContentPolicy(content: string): {
    isValid: boolean;
    violations: string[];
} {
    const violations: string[] = [];

    // Check for profanity/spam patterns
    PROFANITY_PATTERNS.forEach(pattern => {
        if (pattern.test(content)) {
            violations.push('Content contains prohibited language or spam');
        }
    });

    // Check for excessive links (potential spam)
    const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
    if (linkCount > 3) {
        violations.push('Too many links detected');
    }

    // Check for excessive length
    if (content.length > 10000) {
        violations.push('Content exceeds maximum length');
    }

    return {
        isValid: violations.length === 0,
        violations
    };
}

/**
 * Comprehensive content sanitization for different content types
 */
export function sanitizeContent(
    content: string, 
    type: 'html' | 'text' | 'markdown' = 'text'
): {
    sanitized: string;
    violations: string[];
    isValid: boolean;
} {
    if (!content) {
        return { sanitized: '', violations: [], isValid: true };
    }

    // Check content policy first
    const policyCheck = checkContentPolicy(content);

    // Sanitize based on type
    let sanitized: string;
    switch (type) {
        case 'html':
            sanitized = sanitizeHTML(content);
            break;
        case 'markdown':
            // For now, treat markdown as text (consider adding markdown parser later)
            sanitized = sanitizeText(content);
            break;
        default:
            sanitized = sanitizeText(content);
    }

    return {
        sanitized,
        violations: policyCheck.violations,
        isValid: policyCheck.isValid
    };
}

/**
 * Utility to escape HTML entities in user input
 */
export function escapeHTML(content: string): string {
    if (!content) return '';
    
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}