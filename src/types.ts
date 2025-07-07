/**
 * Type definitions for @x6-plugin/bpmn-export
 */

import { Node, Edge } from '@antv/x6';

/**
 * Supported BPMN engines
 */
export type BpmnEngine = 'flowable' | 'camunda' | 'activiti';

/**
 * Plugin options
 */
export interface BpmnExportOptions {
    /** Process ID (default: 'Process_1') */
    processId?: string;

    /** Process name (default: 'Process') */
    processName?: string;

    /** Target BPMN engine (default: 'flowable') */
    namespace?: BpmnEngine;

    /** Validate graph before export (default: true) */
    validateOnExport?: boolean;

    /** Format XML output (default: true) */
    formatXML?: boolean;

    /** XML encoding (default: 'UTF-8') */
    encoding?: string;

    /** Custom node type mappings */
    customMappings?: Record<string, string>;

    /** Include diagram information (default: true) */
    includeDiagram?: boolean;
}

/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
    nodeId?: string;
    edgeId?: string;
    message: string;
    code: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
    nodeId?: string;
    edgeId?: string;
    message: string;
    code: string;
}

/**
 * BPMN node data
 */
export interface BpmnNodeData {
    /** Node name */
    name?: string;

    /** BPMN specific data */
    bpmn?: {
        type?: string;
        [key: string]: any;
    };

    /** Flowable extensions */
    flowable?: FlowableExtensions;

    /** Camunda extensions */
    camunda?: CamundaExtensions;

    /** Activiti extensions */
    activiti?: ActivitiExtensions;

    /** Other properties */
    [key: string]: any;
}

/**
 * Flowable extensions
 */
export interface FlowableExtensions {
    async?: boolean;
    exclusive?: boolean;
    delegateExpression?: string;
    class?: string;
    expression?: string;
    resultVariable?: string;
    skipExpression?: string;
    triggerable?: boolean;
    autoStoreVariables?: boolean;
    useLocalScopeForResultVariable?: boolean;
    [key: string]: any;
}

/**
 * Camunda extensions
 */
export interface CamundaExtensions {
    asyncBefore?: boolean;
    asyncAfter?: boolean;
    exclusive?: boolean;
    jobPriority?: number;
    retryTimeCycle?: string;
    class?: string;
    delegateExpression?: string;
    expression?: string;
    resultVariable?: string;
    [key: string]: any;
}

/**
 * Activiti extensions
 */
export interface ActivitiExtensions {
    async?: boolean;
    exclusive?: boolean;
    class?: string;
    delegateExpression?: string;
    expression?: string;
    resultVariable?: string;
    [key: string]: any;
}

/**
 * Node converter interface
 */
export interface NodeConverter {
    /** Convert X6 node to BPMN element */
    toBpmn: (node: Node) => BpmnElement;

    /** Convert BPMN element to X6 node */
    fromBpmn: (element: BpmnElement) => Partial<Node.Metadata>;
}

/**
 * Edge converter interface
 */
export interface EdgeConverter {
    /** Convert X6 edge to BPMN sequence flow */
    toBpmn: (edge: Edge) => BpmnSequenceFlow;

    /** Convert BPMN sequence flow to X6 edge */
    fromBpmn: (flow: BpmnSequenceFlow) => Partial<Edge.Metadata>;
}

/**
 * BPMN element representation
 */
export interface BpmnElement {
    type: string;
    id: string;
    name?: string;
    attributes?: Record<string, any>;
    children?: BpmnElement[];
    extensionElements?: Record<string, any>;
}

/**
 * BPMN sequence flow representation
 */
export interface BpmnSequenceFlow {
    id: string;
    name?: string;
    sourceRef: string;
    targetRef: string;
    conditionExpression?: string;
    attributes?: Record<string, any>;
    extensionElements?: Record<string, any>;
}

/**
 * X6 graph data format
 */
export interface X6GraphData {
    nodes: Node.Metadata[];
    edges: Edge.Metadata[];
}

/**
 * XML builder options
 */
export interface XmlBuilderOptions {
    indent?: string;
    newline?: string;
    encoding?: string;
    standalone?: boolean;
}

/**
 * Extension element
 */
export interface ExtensionElement {
    $type: string;
    [key: string]: any;
} 