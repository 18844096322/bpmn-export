/**
 * Node and Edge mappings for BPMN export
 */

import { NodeConverter, EdgeConverter } from './types';
import { generateId, parseConditionExpression } from './utils';

/**
 * Default node converters
 */
export const defaultNodeConverters: Record<string, NodeConverter> = {
    'bpmn-service-task': {
        toBpmn: (node) => ({
            type: 'serviceTask',
            id: node.id || generateId('ServiceTask'),
            name: node.getData()?.name,
            attributes: {
                ...extractFlowableAttributes(node.getData()?.flowable, 'service')
            },
            extensionElements: extractExtensionElements(node.getData())
        }),
        fromBpmn: (element) => ({
            shape: 'bpmn-service-task',
            data: {
                name: element.name,
                flowable: parseFlowableAttributes(element.attributes)
            }
        })
    },

    'bpmn-script-task': {
        toBpmn: (node) => ({
            type: 'scriptTask',
            id: node.id || generateId('ScriptTask'),
            name: node.getData()?.name,
            attributes: {
                scriptFormat: node.getData()?.scriptFormat || 'javascript',
                ...extractFlowableAttributes(node.getData()?.flowable, 'script')
            },
            extensionElements: extractExtensionElements(node.getData())
        }),
        fromBpmn: (element) => ({
            shape: 'bpmn-script-task',
            data: {
                name: element.name,
                scriptFormat: element.attributes?.scriptFormat,
                flowable: parseFlowableAttributes(element.attributes)
            }
        })
    },

    'bpmn-user-task': {
        toBpmn: (node) => ({
            type: 'userTask',
            id: node.id || generateId('UserTask'),
            name: node.getData()?.name,
            attributes: {
                ...extractUserTaskAttributes(node.getData()),
                ...extractFlowableAttributes(node.getData()?.flowable, 'user')
            },
            extensionElements: extractExtensionElements(node.getData())
        }),
        fromBpmn: (element) => ({
            shape: 'bpmn-user-task',
            data: {
                name: element.name,
                ...parseUserTaskAttributes(element.attributes),
                flowable: parseFlowableAttributes(element.attributes)
            }
        })
    },

    'bpmn-exclusive-gateway': {
        toBpmn: (node) => ({
            type: 'exclusiveGateway',
            id: node.id || generateId('ExclusiveGateway'),
            name: node.getData()?.name,
            attributes: {
                default: node.getData()?.default
            },
            extensionElements: extractExtensionElements(node.getData())
        }),
        fromBpmn: (element) => ({
            shape: 'bpmn-exclusive-gateway',
            data: {
                name: element.name,
                default: element.attributes?.default
            }
        })
    }
};

/**
 * Default edge converters
 */
export const defaultEdgeConverters: Record<string, EdgeConverter> = {
    'edge': {
        toBpmn: (edge) => ({
            id: edge.id || generateId('SequenceFlow'),
            name: edge.getData()?.name,
            sourceRef: getEdgeRef(edge.getSourceCell()),
            targetRef: getEdgeRef(edge.getTargetCell()),
            conditionExpression: edge.getData()?.conditionExpression ?
                parseConditionExpression(edge.getData().conditionExpression) : undefined,
            extensionElements: extractExtensionElements(edge.getData())
        }),
        fromBpmn: (flow) => ({
            shape: 'edge',
            source: flow.sourceRef,
            target: flow.targetRef,
            data: {
                name: flow.name,
                conditionExpression: flow.conditionExpression
            }
        })
    }
};

/**
 * Extract Flowable attributes
 */
