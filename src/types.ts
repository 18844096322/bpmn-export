/**
 * BPMN Export Plugin Types
 * 专注于X6数据结构定义，BPMN对象模型由bpmn-moddle提供
 */

/**
 * X6 Graph data structure
 */
export interface X6GraphData {
    nodes: X6NodeData[];
    edges: X6EdgeData[];
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
    /** BPMN engine namespace (flowable, camunda, activiti) */
    namespace?: 'flowable' | 'camunda' | 'activiti';
    /** Custom node type mappings */
    nodeTypeMappings?: Record<string, string>;
    /** Include BPMN DI (diagram information) */
    includeDI?: boolean;
    /** Format output XML */
    format?: boolean;
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