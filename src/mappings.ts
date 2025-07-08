/**
 * Node and Edge type mappings for BPMN conversion
 */

/**
 * X6 shape to BPMN element type mappings
 */
export const DEFAULT_NODE_MAPPINGS: Record<string, string> = {
    // Start Events
    'bpmn-start-event': 'bpmn:StartEvent',
    'bpmn-start-message-event': 'bpmn:StartEvent',
    'bpmn-start-timer-event': 'bpmn:StartEvent',
    'bpmn-start-signal-event': 'bpmn:StartEvent',

    // End Events
    'bpmn-end-event': 'bpmn:EndEvent',
    'bpmn-end-message-event': 'bpmn:EndEvent',
    'bpmn-end-error-event': 'bpmn:EndEvent',
    'bpmn-end-terminate-event': 'bpmn:EndEvent',

    // Intermediate Events
    'bpmn-intermediate-event': 'bpmn:IntermediateCatchEvent',
    'bpmn-intermediate-throw-event': 'bpmn:IntermediateThrowEvent',
    'bpmn-boundary-event': 'bpmn:BoundaryEvent',

    // Tasks
    'bpmn-task': 'bpmn:Task',
    'bpmn-user-task': 'bpmn:UserTask',
    'bpmn-service-task': 'bpmn:ServiceTask',
    'bpmn-script-task': 'bpmn:ScriptTask',
    'bpmn-send-task': 'bpmn:SendTask',
    'bpmn-receive-task': 'bpmn:ReceiveTask',
    'bpmn-manual-task': 'bpmn:ManualTask',
    'bpmn-business-rule-task': 'bpmn:BusinessRuleTask',
    'bpmn-call-activity': 'bpmn:CallActivity',

    // Gateways
    'bpmn-exclusive-gateway': 'bpmn:ExclusiveGateway',
    'bpmn-inclusive-gateway': 'bpmn:InclusiveGateway',
    'bpmn-parallel-gateway': 'bpmn:ParallelGateway',
    'bpmn-event-based-gateway': 'bpmn:EventBasedGateway',

    // Sub Processes
    'bpmn-subprocess': 'bpmn:SubProcess',

    // Data Objects
    'bpmn-data-object': 'bpmn:DataObject',
    'bpmn-data-store': 'bpmn:DataStoreReference'
};

/**
 * BPMN element type to X6 shape mappings
 */
export const DEFAULT_BPMN_TO_X6_MAPPINGS: Record<string, string> = {
    // Start Events
    'StartEvent': 'bpmn-start-event',

    // End Events
    'EndEvent': 'bpmn-end-event',

    // Intermediate Events
    'IntermediateCatchEvent': 'bpmn-intermediate-event',
    'IntermediateThrowEvent': 'bpmn-intermediate-throw-event',
    'BoundaryEvent': 'bpmn-boundary-event',

    // Tasks
    'Task': 'bpmn-task',
    'UserTask': 'bpmn-user-task',
    'ServiceTask': 'bpmn-service-task',
    'ScriptTask': 'bpmn-script-task',
    'SendTask': 'bpmn-send-task',
    'ReceiveTask': 'bpmn-receive-task',
    'ManualTask': 'bpmn-manual-task',
    'BusinessRuleTask': 'bpmn-business-rule-task',
    'CallActivity': 'bpmn-call-activity',

    // Gateways
    'ExclusiveGateway': 'bpmn-exclusive-gateway',
    'InclusiveGateway': 'bpmn-inclusive-gateway',
    'ParallelGateway': 'bpmn-parallel-gateway',
    'EventBasedGateway': 'bpmn-event-based-gateway',

    // Sub Processes
    'SubProcess': 'bpmn-subprocess',

    // Data Objects
    'DataObject': 'bpmn-data-object',
    'DataStoreReference': 'bpmn-data-store'
};

/**
 * Default edge mappings
 */
export const DEFAULT_EDGE_MAPPINGS: Record<string, string> = {
    'edge': 'sequenceFlow',
    'bpmn-sequence-flow': 'sequenceFlow',
    'bpmn-message-flow': 'messageFlow',
    'bpmn-association': 'association'
}; 