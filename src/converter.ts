/**
 * BPMN Converter - 重构版本
 * 使用bpmn-moddle处理BPMN对象模型，专注于X6数据格式转换
 */
// @ts-ignore
import BpmnModdle from 'bpmn-moddle';
import {
    BpmnExportOptions,
    NodeConverter,
    EdgeConverter,
    X6GraphData,
    X6NodeData,
    X6EdgeData,
    ConversionResult,
    BpmnElementBounds,
    BpmnWaypoint
} from './types';
import { defaultOptions, NAMESPACE_URIS } from './config';
import { DEFAULT_NODE_MAPPINGS, DEFAULT_BPMN_TO_X6_MAPPINGS } from './mappings';
import { generateId, sanitizeXMLId } from './utils';
import { propertyHandlers } from './property-handlers';
// import BpmnPackage from './json/bpmn.json' with { type: 'json' };


export class BpmnConverter {
    private options: Required<BpmnExportOptions>;
    private nodeConverters: Map<string, NodeConverter>;
    private edgeConverters: Map<string, EdgeConverter>;
    private moddle: any;

    constructor(options: Partial<BpmnExportOptions> = {}) {
        this.options = { ...defaultOptions, ...options };
        this.nodeConverters = new Map();
        this.edgeConverters = new Map();

        // 初始化bpmn-moddle实例，配置命名空间
        this.moddle = new BpmnModdle({}, {
            // 设置默认命名空间为BPMN，这样元素就不会有bpmn:前缀
            defaultNs: 'bpmn'
        });
    }

    /**
     * Convert X6 graph data to BPMN XML
     */
    async convertToBpmn(graphData: X6GraphData): Promise<ConversionResult> {
        try {
            // 1. 构建BPMN对象模型
            const definitions = this.buildBpmnDefinitions(graphData);
            console.log('definitions', definitions);

            // 2. 验证BPMN定义
            const validationWarnings = this.validateBpmnDefinitions(definitions);

            // 3. 使用bpmn-moddle序列化为XML
            const { xml } = await this.moddle.toXML(definitions, {
                format: this.options.format,
                preamble: true,
                // 配置命名空间前缀
                defaultNs: 'http://www.omg.org/spec/BPMN/20100524/MODEL'
            });

            return {
                data: xml,
                warnings: validationWarnings
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to convert X6 data to BPMN: ${errorMessage}`);
        }
    }

    /**
     * Convert BPMN XML to X6 graph data
     */
    async convertFromBpmn(xml: string): Promise<ConversionResult> {
        try {
            // 1. 使用bpmn-moddle解析XML
            const parseResult = await this.moddle.fromXML(xml);
            const { rootElement: definitions, warnings = [], elementsById } = parseResult;

            if (!definitions) {
                throw new Error('Invalid BPMN XML: No root element found');
            }

            // 2. 从BPMN对象模型提取X6数据
            const graphData = this.extractX6GraphData(definitions);

            return {
                data: graphData,
                warnings: warnings.map((w: any) => w.message || String(w)),
                elementsById
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to parse BPMN XML: ${errorMessage}`);
        }
    }

    /**
     * Register custom node converter
     */
    registerNodeConverter(nodeType: string, converter: NodeConverter): void {
        this.nodeConverters.set(nodeType, converter);
    }

    /**
     * Register custom edge converter
     */
    registerEdgeConverter(edgeType: string, converter: EdgeConverter): void {
        this.edgeConverters.set(edgeType, converter);
    }

    /**
     * Update conversion options
     */
    setOptions(options: Partial<BpmnExportOptions>): void {
        this.options = { ...this.options, ...options };
    }

    /**
     * Build BPMN definitions from X6 graph data
     */
    private buildBpmnDefinitions(graphData: X6GraphData): any {
        const { nodes, edges } = graphData;

        // 创建根定义
        const definitions = this.moddle.create('bpmn:Definitions', {
            id: generateId('Definitions'),
            targetNamespace: this.options.targetNamespace,
            // exporter: 'X6 BPMN Export Plugin',
            // exporterVersion: '2.0.0',
            // 设置默认命名空间，这样BPMN元素就不会有前缀
            'xmlns': 'http://www.omg.org/spec/BPMN/20100524/MODEL',
            'xmlns:bpmndi': 'http://www.omg.org/spec/BPMN/20100524/DI',
            'xmlns:dc': 'http://www.omg.org/spec/DD/20100524/DC',
            'xmlns:di': 'http://www.omg.org/spec/DD/20100524/DI',
            // 预声明常见流程引擎命名空间，避免在使用扩展元素时缺少前缀
            'xmlns:flowable': NAMESPACE_URIS.flowable,
            'xmlns:camunda': NAMESPACE_URIS.camunda,
            'xmlns:activiti': NAMESPACE_URIS.activiti
        });

        // 创建流程
        const process = this.moddle.create('bpmn:Process', {
            id: this.options.processId,
            name: this.options.processName,
            isExecutable: true
        });

        // 转换节点到BPMN元素
        const bpmnElements = nodes.map(node => this.convertNodeToBpmn(node));
        const bpmnFlows = edges.map(edge => this.convertEdgeToBpmn(edge));

        // 添加元素到流程
        process.flowElements = [...bpmnElements, ...bpmnFlows];

        // 添加流程到定义
        definitions.rootElements = [process];
        console.log('definitions', definitions);
        // 如果需要，添加图形信息
        if (this.options.includeDI) {
            const diagram = this.buildBpmnDiagram(nodes, edges, process.id);
            definitions.diagrams = [diagram];
        }

        return definitions;
    }

