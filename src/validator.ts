/**
 * BPMN Validator
 * Validates X6 graph data against BPMN specifications
 */

import { BpmnExportOptions, ValidationResult, ValidationError, ValidationWarning, X6GraphData } from './types';
import { defaultNodeMappings } from './config';

export class BpmnValidator {
    private options: Required<BpmnExportOptions>;

    constructor(options: Required<BpmnExportOptions>) {
        this.options = options;
    }

    /**
     * Validate X6 graph data
     */
    async validate(graphData: X6GraphData): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Run all validations
        this.validateStartEvents(graphData, errors, warnings);
        this.validateEndEvents(graphData, errors, warnings);
        this.validateConnections(graphData, errors, warnings);
        this.validateGateways(graphData, errors, warnings);
        this.validateNodeTypes(graphData, errors, warnings);
        this.validateSequenceFlows(graphData, errors, warnings);

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Set options
     */
    setOptions(options: Required<BpmnExportOptions>): void {
        this.options = options;
    }

    /**
     * Validate start events
     */
    private validateStartEvents(
        graphData: X6GraphData,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        const startEvents = graphData.nodes.filter(node =>
            node.shape === 'bpmn-start-event' ||
            defaultNodeMappings[node.shape] === 'startEvent'
        );

        if (startEvents.length === 0) {
            errors.push({
                message: 'Process must have at least one start event',
                code: 'NO_START_EVENT'
            });
        }

        // Check for multiple start events
        if (startEvents.length > 1) {
            warnings.push({
                message: 'Process has multiple start events',
                code: 'MULTIPLE_START_EVENTS'
            });
        }

        // Validate start event connections
        startEvents.forEach(startEvent => {
            const outgoingEdges = graphData.edges.filter(edge =>
                this.getSourceId(edge) === startEvent.id
            );

            if (outgoingEdges.length === 0) {
                errors.push({
                    nodeId: startEvent.id,
                    message: 'Start event must have at least one outgoing sequence flow',
                    code: 'START_EVENT_NO_OUTGOING'
                });
            }

            const incomingEdges = graphData.edges.filter(edge =>
                this.getTargetId(edge) === startEvent.id
            );

            if (incomingEdges.length > 0) {
                errors.push({
                    nodeId: startEvent.id,
                    message: 'Start event cannot have incoming sequence flows',
                    code: 'START_EVENT_HAS_INCOMING'
                });
            }
        });
    }

    /**
     * Validate end events
     */
    private validateEndEvents(
        graphData: X6GraphData,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        const endEvents = graphData.nodes.filter(node =>
            node.shape === 'bpmn-end-event' ||
            defaultNodeMappings[node.shape] === 'endEvent'
        );

        if (endEvents.length === 0) {
            warnings.push({
                message: 'Process should have at least one end event',
                code: 'NO_END_EVENT'
            });
        }

        // Validate end event connections
        endEvents.forEach(endEvent => {
            const incomingEdges = graphData.edges.filter(edge =>
                this.getTargetId(edge) === endEvent.id
            );

            if (incomingEdges.length === 0) {
                errors.push({
                    nodeId: endEvent.id,
                    message: 'End event must have at least one incoming sequence flow',
                    code: 'END_EVENT_NO_INCOMING'
                });
            }

            const outgoingEdges = graphData.edges.filter(edge =>
                this.getSourceId(edge) === endEvent.id
            );

            if (outgoingEdges.length > 0) {
                errors.push({
                    nodeId: endEvent.id,
                    message: 'End event cannot have outgoing sequence flows',
                    code: 'END_EVENT_HAS_OUTGOING'
                });
            }
        });
    }

    /**
     * Validate connections
     */
    private validateConnections(
        graphData: X6GraphData,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        // Check for disconnected nodes
        graphData.nodes.forEach(node => {
            const hasIncoming = graphData.edges.some(edge =>
                this.getTargetId(edge) === node.id
            );
            const hasOutgoing = graphData.edges.some(edge =>
                this.getSourceId(edge) === node.id
            );

            const isStartEvent = node.shape === 'bpmn-start-event' ||
                defaultNodeMappings[node.shape] === 'startEvent';
            const isEndEvent = node.shape === 'bpmn-end-event' ||
                defaultNodeMappings[node.shape] === 'endEvent';

            if (!isStartEvent && !hasIncoming) {
                warnings.push({
                    nodeId: node.id,
                    message: 'Node has no incoming connections',
                    code: 'NODE_NO_INCOMING'
                });
            }

            if (!isEndEvent && !hasOutgoing) {
                warnings.push({
                    nodeId: node.id,
                    message: 'Node has no outgoing connections',
                    code: 'NODE_NO_OUTGOING'
                });
            }
        });

        // Check for invalid edge connections
        graphData.edges.forEach(edge => {
            const sourceId = this.getSourceId(edge);
            const targetId = this.getTargetId(edge);

            if (!sourceId || !targetId) {
                errors.push({
                    edgeId: edge.id,
                    message: 'Sequence flow must have both source and target',
                    code: 'EDGE_MISSING_CONNECTION'
                });
                return;
            }

            const sourceNode = graphData.nodes.find(n => n.id === sourceId);
            const targetNode = graphData.nodes.find(n => n.id === targetId);

            if (!sourceNode) {
                errors.push({
                    edgeId: edge.id,
                    message: `Source node '${sourceId}' not found`,
                    code: 'EDGE_SOURCE_NOT_FOUND'
                });
            }

            if (!targetNode) {
                errors.push({
                    edgeId: edge.id,
                    message: `Target node '${targetId}' not found`,
                    code: 'EDGE_TARGET_NOT_FOUND'
                });
            }
        });
    }

