/**
 * XML Builder for BPMN
 * Constructs BPMN XML from structured data
 */

import { BpmnExportOptions, BpmnElement, BpmnSequenceFlow } from './types';
import { namespaceUris, xmlDeclaration } from './config';
import { escapeXml, formatXml, sanitizeXmlAttribute } from './utils';

interface BuildOptions {
    processId: string;
    processName: string;
    nodes: BpmnElement[];
    edges: BpmnSequenceFlow[];
    namespace: string;
}

export class XmlBuilder {
    private options: Required<BpmnExportOptions>;
    private namespaces: Map<string, string>;

    constructor(options: Required<BpmnExportOptions>) {
        this.options = options;
        this.namespaces = new Map();
        this.initNamespaces();
    }

    /**
     * Build BPMN XML
     */
    build(buildOptions: BuildOptions): string {
        const { processId, processName, nodes, edges, namespace } = buildOptions;

        // Build XML structure
        let xml = xmlDeclaration + '\n';
        xml += this.buildDefinitions(processId, processName, nodes, edges);

        // Format if required
        if (this.options.formatXML) {
            xml = formatXml(xml);
        }

        return xml;
    }

    /**
     * Set options
     */
    setOptions(options: Required<BpmnExportOptions>): void {
        this.options = options;
    }

    /**
     * Initialize namespaces
     */
    private initNamespaces(): void {
        this.namespaces.set('', namespaceUris.bpmn);
        this.namespaces.set('bpmndi', namespaceUris.bpmndi);
        this.namespaces.set('dc', namespaceUris.dc);
        this.namespaces.set('di', namespaceUris.di);
        this.namespaces.set('xsi', namespaceUris.xsi);

        // Add engine-specific namespace
        if (this.options.namespace) {
            this.namespaces.set(this.options.namespace, namespaceUris[this.options.namespace]);
        }
    }

    /**
     * Build definitions element
     */
    private buildDefinitions(
        processId: string,
        processName: string,
        nodes: BpmnElement[],
        edges: BpmnSequenceFlow[]
    ): string {
        let xml = '<definitions';

        // Add namespace declarations
        for (const [prefix, uri] of this.namespaces) {
            if (prefix) {
                xml += ` xmlns:${prefix}="${uri}"`;
            } else {
                xml += ` xmlns="${uri}"`;
            }
        }

        xml += ` targetNamespace="http://www.flowable.org/processdef"`;
        xml += '>';

        // Add process
        xml += this.buildProcess(processId, processName, nodes, edges);

        // Add diagram if required
        if (this.options.includeDiagram) {
            xml += this.buildDiagram(processId, nodes, edges);
        }

        xml += '</definitions>';

        return xml;
    }

    /**
     * Build process element
     */
    private buildProcess(
        processId: string,
        processName: string,
        nodes: BpmnElement[],
        edges: BpmnSequenceFlow[]
    ): string {
        let xml = `<process id="${escapeXml(processId)}" name="${escapeXml(processName)}"`;

        // Add engine-specific attributes
        if (this.options.namespace === 'flowable') {
            xml += ' flowable:exclusive="false"';
        }

        xml += '>';

        // Add nodes
        for (const node of nodes) {
            xml += this.buildNode(node, edges);
        }

        // Add edges
        for (const edge of edges) {
            xml += this.buildSequenceFlow(edge);
        }

        xml += '</process>';

        return xml;
    }

    /**
     * Build node element
     */
    private buildNode(node: BpmnElement, edges: BpmnSequenceFlow[]): string {
        const { type, id, name, attributes = {}, extensionElements = {} } = node;

        // Build element
        let xml = `<${type} id="${escapeXml(id)}"`;

        if (name) {
            xml += ` name="${escapeXml(name)}"`;
        }

        // Add attributes
        for (const [key, value] of Object.entries(attributes)) {
            xml += ` ${key}="${sanitizeXmlAttribute(value)}"`;
        }

        // Check if element has children
        const hasExtensions = Object.keys(extensionElements).length > 0;
        const incoming = edges.filter(e => e.targetRef === id);
        const outgoing = edges.filter(e => e.sourceRef === id);
        const hasFlows = incoming.length > 0 || outgoing.length > 0;

        if (hasExtensions || hasFlows || this.hasNodeChildren(type)) {
            xml += '>';

            // Add extension elements
            if (hasExtensions) {
                xml += this.buildExtensionElements(extensionElements);
            }

            // Add incoming/outgoing flows
            for (const flow of incoming) {
                xml += `<incoming>${escapeXml(flow.id)}</incoming>`;
            }

            for (const flow of outgoing) {
                xml += `<outgoing>${escapeXml(flow.id)}</outgoing>`;
            }

            // Add type-specific children
            xml += this.buildNodeChildren(node);

            xml += `</${type}>`;
        } else {
            xml += '/>';
        }

        return xml;
    }

