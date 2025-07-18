/**
 * BPMN Export Plugin Types
 * 专注于X6数据结构定义，BPMN对象模型由bpmn-moddle提供
 */

/**
 * Global event definitions
 */
export interface GlobalEvents {
    messages?: Array<{ id: string; name: string; itemRef?: string }>;
    errors?: Array<{ id: string; name: string; errorCode?: string; structureRef?: string }>;
    signals?: Array<{ id: string; name: string; structureRef?: string }>;
    escalations?: Array<{ id: string; name: string; escalationCode?: string; structureRef?: string }>;
}

/**
 * Process properties extracted from BPMN
 */
export interface ProcessProperties {
    documentation?: string;
    executionListeners?: Array<{
        $type: string;
        event: string;
        class?: string;
        expression?: string;
        delegateExpression?: string;
    }>;
    eventListeners?: Array<{
        $type: string;
        event: string;
        class?: string;
        expression?: string;
        delegateExpression?: string;
    }>;
    dataObjects?: Array<{
        id: string;
        name: string;
        itemSubjectRef?: string;
        isCollection?: boolean;
    }>;
    extensionProperties?: Array<{
        name: string;
        value: string;
    }>;
}

/**
 * X6 Graph data structure
 */
export interface X6GraphData {
    nodes: X6NodeData[];
    edges: X6EdgeData[];
    globalEvents?: GlobalEvents;
    processProperties?: ProcessProperties;
}

/**
 * X6 Node data structure
 */
export interface X6NodeData {
    id: string;
    shape?: string;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    label?: string;
    data?: {
        name?: string;
        [key: string]: any;
        // BPMN engine specific data
        flowable?: Record<string, any>;
        camunda?: Record<string, any>;
        activiti?: Record<string, any>;
    };
}

/**
 * X6 Edge data structure
 */
export interface X6EdgeData {
    id: string;
    source: string;
    target: string;
    shape?: string;
    label?: string;
    data?: {
        name?: string;
        conditionExpression?: string;
        [key: string]: any;
    };
}

/**
 * BPMN Export options
 */
export interface BpmnExportOptions {
    /** Target namespace for BPMN definitions */
    targetNamespace?: string;
    /** Process ID */
    processId?: string;
    /** Process name */
    processName?: string;
    /** Whether the process is executable */
    isExecutable?: boolean;
    /** BPMN engine namespace (flowable, camunda, activiti) */
    namespace?: 'flowable' | 'camunda' | 'activiti';
    /** Custom node type mappings */
    nodeTypeMappings?: Record<string, string>;
    /** Include BPMN DI (diagram information) */
    includeDI?: boolean;
    /** Format output XML */
    format?: boolean;
    /** Process documentation */
    documentation?: string;
    /** Process execution listeners */
    executionListeners?: Array<{
        $type: string;
        event: string;
        class?: string;
        expression?: string;
        delegateExpression?: string;
    }>;
    /** Process event listeners */
    eventListeners?: Array<{
        $type: string;
        event: string;
        class?: string;
        expression?: string;
        delegateExpression?: string;
    }>;
    /** Data objects */
    dataObjects?: Array<{
        id: string;
        name: string;
        itemSubjectRef?: string;
        isCollection?: boolean;
    }>;
    /** Extension properties */
    extensionProperties?: Array<{
        name: string;
        value: string;
    }>;
}

/**
 * Node converter interface for custom conversions
 */
export interface NodeConverter {
    toBpmn(node: X6NodeData, moddle: any): any;
    fromBpmn(bpmnElement: any, moddle: any): Partial<X6NodeData>;
}

/**
 * Edge converter interface for custom conversions  
 */
export interface EdgeConverter {
    toBpmn(edge: X6EdgeData, moddle: any): any;
    fromBpmn(bpmnElement: any, moddle: any): Partial<X6EdgeData>;
}

/**
 * Conversion result
 */
export interface ConversionResult {
    /** Converted data */
    data: string | X6GraphData;
    /** Conversion warnings */
    warnings?: string[];
    /** Referenced elements by ID */
    elementsById?: Record<string, any>;
}

/**
 * BPMN element position information for diagram
 */
export interface BpmnElementBounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * BPMN waypoint for sequence flows
 */
export interface BpmnWaypoint {
    x: number;
    y: number;
}

/**
 * Defines the structure for multi-instance loop characteristics.
 * This corresponds to the bpmn:MultiInstanceLoopCharacteristics element.
 */
export interface LoopCharacteristics {
    isSequential?: boolean;
    collection?: string;
    elementVariable?: string;
    loopCardinality?: string;
    completionCondition?: string;
} 