function extractFlowableAttributes(flowable: any, taskType: string): Record<string, string> {
    if (!flowable) return {};

    const attrs: Record<string, string> = {};

    // Common attributes
    if (flowable.async) {
        attrs['flowable:async'] = 'true';
        attrs['flowable:exclusive'] = flowable.exclusive === false ? 'false' : 'true';
    }

    // Service task attributes
    if (taskType === 'service') {
        if (flowable.class) attrs['flowable:class'] = flowable.class;
        if (flowable.delegateExpression) {
            attrs['flowable:delegateExpression'] = `\${${flowable.delegateExpression.replace(/^\${|}$/g, '')}}`;
        }
        if (flowable.expression) attrs['flowable:expression'] = flowable.expression;
        if (flowable.resultVariable) attrs['flowable:resultVariable'] = flowable.resultVariable;
        if (flowable.useLocalScopeForResultVariable) {
            attrs['flowable:useLocalScopeForResultVariable'] = 'true';
        }
    }

    // Script task attributes
    if (taskType === 'script' && flowable.autoStoreVariables) {
        attrs['flowable:autoStoreVariables'] = 'true';
    }

    // User task attributes
    if (taskType === 'user') {
        if (flowable.formKey) attrs['flowable:formKey'] = flowable.formKey;
        if (flowable.formFieldValidation) attrs['flowable:formFieldValidation'] = flowable.formFieldValidation;
        if (flowable.assignee) attrs['flowable:assignee'] = flowable.assignee;
        if (flowable.candidateUsers) attrs['flowable:candidateUsers'] = flowable.candidateUsers;
        if (flowable.candidateGroups) attrs['flowable:candidateGroups'] = flowable.candidateGroups;
        if (flowable.dueDate) attrs['flowable:dueDate'] = flowable.dueDate;
        if (flowable.priority) attrs['flowable:priority'] = String(flowable.priority);
    }

    return attrs;
}

/**
 * Parse Flowable attributes
 */
function parseFlowableAttributes(attributes: any): any {
    if (!attributes) return {};

    const flowable: any = {};

    for (const [key, value] of Object.entries(attributes)) {
        if (key.startsWith('flowable:')) {
            const attrName = key.replace('flowable:', '');

            switch (attrName) {
                case 'async':
                    flowable.async = value === 'true';
                    break;
                case 'exclusive':
                    flowable.exclusive = value === 'true';
                    break;
                case 'delegateExpression':
                    flowable.delegateExpression = String(value).replace(/^\${|}$/g, '');
                    break;
                case 'autoStoreVariables':
                    flowable.autoStoreVariables = value === 'true';
                    break;
                case 'useLocalScopeForResultVariable':
                    flowable.useLocalScopeForResultVariable = value === 'true';
                    break;
                default:
                    flowable[attrName] = value;
            }
        }
    }

    return flowable;
}

/**
 * Extract user task attributes
 */
function extractUserTaskAttributes(data: any): Record<string, string> {
    const attrs: Record<string, string> = {};

    if (data?.formKey) attrs.formKey = data.formKey;
    if (data?.assignee) attrs.assignee = data.assignee;
    if (data?.candidateUsers) attrs.candidateUsers = data.candidateUsers;
    if (data?.candidateGroups) attrs.candidateGroups = data.candidateGroups;
    if (data?.dueDate) attrs.dueDate = data.dueDate;
    if (data?.priority) attrs.priority = String(data.priority);

    return attrs;
}

/**
 * Parse user task attributes
 */
function parseUserTaskAttributes(attributes: any): any {
    const parsed: any = {};

    if (attributes?.formKey) parsed.formKey = attributes.formKey;
    if (attributes?.assignee) parsed.assignee = attributes.assignee;
    if (attributes?.candidateUsers) parsed.candidateUsers = attributes.candidateUsers;
    if (attributes?.candidateGroups) parsed.candidateGroups = attributes.candidateGroups;
    if (attributes?.dueDate) parsed.dueDate = attributes.dueDate;
    if (attributes?.priority) parsed.priority = parseInt(attributes.priority);

    return parsed;
}

/**
 * Extract extension elements
 */
function extractExtensionElements(data: any): Record<string, any> {
    const extensions: Record<string, any> = {};

    // Execution listeners
    if (data?.executionListeners && data.executionListeners.length > 0) {
        extensions['flowable:executionListener'] = data.executionListeners.map((listener: any) => ({
            event: listener.event,
            class: listener.class,
            expression: listener.expression,
            delegateExpression: listener.delegateExpression
        }));
    }

    // Field injections
    if (data?.fields && data.fields.length > 0) {
        extensions['flowable:field'] = data.fields.map((field: any) => ({
            name: field.name,
            string: field.string ? { $body: field.string } : undefined,
            expression: field.expression ? { $body: field.expression } : undefined
        }));
    }

    // Form properties
    if (data?.formProperties && data.formProperties.length > 0) {
        extensions['flowable:formProperty'] = data.formProperties.map((prop: any) => ({
            id: prop.id,
            name: prop.name,
            type: prop.type,
            expression: prop.expression,
            variable: prop.variable,
            default: prop.default,
            required: prop.required
        }));
    }

    return extensions;
}

/**
 * Get edge reference
 */
function getEdgeRef(cell: any): string {
    if (!cell) return '';
    if (typeof cell === 'string') return cell;
    return cell.id || '';
} 