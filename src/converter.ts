/**
 * BPMN Converter
 * Handles conversion between X6 graph data and BPMN XML
 */

import { Node, Edge } from '@antv/x6';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
    BpmnExportOptions,
    NodeConverter,
    EdgeConverter,
    X6GraphData,
    BpmnElement,
    BpmnSequenceFlow
} from './types';
import { defaultNodeMappings, reverseMappings, namespaceUris, xmlDeclaration } from './config';
import { XmlBuilder } from './xml-builder';
import { generateId, escapeXml } from './utils';

export class BpmnConverter {
    private options: Required<BpmnExportOptions>;
    private nodeConverters: Map<string, NodeConverter>;
    private edgeConverters: Map<string, EdgeConverter>;
    private bpmnModeler: any;
    private xmlBuilder: XmlBuilder;

    constructor(options: Required<BpmnExportOptions>) {
        this.options = options;
        this.nodeConverters = new Map();
        this.edgeConverters = new Map();
        this.xmlBuilder = new XmlBuilder(options);

        // Initialize bpmn-js modeler for parsing
        this.bpmnModeler = new BpmnModeler({
            container: document.createElement('div')
        });

        // Register default converters
        this.registerDefaultConverters();
    }

    /**
     * Convert X6 graph data to BPMN XML
     */
    async convertToBpmn(graphData: X6GraphData): Promise<string> {
        const { nodes, edges } = graphData;

        // Build XML structure
        const xml = this.xmlBuilder.build({
            processId: this.options.processId,
            processName: this.options.processName,
            nodes: nodes.map(node => this.convertNode(node)),
            edges: edges.map(edge => this.convertEdge(edge)),
            namespace: this.options.namespace
        });

        return xml;
    }

    /**
     * Convert BPMN XML to X6 graph data
     */
    async convertFromBpmn(xml: string): Promise<X6GraphData> {
        // Import XML using bpmn-js
        await this.bpmnModeler.importXML(xml);

        const elementRegistry = this.bpmnModeler.get('elementRegistry');
        const elements = elementRegistry.getAll();

        const nodes: Node.Metadata[] = [];
        const edges: Edge.Metadata[] = [];

        // Process elements
        elements.forEach((element: any) => {
            if (element.type === 'bpmn:SequenceFlow') {
                const edge = this.convertSequenceFlow(element);
                if (edge) edges.push(edge);
            } else if (!this.isInternalType(element)) {
                const node = this.convertBpmnElement(element);
                if (node) nodes.push(node);
            }
        });

        return { nodes, edges };
    }

    /**
     * Register node converter
     */
    registerNodeConverter(nodeType: string, converter: NodeConverter): void {
        this.nodeConverters.set(nodeType, converter);
    }

    /**
     * Register edge converter
     */
    registerEdgeConverter(edgeType: string, converter: EdgeConverter): void {
        this.edgeConverters.set(edgeType, converter);
    }

    /**
     * Set options
     */
    setOptions(options: Required<BpmnExportOptions>): void {
        this.options = options;
        this.xmlBuilder.setOptions(options);
    }

    /**
     * Convert X6 node to BPMN element
     */
    private convertNode(node: Node.Metadata): BpmnElement {
        const { shape, data = {} } = node;

        // Check for custom converter
        if (this.nodeConverters.has(shape)) {
            return this.nodeConverters.get(shape)!.toBpmn(node as Node);
        }

        // Use default mapping
        const bpmnType = this.getBpmnType(shape);
        const element: BpmnElement = {
            type: bpmnType,
            id: node.id || generateId(bpmnType),
            name: data.name
        };

        // Handle attributes
        element.attributes = this.extractNodeAttributes(node, bpmnType);

        // Handle extension elements
        element.extensionElements = this.extractExtensionElements(data);

        return element;
    }

    /**
     * Convert X6 edge to BPMN sequence flow
     */
    private convertEdge(edge: Edge.Metadata): BpmnSequenceFlow {
        const { shape = 'edge', data = {} } = edge;

        // Check for custom converter
        if (this.edgeConverters.has(shape)) {
            return this.edgeConverters.get(shape)!.toBpmn(edge as Edge);
        }

        // Default conversion
        const flow: BpmnSequenceFlow = {
            id: edge.id || generateId('SequenceFlow'),
            name: data.name,
            sourceRef: this.getNodeRef(edge.source),
            targetRef: this.getNodeRef(edge.target),
            conditionExpression: data.conditionExpression
        };

        // Handle attributes
        flow.attributes = this.extractEdgeAttributes(edge);

        // Handle extension elements
        flow.extensionElements = this.extractExtensionElements(data);

        return flow;
    }

    /**
     * Convert BPMN element to X6 node
     */
    private convertBpmnElement(element: any): Node.Metadata | null {
        const bpmnType = element.type.replace('bpmn:', '');
        const x6Shape = reverseMappings[bpmnType] || `bpmn-${bpmnType.toLowerCase()}`;

        // Check for custom converter
        if (this.nodeConverters.has(x6Shape)) {
            const converter = this.nodeConverters.get(x6Shape)!;
            return converter.fromBpmn(this.extractBpmnElement(element));
        }

        // Default conversion
        const node: Node.Metadata = {
            id: element.id,
            shape: x6Shape,
            x: element.x || 0,
            y: element.y || 0,
            width: element.width,
            height: element.height,
            data: {
                name: element.businessObject?.name,
                bpmn: {
                    type: element.type,
                    businessObject: this.extractBusinessObject(element.businessObject)
                }
            }
        };

        return node;
    }

