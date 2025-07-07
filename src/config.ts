/**
 * Default configuration for BPMN export plugin
 */

import { BpmnExportOptions } from './types';

export const defaultOptions: Required<BpmnExportOptions> = {
    processId: 'Process_1',
    processName: 'Process',
    namespace: 'flowable',
    validateOnExport: true,
    formatXML: true,
    encoding: 'UTF-8',
    customMappings: {},
    includeDiagram: true
};

/**
 * Default node type mappings
 */
export const defaultNodeMappings: Record<string, string> = {
    'bpmn-start-event': 'startEvent',
    'bpmn-end-event': 'endEvent',
    'bpmn-task': 'task',
    'bpmn-service-task': 'serviceTask',
    'bpmn-user-task': 'userTask',
    'bpmn-script-task': 'scriptTask',
    'bpmn-receive-task': 'receiveTask',
    'bpmn-send-task': 'sendTask',
    'bpmn-manual-task': 'manualTask',
    'bpmn-business-rule-task': 'businessRuleTask',
    'bpmn-call-activity': 'callActivity',
    'bpmn-subprocess': 'subProcess',
    'bpmn-exclusive-gateway': 'exclusiveGateway',
    'bpmn-parallel-gateway': 'parallelGateway',
    'bpmn-inclusive-gateway': 'inclusiveGateway',
    'bpmn-event-gateway': 'eventBasedGateway',
    'bpmn-intermediate-event': 'intermediateThrowEvent',
    'bpmn-boundary-event': 'boundaryEvent',
    'bpmn-timer-event': 'timerEventDefinition',
    'bpmn-error-event': 'errorEventDefinition',
    'bpmn-signal-event': 'signalEventDefinition',
    'bpmn-message-event': 'messageEventDefinition',
    'bpmn-compensation-event': 'compensateEventDefinition',
    'bpmn-escalation-event': 'escalationEventDefinition',
    'bpmn-conditional-event': 'conditionalEventDefinition',
    'bpmn-terminate-event': 'terminateEventDefinition'
};

/**
 * Reverse mappings (BPMN to X6)
 */
export const reverseMappings: Record<string, string> = Object.entries(defaultNodeMappings)
    .reduce((acc, [x6Type, bpmnType]) => {
        acc[bpmnType] = x6Type;
        return acc;
    }, {} as Record<string, string>);

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

/**
 * XML declaration
 */
export const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>'; 