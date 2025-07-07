/**
 * Utility functions for BPMN export plugin
 */

/**
 * Generate unique ID for BPMN elements
 */
export function generateId(prefix: string = 'element'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * Escape XML special characters
 */
export function escapeXml(str: string | undefined): string {
    if (!str) return '';

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Format XML with indentation
 */
export function formatXml(xml: string, indent: string = '  '): string {
    const PADDING = indent;
    const reg = /(>)(<)(\/*)/g;
    let pad = 0;

    xml = xml.replace(reg, '$1\r\n$2$3');

    return xml.split('\r\n').map((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/) && pad > 0) {
            pad -= 1;
        } else if (node.match(/^<\w([^>]*[^\/])?>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        const padding = PADDING.repeat(pad);
        pad += indent;

        return padding + node;
    }).join('\r\n');
}

/**
 * Parse condition expression
 */
export function parseConditionExpression(expression: string | undefined): string {
    if (!expression) return '';

    // Handle ${...} expressions
    if (expression.startsWith('${') && expression.endsWith('}')) {
        return expression;
    }

    // Wrap in ${...} if not already wrapped
    return `\${${expression}}`;
}

/**
 * Extract namespace from qualified name
 */
export function extractNamespace(qualifiedName: string): { namespace: string; localName: string } {
    const parts = qualifiedName.split(':');
    if (parts.length === 2) {
        return {
            namespace: parts[0],
            localName: parts[1]
        };
    }
    return {
        namespace: '',
        localName: qualifiedName
    };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as any;
    }

    if (obj instanceof Array) {
        return obj.map(item => deepClone(item)) as any;
    }

    if (obj instanceof Object) {
        const clonedObj = {} as T;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }

    return obj;
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;

    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key] as any, source[key] as any);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

/**
 * Check if value is plain object
 */
function isObject(item: any): item is Record<string, any> {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Get BPMN element type without namespace
 */
export function getBpmnType(elementType: string): string {
    return elementType.replace(/^bpmn:/, '');
}

/**
 * Check if string is valid XML name
 */
export function isValidXmlName(name: string): boolean {
    // XML name must start with letter or underscore
    // and can contain letters, digits, hyphens, underscores, and periods
    const xmlNameRegex = /^[a-zA-Z_][a-zA-Z0-9_.-]*$/;
    return xmlNameRegex.test(name);
}

/**
 * Sanitize string for XML attribute
 */
export function sanitizeXmlAttribute(value: any): string {
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'boolean') {
        return value.toString();
    }

    if (typeof value === 'number') {
        return value.toString();
    }

    return escapeXml(String(value));
} 