    /**
     * Build sequence flow element
     */
    private buildSequenceFlow(flow: BpmnSequenceFlow): string {
        const { id, name, sourceRef, targetRef, conditionExpression, attributes = {}, extensionElements = {} } = flow;

        let xml = `<sequenceFlow id="${escapeXml(id)}"`;

        if (name) {
            xml += ` name="${escapeXml(name)}"`;
        }

        xml += ` sourceRef="${escapeXml(sourceRef)}"`;
        xml += ` targetRef="${escapeXml(targetRef)}"`;

        // Add attributes
        for (const [key, value] of Object.entries(attributes)) {
            xml += ` ${key}="${sanitizeXmlAttribute(value)}"`;
        }

        // Check if has children
        const hasExtensions = Object.keys(extensionElements).length > 0;

        if (conditionExpression || hasExtensions) {
            xml += '>';

            // Add extension elements
            if (hasExtensions) {
                xml += this.buildExtensionElements(extensionElements);
            }

            // Add condition expression
            if (conditionExpression) {
                xml += this.buildConditionExpression(conditionExpression);
            }

            xml += '</sequenceFlow>';
        } else {
            xml += '/>';
        }

        return xml;
    }

    /**
     * Build extension elements
     */
    private buildExtensionElements(extensionElements: Record<string, any>): string {
        if (Object.keys(extensionElements).length === 0) {
            return '';
        }

        let xml = '<extensionElements>';

        for (const [key, value] of Object.entries(extensionElements)) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    xml += this.buildExtensionElement(key, item);
                }
            } else {
                xml += this.buildExtensionElement(key, value);
            }
        }

        xml += '</extensionElements>';

        return xml;
    }

    /**
     * Build single extension element
     */
    private buildExtensionElement(elementName: string, data: any): string {
        if (!data) return '';

        let xml = `<${elementName}`;

        // Handle attributes
        if (typeof data === 'object' && !Array.isArray(data)) {
            const { $body, ...attributes } = data;

            // Add attributes
            for (const [key, value] of Object.entries(attributes)) {
                if (!key.startsWith('$')) {
                    xml += ` ${key}="${sanitizeXmlAttribute(value)}"`;
                }
            }

            // Check if has body content
            if ($body) {
                xml += `>${escapeXml($body)}</${elementName}>`;
            } else {
                xml += '/>';
            }
        } else {
            // Simple value
            xml += `>${escapeXml(String(data))}</${elementName}>`;
        }

        return xml;
    }

    /**
     * Build condition expression
     */
    private buildConditionExpression(expression: string): string {
        return `<conditionExpression xsi:type="tFormalExpression">${escapeXml(expression)}</conditionExpression>`;
    }

    /**
     * Build diagram elements
     */
    private buildDiagram(
        processId: string,
        nodes: BpmnElement[],
        edges: BpmnSequenceFlow[]
    ): string {
        let xml = `<bpmndi:BPMNDiagram id="BPMNDiagram_${processId}">`;
        xml += `<bpmndi:BPMNPlane id="BPMNPlane_${processId}" bpmnElement="${processId}">`;

        // Add node shapes
        for (const node of nodes) {
            xml += this.buildNodeShape(node);
        }

        // Add edge shapes
        for (const edge of edges) {
            xml += this.buildEdgeShape(edge);
        }

        xml += '</bpmndi:BPMNPlane>';
        xml += '</bpmndi:BPMNDiagram>';

        return xml;
    }

    /**
     * Build node shape
     */
    private buildNodeShape(node: any): string {
        const bounds = {
            x: node.x || 0,
            y: node.y || 0,
            width: node.width || 100,
            height: node.height || 80
        };

        let xml = `<bpmndi:BPMNShape id="BPMNShape_${node.id}" bpmnElement="${node.id}">`;
        xml += `<dc:Bounds x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}"/>`;
        xml += '</bpmndi:BPMNShape>';

        return xml;
    }

    /**
     * Build edge shape
     */
    private buildEdgeShape(edge: any): string {
        let xml = `<bpmndi:BPMNEdge id="BPMNEdge_${edge.id}" bpmnElement="${edge.id}">`;

        // Add waypoints (simplified - just start and end)
        xml += `<di:waypoint x="0" y="0"/>`;
        xml += `<di:waypoint x="100" y="100"/>`;

        xml += '</bpmndi:BPMNEdge>';

        return xml;
    }

    /**
     * Check if node type has children elements
     */
    private hasNodeChildren(nodeType: string): boolean {
        const typesWithChildren = [
            'serviceTask',
            'scriptTask',
            'userTask',
            'callActivity',
            'subProcess',
            'transaction',
            'adHocSubProcess'
        ];

        return typesWithChildren.includes(nodeType);
    }

    /**
     * Build node-specific children
     */
    private buildNodeChildren(node: BpmnElement): string {
        let xml = '';

        // Add type-specific content
        switch (node.type) {
            case 'scriptTask':
                if (node.attributes?.script) {
                    xml += `<script>${escapeXml(node.attributes.script)}</script>`;
                }
                break;

            case 'userTask':
                if (node.attributes?.formKey) {
                    xml += `<formKey>${escapeXml(node.attributes.formKey)}</formKey>`;
                }
                break;
        }

        return xml;
    }
} 