    /**
     * Validate gateways
     */
    private validateGateways(
        graphData: X6GraphData,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        const gatewayTypes = [
            'bpmn-exclusive-gateway',
            'bpmn-parallel-gateway',
            'bpmn-inclusive-gateway',
            'bpmn-event-gateway'
        ];

        const gateways = graphData.nodes.filter(node =>
            gatewayTypes.includes(node.shape) ||
            ['exclusiveGateway', 'parallelGateway', 'inclusiveGateway', 'eventBasedGateway']
                .includes(defaultNodeMappings[node.shape])
        );

        gateways.forEach(gateway => {
            const incoming = graphData.edges.filter(edge =>
                this.getTargetId(edge) === gateway.id
            );
            const outgoing = graphData.edges.filter(edge =>
                this.getSourceId(edge) === gateway.id
            );

            // Gateways should have at least 1 incoming and 2 outgoing
            if (incoming.length === 0) {
                errors.push({
                    nodeId: gateway.id,
                    message: 'Gateway must have at least one incoming sequence flow',
                    code: 'GATEWAY_NO_INCOMING'
                });
            }

            if (outgoing.length < 2) {
                warnings.push({
                    nodeId: gateway.id,
                    message: 'Gateway should have at least two outgoing sequence flows',
                    code: 'GATEWAY_INSUFFICIENT_OUTGOING'
                });
            }

            // Exclusive gateway validation
            if (gateway.shape === 'bpmn-exclusive-gateway') {
                const hasDefault = gateway.data?.default;
                const conditionalFlows = outgoing.filter(edge =>
                    edge.data?.conditionExpression && edge.id !== hasDefault
                );

                if (outgoing.length > 1 && !hasDefault && conditionalFlows.length < outgoing.length - 1) {
                    warnings.push({
                        nodeId: gateway.id,
                        message: 'Exclusive gateway should have a default flow or all outgoing flows should have conditions',
                        code: 'EXCLUSIVE_GATEWAY_NO_DEFAULT'
                    });
                }
            }
        });
    }

    /**
     * Validate node types
     */
    private validateNodeTypes(
        graphData: X6GraphData,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        graphData.nodes.forEach(node => {
            // Check if node type is recognized
            if (!node.shape || (!defaultNodeMappings[node.shape] && !this.options.customMappings[node.shape])) {
                warnings.push({
                    nodeId: node.id,
                    message: `Unknown node type '${node.shape}'`,
                    code: 'UNKNOWN_NODE_TYPE'
                });
            }

            // Validate required properties for specific node types
            switch (node.shape) {
                case 'bpmn-service-task':
                    if (!node.data?.flowable?.class &&
                        !node.data?.flowable?.delegateExpression &&
                        !node.data?.flowable?.expression) {
                        warnings.push({
                            nodeId: node.id,
                            message: 'Service task should have implementation details (class, delegateExpression, or expression)',
                            code: 'SERVICE_TASK_NO_IMPLEMENTATION'
                        });
                    }
                    break;

                case 'bpmn-script-task':
                    if (!node.data?.script && !node.data?.scriptFormat) {
                        warnings.push({
                            nodeId: node.id,
                            message: 'Script task should have script content',
                            code: 'SCRIPT_TASK_NO_SCRIPT'
                        });
                    }
                    break;

                case 'bpmn-call-activity':
                    if (!node.data?.calledElement) {
                        errors.push({
                            nodeId: node.id,
                            message: 'Call activity must have calledElement attribute',
                            code: 'CALL_ACTIVITY_NO_CALLED_ELEMENT'
                        });
                    }
                    break;
            }
        });
    }

    /**
     * Validate sequence flows
     */
    private validateSequenceFlows(
        graphData: X6GraphData,
        errors: ValidationError[],
        warnings: ValidationWarning[]
    ): void {
        // Check for duplicate flows between same nodes
        const flowPairs = new Set<string>();

        graphData.edges.forEach(edge => {
            const sourceId = this.getSourceId(edge);
            const targetId = this.getTargetId(edge);
            const pairKey = `${sourceId}->${targetId}`;

            if (flowPairs.has(pairKey)) {
                warnings.push({
                    edgeId: edge.id,
                    message: 'Duplicate sequence flow between same nodes',
                    code: 'DUPLICATE_SEQUENCE_FLOW'
                });
            }

            flowPairs.add(pairKey);
        });

        // Validate conditional flows
        graphData.edges.forEach(edge => {
            if (edge.data?.conditionExpression) {
                const sourceId = this.getSourceId(edge);
                const sourceNode = graphData.nodes.find(n => n.id === sourceId);

                // Condition expressions are only valid from gateways and activities
                if (sourceNode && sourceNode.shape === 'bpmn-start-event') {
                    errors.push({
                        edgeId: edge.id,
                        message: 'Start events cannot have conditional sequence flows',
                        code: 'START_EVENT_CONDITIONAL_FLOW'
                    });
                }
            }
        });
    }

    /**
     * Get source ID from edge
     */
    private getSourceId(edge: any): string {
        if (typeof edge.source === 'string') return edge.source;
        return edge.source?.cell || edge.source?.id || '';
    }

    /**
     * Get target ID from edge
     */
    private getTargetId(edge: any): string {
        if (typeof edge.target === 'string') return edge.target;
        return edge.target?.cell || edge.target?.id || '';
    }
} 