/**
 * Default configuration for BPMN Export Plugin
 */

import { BpmnExportOptions } from './types';

/**
 * Default export options
 */
export const defaultOptions: Required<BpmnExportOptions> = {
    targetNamespace: 'http://bpmn.io/schema/bpmn',
    processId: 'Process_1',
    processName: 'Business Process',
    namespace: 'flowable',
    nodeTypeMappings: {},
    includeDI: true,
    format: true
};

/**
 * Supported BPMN element types
 */
export const BPMN_ELEMENT_TYPES = {
    // Start Events
    START_EVENT: 'bpmn:StartEvent',
    START_EVENT_MESSAGE: 'bpmn:StartEvent',
    START_EVENT_TIMER: 'bpmn:StartEvent',
    START_EVENT_SIGNAL: 'bpmn:StartEvent',

    // End Events  
    END_EVENT: 'bpmn:EndEvent',
    END_EVENT_MESSAGE: 'bpmn:EndEvent',
    END_EVENT_ERROR: 'bpmn:EndEvent',
    END_EVENT_TERMINATE: 'bpmn:EndEvent',

    // Intermediate Events
    INTERMEDIATE_EVENT: 'bpmn:IntermediateCatchEvent',
    INTERMEDIATE_THROW_EVENT: 'bpmn:IntermediateThrowEvent',

    // Tasks
    TASK: 'bpmn:Task',
    USER_TASK: 'bpmn:UserTask',
    SERVICE_TASK: 'bpmn:ServiceTask',
    SCRIPT_TASK: 'bpmn:ScriptTask',
    SEND_TASK: 'bpmn:SendTask',
    RECEIVE_TASK: 'bpmn:ReceiveTask',
    MANUAL_TASK: 'bpmn:ManualTask',
    BUSINESS_RULE_TASK: 'bpmn:BusinessRuleTask',

    // Gateways
    EXCLUSIVE_GATEWAY: 'bpmn:ExclusiveGateway',
    INCLUSIVE_GATEWAY: 'bpmn:InclusiveGateway',
    PARALLEL_GATEWAY: 'bpmn:ParallelGateway',
    EVENT_BASED_GATEWAY: 'bpmn:EventBasedGateway',

    // Sub Processes
    SUB_PROCESS: 'bpmn:SubProcess',
    CALL_ACTIVITY: 'bpmn:CallActivity',

    // Data Objects
    DATA_OBJECT: 'bpmn:DataObject',
    DATA_STORE: 'bpmn:DataStoreReference',

    // Sequence Flow
    SEQUENCE_FLOW: 'bpmn:SequenceFlow'
} as const;

/**
 * Default namespace URIs
 */
export const NAMESPACE_URIS = {
    flowable: 'http://flowable.org/bpmn',
    camunda: 'http://camunda.org/schema/1.0/bpmn',
    activiti: 'http://activiti.org/bpmn'
} as const;

/**
 * XML declaration
 */
export const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>';

/**
 * BPMN namespace URIs
 */
export const namespaceUris = {
    bpmn: 'http://www.omg.org/spec/BPMN/20100524/MODEL',
    bpmndi: 'http://www.omg.org/spec/BPMN/20100524/DI',
    dc: 'http://www.omg.org/spec/DD/20100524/DC',
    di: 'http://www.omg.org/spec/DD/20100524/DI',
    xsi: 'http://www.w3.org/2001/XMLSchema-instance',
    flowable: 'http://flowable.org/bpmn',
    camunda: 'http://camunda.org/schema/1.0/bpmn',
    activiti: 'http://activiti.org/bpmn'
};

export const BPMN_NAMESPACES = {
    bpmn: 'http://www.omg.org/spec/BPMN/20100524/MODEL',
    bpmndi: 'http://www.omg.org/spec/BPMN/20100524/DI',
    dc: 'http://www.omg.org/spec/DD/20100524/DC',
    di: 'http://www.omg.org/spec/DD/20100524/DI',
    flowable: 'http://flowable.org/bpmn',
    camunda: 'http://camunda.org/schema/1.0/bpmn',
    activiti: 'http://activiti.org/bpmn'
}; 