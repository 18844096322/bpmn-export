/**
 * Utility functions for BPMN export plugin
 */

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix: string = 'id'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`;
}

/**
 * Parse condition expression and wrap in CDATA if needed
 */
export function parseConditionExpression(expression: string): string {
    if (!expression) return '';

    // Remove ${} wrapping if present
    const cleaned = expression.replace(/^\$\{(.+)\}$/, '$1');

    // Wrap in ${} if not already wrapped
    return cleaned.includes('${') ? expression : `\${${cleaned}}`;
}

/**
 * Format XML with proper indentation
 */
export function formatXML(xml: string, indent: string = '  '): string {
    const reg = /(>)(<)(\/*)/g;
    xml = xml.replace(reg, '$1\n$2$3');

    let formatted = '';
    let pad = 0;

    xml.split('\n').forEach((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
            indent = 0;
        } else if (node.match(/^<\/\w/)) {
            if (pad !== 0) {
                pad -= 1;
            }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
            indent = 1;
        } else {
            indent = 0;
        }

        const padding = Array(pad).fill(indent).join('');
        formatted += padding + node + '\n';
        pad += indent;
    });

    return formatted.trim();
}

/**
 * Escape XML characters
 */
export function escapeXML(str: string): string {
    if (!str) return '';

    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Unescape XML characters
 */
export function unescapeXML(str: string): string {
    if (!str) return '';

    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Deep clone an object
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

    if (typeof obj === 'object') {
        const cloned: any = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone((obj as any)[key]);
        });
        return cloned;
    }

    return obj;
}

/**
 * Check if a string is valid XML name
 */
export function isValidXMLName(name: string): boolean {
    if (!name) return false;

    // XML name pattern: must start with letter or underscore,
    // followed by letters, digits, hyphens, periods, or underscores
    const xmlNamePattern = /^[a-zA-Z_][a-zA-Z0-9._-]*$/;
    return xmlNamePattern.test(name);
}

/**
 * Sanitize string for use as XML ID
 */
export function sanitizeXMLId(id: string): string {
    if (!id) return generateId();

    // Replace invalid characters with underscores
    let sanitized = id.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Ensure it starts with a letter or underscore
    if (!/^[a-zA-Z_]/.test(sanitized)) {
        sanitized = '_' + sanitized;
    }

    return sanitized;
}

/**
 * Extract flowable attributes from data
 */
export function extractFlowableAttributes(flowableData: any, taskType?: string): Record<string, string> {
    if (!flowableData) return {};

    const attributes: Record<string, string> = {};

    // Common flowable attributes
    if (flowableData.delegateExpression) {
        attributes['flowable:delegateExpression'] = flowableData.delegateExpression;
    }

    if (flowableData.class) {
        attributes['flowable:class'] = flowableData.class;
    }

    if (flowableData.expression) {
        attributes['flowable:expression'] = flowableData.expression;
    }

    if (flowableData.async === true) {
        attributes['flowable:async'] = 'true';
    }

    if (flowableData.exclusive === false) {
        attributes['flowable:exclusive'] = 'false';
    }

    // Task-specific attributes
    if (taskType === 'user') {
        if (flowableData.assignee) {
            attributes['flowable:assignee'] = flowableData.assignee;
        }

        if (flowableData.candidateUsers) {
            attributes['flowable:candidateUsers'] = flowableData.candidateUsers;
        }

        if (flowableData.candidateGroups) {
            attributes['flowable:candidateGroups'] = flowableData.candidateGroups;
        }

        if (flowableData.formKey) {
            attributes['flowable:formKey'] = flowableData.formKey;
        }

        if (flowableData.dueDate) {
            attributes['flowable:dueDate'] = flowableData.dueDate;
        }

        if (flowableData.priority) {
            attributes['flowable:priority'] = flowableData.priority;
        }
    }

    return attributes;
}

/**
 * Parse flowable attributes from BPMN element
 */
export function parseFlowableAttributes(attributes: Record<string, any>): any {
    if (!attributes) return {};

    const flowable: any = {};

    Object.keys(attributes).forEach(key => {
        if (key.startsWith('flowable:')) {
            const flowableKey = key.substring(9); // Remove 'flowable:' prefix
            flowable[flowableKey] = attributes[key];
        }
    });

    // Convert string boolean values
    if (flowable.async === 'true') {
        flowable.async = true;
    } else if (flowable.async === 'false') {
        flowable.async = false;
    }

    if (flowable.exclusive === 'false') {
        flowable.exclusive = false;
    } else if (flowable.exclusive === 'true') {
        flowable.exclusive = true;
    }

    return flowable;
}

/**
 * Extract user task attributes
 */
export function extractUserTaskAttributes(data: any): Record<string, string> {
    if (!data) return {};

    const attributes: Record<string, string> = {};

    if (data.assignee) {
        attributes['flowable:assignee'] = data.assignee;
    }

    if (data.candidateUsers) {
        attributes['flowable:candidateUsers'] = data.candidateUsers;
    }

    if (data.candidateGroups) {
        attributes['flowable:candidateGroups'] = data.candidateGroups;
    }

    return attributes;
}

/**
 * Parse user task attributes
 */
export function parseUserTaskAttributes(attributes: Record<string, any>): any {
    if (!attributes) return {};

    const userData: any = {};

    if (attributes['flowable:assignee']) {
        userData.assignee = attributes['flowable:assignee'];
    }

    if (attributes['flowable:candidateUsers']) {
        userData.candidateUsers = attributes['flowable:candidateUsers'];
    }

    if (attributes['flowable:candidateGroups']) {
        userData.candidateGroups = attributes['flowable:candidateGroups'];
    }

    return userData;
}

/**
 * Get edge reference from cell
 */
export function getEdgeRef(cell: any): string {
    return cell?.id || '';
}

/**
 * Validate BPMN process structure
 */
export function validateProcessStructure(nodes: any[], edges: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for start events
    const startEvents = nodes.filter(n => n.shape?.includes('start-event'));
    if (startEvents.length === 0) {
        errors.push('Process must have at least one start event');
    }

    // Check for end events
    const endEvents = nodes.filter(n => n.shape?.includes('end-event'));
    if (endEvents.length === 0) {
        errors.push('Process should have at least one end event');
    }

    // Check for orphaned nodes (no incoming or outgoing connections)
    nodes.forEach(node => {
        const hasIncoming = edges.some(e => e.target === node.id);
        const hasOutgoing = edges.some(e => e.source === node.id);

        if (!hasIncoming && !node.shape?.includes('start-event')) {
            errors.push(`Node "${node.data?.name || node.id}" has no incoming connections`);
        }

        if (!hasOutgoing && !node.shape?.includes('end-event')) {
            errors.push(`Node "${node.data?.name || node.id}" has no outgoing connections`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Calculate bounds for BPMN diagram
 */
export function calculateBounds(nodes: any[], padding: number = 50): { x: number; y: number; width: number; height: number } {
    if (nodes.length === 0) {
        return { x: 0, y: 0, width: 500, height: 300 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
        const x = node.x || 0;
        const y = node.y || 0;
        const width = node.width || 100;
        const height = node.height || 80;

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    });

    return {
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + 2 * padding,
        height: maxY - minY + 2 * padding
    };
} 