    /**
     * Convert BPMN sequence flow to X6 edge
     */
    private convertSequenceFlow(element: any): Edge.Metadata | null {
        const businessObject = element.businessObject;

        const edge: Edge.Metadata = {
            id: element.id,
            shape: 'edge',
            source: businessObject.sourceRef?.id,
            target: businessObject.targetRef?.id,
            data: {
                name: businessObject.name,
                conditionExpression: businessObject.conditionExpression?.body,
                bpmn: {
                    type: element.type,
                    businessObject: this.extractBusinessObject(businessObject)
                }
            }
        };

        // Handle waypoints for edge routing
        if (element.waypoints) {
            edge.vertices = element.waypoints.map((point: any) => ({
                x: point.x,
                y: point.y
            }));
        }

        return edge;
    }

    /**
     * Register default converters
     */
    private registerDefaultConverters(): void {
        // Add any built-in custom converters here
    }

    /**
     * Get BPMN type from X6 shape
     */
    private getBpmnType(shape: string): string {
        const customMapping = this.options.customMappings[shape];
        if (customMapping) return customMapping;

        return defaultNodeMappings[shape] || 'task';
    }

    /**
     * Extract node attributes
     */
    private extractNodeAttributes(node: Node.Metadata, bpmnType: string): Record<string, any> {
        const { data = {} } = node;
        const attributes: Record<string, any> = {};

        // Handle specific node types
        switch (bpmnType) {
            case 'serviceTask':
                if (data.flowable?.class) attributes['flowable:class'] = data.flowable.class;
                if (data.flowable?.delegateExpression) {
                    attributes['flowable:delegateExpression'] = `\${${data.flowable.delegateExpression}}`;
                }
                if (data.flowable?.expression) attributes['flowable:expression'] = data.flowable.expression;
                if (data.flowable?.resultVariable) attributes['flowable:resultVariable'] = data.flowable.resultVariable;
                break;

            case 'scriptTask':
                if (data.scriptFormat) attributes.scriptFormat = data.scriptFormat;
                if (data.flowable?.autoStoreVariables) {
                    attributes['flowable:autoStoreVariables'] = String(data.flowable.autoStoreVariables);
                }
                break;

            case 'callActivity':
                if (data.calledElement) attributes.calledElement = data.calledElement;
                if (data.flowable?.inheritVariables) {
                    attributes['flowable:inheritVariables'] = String(data.flowable.inheritVariables);
                }
                break;
        }

        // Handle async attributes
        if (data.flowable?.async) {
            attributes['flowable:async'] = 'true';
            attributes['flowable:exclusive'] = data.flowable.exclusive === false ? 'false' : 'true';
        }

        return attributes;
    }

    /**
     * Extract edge attributes
     */
    private extractEdgeAttributes(edge: Edge.Metadata): Record<string, any> {
        const { data = {} } = edge;
        const attributes: Record<string, any> = {};

        // Add any edge-specific attributes here

        return attributes;
    }

    /**
     * Extract extension elements
     */
    private extractExtensionElements(data: any): Record<string, any> {
        const extensions: Record<string, any> = {};

        // Handle execution listeners
        if (data.executionListeners) {
            extensions[`${this.options.namespace}:executionListener`] = data.executionListeners;
        }

        // Handle field injections
        if (data.fields) {
            extensions[`${this.options.namespace}:field`] = data.fields;
        }

        // Handle form properties
        if (data.formProperties) {
            extensions[`${this.options.namespace}:formProperty`] = data.formProperties;
        }

        return extensions;
    }

    /**
     * Extract business object
     */
    private extractBusinessObject(businessObject: any): any {
        if (!businessObject) return {};

        const extracted: Record<string, any> = {};

        // Extract basic properties
        for (const key of Object.keys(businessObject)) {
            if (!key.startsWith('$') && !['di', 'incoming', 'outgoing'].includes(key)) {
                extracted[key] = businessObject[key];
            }
        }

        // Extract namespace attributes
        if (businessObject.$attrs) {
            extracted.attrs = businessObject.$attrs;
        }

        return extracted;
    }

    /**
     * Extract BPMN element for converter
     */
    private extractBpmnElement(element: any): BpmnElement {
        return {
            type: element.type.replace('bpmn:', ''),
            id: element.id,
            name: element.businessObject?.name,
            attributes: element.businessObject?.$attrs || {},
            extensionElements: element.businessObject?.extensionElements?.values || []
        };
    }

    /**
     * Get node reference from edge source/target
     */
    private getNodeRef(ref: any): string {
        if (typeof ref === 'string') return ref;
        if (ref?.cell) return ref.cell;
        if (ref?.id) return ref.id;
        return '';
    }

    /**
     * Check if element is internal type
     */
    private isInternalType(element: any): boolean {
        const internalTypes = ['label', 'connection', 'root', 'bpmn:Process'];
        return internalTypes.some(type =>
            element.type?.includes(type) ||
            element.constructor?.name?.includes('Root')
        );
    }
} 