    /**
     * Convert X6 node to BPMN element
     */
    private convertNodeToBpmn(node: X6NodeData): any {
        const { shape, data = {}, id } = node;

        // 检查自定义转换器
        if (shape && this.nodeConverters.has(shape)) {
            return this.nodeConverters.get(shape)!.toBpmn(node, this.moddle);
        }

        // 使用默认映射
        const bpmnType = this.getBpmnTypeFromX6Shape(shape || '');
        const elementId = sanitizeXMLId(id);

        const baseAttrs: { [key: string]: any } = {
            id: elementId,
            name: data.name || node.label || ''
        };
        const complexProps: { [key: string]: any } = {};

        // 遍历所有数据属性
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];

                // 检查当前属性是否在我们的特殊处理器中
                if (propertyHandlers[key]) {
                    // 如果是，则调用对应的函数创建复杂对象
                    if (value !== undefined && value !== null) {
                        complexProps[key] = propertyHandlers[key](this.moddle, value);
                    }
                } else if (key !== 'name') { // 'name' has been handled
                    // 如果不是，则作为简单属性处理
                    baseAttrs[key] = value;
                }
            }
        }

        // 添加引擎特定属性, these are simple attributes
        this.addEngineSpecificAttributes(baseAttrs, data);

        // 1. 先用简单属性创建主元素
        const element = this.moddle.create(bpmnType, baseAttrs);

        // 2. 将创建好的复杂对象赋值给主元素
        Object.assign(element, complexProps);

        return element;
    }

    /**
     * Convert X6 edge to BPMN sequence flow
     */
    private convertEdgeToBpmn(edge: X6EdgeData): any {
        const { data = {}, id, source, target, shape, label } = edge;

        // 检查自定义转换器
        if (shape && this.edgeConverters.has(shape)) {
            return this.edgeConverters.get(shape)!.toBpmn(edge, this.moddle);
        }

        const baseAttrs: { [key: string]: any } = {
            id: sanitizeXMLId(id),
            name: data.name || label || '',
            sourceRef: { id: source }, // In X6, source/target are node IDs (strings)
            targetRef: { id: target }
        };
        const complexProps: { [key: string]: any } = {};

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const value = data[key];

                if (propertyHandlers[key]) {
                    if (value !== undefined && value !== null) {
                        complexProps[key] = propertyHandlers[key](this.moddle, value);
                    }
                } else if (key !== 'name') {
                    baseAttrs[key] = value;
                }
            }
        }

        // 创建序列流
        const sequenceFlow = this.moddle.create('bpmn:SequenceFlow', baseAttrs);
        Object.assign(sequenceFlow, complexProps);

        return sequenceFlow;
    }

    /**
     * Extract X6 graph data from BPMN definitions
     */
    private extractX6GraphData(definitions: any): X6GraphData {
        const nodes: X6NodeData[] = [];
        const edges: X6EdgeData[] = [];

        if (!definitions.diagrams || !definitions.diagrams.length) {
            console.warn('No BPMNDiagram found in definitions.');
            return { nodes, edges };
        }

        const diagram = definitions.diagrams[0];
        const plane = diagram.plane;
        const process = definitions.rootElements.find((el: any) => el.$type === 'bpmn:Process');

        if (!plane || !plane.planeElement) {
            console.warn('No BPMNPlane or plane elements found.');
            return { nodes, edges };
        }

        const diMap = this.buildDiagramElementMap(definitions);

        // First pass: convert nodes
        process.flowElements.forEach((element: any) => {
            if (element.$type !== 'bpmn:SequenceFlow') {
                const node = this.convertBpmnToNode(element, diMap);
                if (node) {
                    nodes.push(node);
                }
            }
        });

        // Second pass: convert edges
        process.flowElements.forEach((element: any) => {
            if (element.$type === 'bpmn:SequenceFlow') {
                const edge = this.convertBpmnToEdge(element, diMap);
                if (edge) {
                    edges.push(edge);
                }
            }
        });

        return { nodes, edges };
    }

    private convertBpmnToNode(element: any, diMap: Map<string, any>): X6NodeData | null {
        const di = diMap.get(element.id);
        if (!di || !di.bounds) {
            return null;
        }

        const shape = this.getX6ShapeFromBpmnType(element.$type);
        const bounds = di.bounds as BpmnElementBounds;
        const data = this.extractEngineSpecificData(element);

        // 提取扩展元素
        if (element.extensionElements && element.extensionElements.values) {
            data.extensionElements = element.extensionElements.values.map((ext: any) => {
                const plainObject: any = { $type: ext.$type };
                Object.keys(ext.$descriptor.propertiesByName).forEach(key => {
                    if (key !== '$type') {
                        plainObject[key] = ext[key];
                    }
                });
                return plainObject;
            });
        }

        return {
            id: element.id,
            shape,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            label: element.name,
            data: {
                ...data,
                name: element.name
            }
        };
    }

    private convertBpmnToEdge(sequenceFlow: any, diMap: Map<string, any>): X6EdgeData | null {
        const di = diMap.get(sequenceFlow.id);
        if (!di) {
            return null;
        }

        const sourceId = sequenceFlow.sourceRef.id;
        const targetId = sequenceFlow.targetRef.id;

        return {
            id: sequenceFlow.id,
            source: sourceId,
            target: targetId,
            label: sequenceFlow.name,
            data: {
                name: sequenceFlow.name,
                conditionExpression: sequenceFlow.conditionExpression?.body
            }
        };
    }


    /**
     * Build BPMN diagram from X6 data and process ID
     */
    private buildBpmnDiagram(nodes: X6NodeData[], edges: X6EdgeData[], processId: string): any {
        const planeId = generateId('BPMNPlane');

        // 创建图形元素
        const diagramElements = nodes.map(node => {
            return this.moddle.create('bpmndi:BPMNShape', {
                id: sanitizeXMLId(`${node.id}_di`),
                bpmnElement: { id: node.id },
                bounds: this.moddle.create('dc:Bounds', {
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height
                })
            });
        }).concat(edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            if (!sourceNode || !targetNode) {
                console.warn(`Could not find source or target node for edge ${edge.id}`);
                return null;
            }

            const waypoints = this.generateWaypoints(sourceNode, targetNode);

            return this.moddle.create('bpmndi:BPMNEdge', {
                id: sanitizeXMLId(`${edge.id}_di`),
                bpmnElement: { id: edge.id },
                waypoint: waypoints.map(wp => this.moddle.create('dc:Point', wp))
            });
        }).filter(Boolean));

        // 创建BPMNPlane
        const plane = this.moddle.create('bpmndi:BPMNPlane', {
            id: planeId,
            bpmnElement: { id: processId },
            planeElement: diagramElements
        });

        // 创建BPMNDiagram
        return this.moddle.create('bpmndi:BPMNDiagram', {
            id: generateId('BPMNDiagram'),
            plane: plane
        });
    }

    private buildDiagramElementMap(definitions: any): Map<string, any> {
        const map = new Map<string, any>();
        if (definitions.diagrams && definitions.diagrams.length) {
            definitions.diagrams[0].plane.planeElement.forEach((el: any) => {
                if (el.bpmnElement) {
                    map.set(el.bpmnElement.id, el);
                }
            });
        }
        return map;
    }

    /**
     * Generate simple straight-line waypoints
     */
    private generateWaypoints(source: X6NodeData, target: X6NodeData): BpmnWaypoint[] {
        return [
            { x: source.x! + source.width! / 2, y: source.y! + source.height! / 2 },
            { x: target.x! + target.width! / 2, y: target.y! + target.height! / 2 }
        ];
    }

    private getBpmnTypeFromX6Shape(shape: string): string {
        return DEFAULT_NODE_MAPPINGS[shape] || 'bpmn:Task'; // 默认为Task
    }

    private getX6ShapeFromBpmnType(bpmnType: string): string {
        return DEFAULT_BPMN_TO_X6_MAPPINGS[bpmnType] || 'bpmn-base-node'; // 默认形状
    }

    private addEngineSpecificAttributes(element: any, data: any): void {
        Object.keys(data).forEach(key => {
            if (key.includes(':')) {
                const [prefix, localName] = key.split(':');
                const uri = NAMESPACE_URIS[prefix as keyof typeof NAMESPACE_URIS];
                if (uri) {
                    element.$attrs = element.$attrs || {};
                    element.$attrs[`${prefix}:${localName}`] = data[key];
                }
            }
        });
    }

    private extractEngineSpecificData(element: any): any {
        const data: any = {};
        if (element.$attrs) {
            Object.keys(element.$attrs).forEach(key => {
                if (key.includes(':')) {
                    data[key] = element.$attrs[key];
                }
            });
        }
        return data;
    }

    private validateBpmnDefinitions(definitions: any): string[] {
        const warnings: string[] = [];

        if (!definitions.rootElements || definitions.rootElements.length === 0) {
            warnings.push('No root elements found in definitions.');
            return warnings;
        }

        const process = definitions.rootElements.find((el: any) => el.$type === 'bpmn:Process');
        if (!process) {
            warnings.push('No process found in definitions.');
            return warnings;
        }

        return [...warnings, ...this.validateProcess(process)];
    }

    private validateProcess(process: any): string[] {
        const warnings: string[] = [];
        const elementIds = new Set<string>();

        if (process && process.flowElements) {
            for (const element of process.flowElements) {
                if (element.id && elementIds.has(element.id)) {
                    warnings.push(`Duplicate ID found: ${element.id}`);
                }
                if (element.id) {
                    elementIds.add(element.id);
                }
            }
        }
        return warnings;
    }
} 