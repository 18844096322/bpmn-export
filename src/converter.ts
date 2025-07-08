/**
 * BPMN Converter - 重构版本
 * 使用bpmn-moddle处理BPMN对象模型，专注于X6数据格式转换
 */

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
import { defaultOptions } from './config';
import { DEFAULT_NODE_MAPPINGS, DEFAULT_BPMN_TO_X6_MAPPINGS } from './mappings';
import { generateId, sanitizeXMLId } from './utils';

export class BpmnConverter {
    private options: Required<BpmnExportOptions>;
    private nodeConverters: Map<string, NodeConverter>;
    private edgeConverters: Map<string, EdgeConverter>;
    private moddle: any;

    constructor(options: Partial<BpmnExportOptions> = {}) {
        this.options = { ...defaultOptions, ...options };
        this.nodeConverters = new Map();
        this.edgeConverters = new Map();

        // 初始化bpmn-moddle实例
        this.moddle = new BpmnModdle();
    }

    /**
     * Convert X6 graph data to BPMN XML
     */
    async convertToBpmn(graphData: X6GraphData): Promise<ConversionResult> {
        try {
            // 1. 构建BPMN对象模型
            const definitions = this.buildBpmnDefinitions(graphData);

            // 2. 验证BPMN定义
            const validationWarnings = this.validateBpmnDefinitions(definitions);

            // 3. 使用bpmn-moddle序列化为XML
            const { xml } = await this.moddle.toXML(definitions, {
                format: this.options.format,
                preamble: true
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
            exporter: 'X6 BPMN Export Plugin',
            exporterVersion: '2.0.0'
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
        const { shape, data = {} } = node;

        // 检查自定义转换器
        if (shape && this.nodeConverters.has(shape)) {
            return this.nodeConverters.get(shape)!.toBpmn(node, this.moddle);
        }

        // 使用默认映射
        const bpmnType = this.getBpmnTypeFromX6Shape(shape || '');
        const elementId = sanitizeXMLId(node.id);

        // 创建BPMN元素
        const element = this.moddle.create(bpmnType, {
            id: elementId,
            name: data.name || node.label || ''
        });

        // 添加引擎特定属性
        this.addEngineSpecificAttributes(element, data);

        return element;
    }

    /**
     * Convert X6 edge to BPMN sequence flow
     */
    private convertEdgeToBpmn(edge: X6EdgeData): any {
        const { data = {} } = edge;

        // 检查自定义转换器
        if (edge.shape && this.edgeConverters.has(edge.shape)) {
            return this.edgeConverters.get(edge.shape)!.toBpmn(edge, this.moddle);
        }

        // 创建序列流
        const sequenceFlow = this.moddle.create('bpmn:SequenceFlow', {
            id: sanitizeXMLId(edge.id),
            name: data.name || edge.label || '',
            sourceRef: edge.source,
            targetRef: edge.target
        });

        // 添加条件表达式
        if (data.conditionExpression) {
            sequenceFlow.conditionExpression = this.moddle.create('bpmn:FormalExpression', {
                body: data.conditionExpression
            });
        }

        return sequenceFlow;
    }

    /**
     * Extract X6 graph data from BPMN definitions
     */
    private extractX6GraphData(definitions: any): X6GraphData {
        const nodes: X6NodeData[] = [];
        const edges: X6EdgeData[] = [];

        // 获取第一个流程
        const process = definitions.rootElements?.find((el: any) => el.$type === 'bpmn:Process');
        if (!process) {
            return { nodes, edges };
        }

        // 获取图形信息映射
        const diMap = this.buildDiagramElementMap(definitions);

        // 处理流程元素
        process.flowElements?.forEach((element: any) => {
            if (element.$type === 'bpmn:SequenceFlow') {
                const edge = this.convertBpmnToEdge(element, diMap);
                if (edge) edges.push(edge);
            } else {
                const node = this.convertBpmnToNode(element, diMap);
                if (node) nodes.push(node);
            }
        });

        return { nodes, edges };
    }

    /**
     * Convert BPMN element to X6 node
     */
    private convertBpmnToNode(element: any, diMap: Map<string, any>): X6NodeData | null {
        const bpmnType = element.$type.replace('bpmn:', '');
        const x6Shape = this.getX6ShapeFromBpmnType(bpmnType);

        // 获取图形信息
        const diElement = diMap.get(element.id);
        const bounds = diElement?.bounds || { x: 0, y: 0, width: 100, height: 80 };

        // 检查自定义转换器
        if (this.nodeConverters.has(x6Shape)) {
            const converter = this.nodeConverters.get(x6Shape)!;
            const converted = converter.fromBpmn(element, this.moddle);
            return {
                id: element.id,
                shape: x6Shape,
                x: bounds.x,
                y: bounds.y,
                width: bounds.width,
                height: bounds.height,
                ...converted
            };
        }

        // 默认转换
        const node: X6NodeData = {
            id: element.id,
            shape: x6Shape,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            data: {
                name: element.name,
                // 提取引擎特定属性
                ...this.extractEngineSpecificData(element)
            }
        };

        return node;
    }

    /**
     * Convert BPMN sequence flow to X6 edge
     */
    private convertBpmnToEdge(sequenceFlow: any, diMap: Map<string, any>): X6EdgeData | null {
        const edge: X6EdgeData = {
            id: sequenceFlow.id,
            source: sequenceFlow.sourceRef,
            target: sequenceFlow.targetRef,
            shape: 'edge',
            data: {
                name: sequenceFlow.name
            }
        };

        // 添加条件表达式
        if (sequenceFlow.conditionExpression) {
            edge.data!.conditionExpression = sequenceFlow.conditionExpression.body;
        }

        return edge;
    }

    /**
     * Build BPMN diagram information
     */
    private buildBpmnDiagram(nodes: X6NodeData[], edges: X6EdgeData[], processId: string): any {
        const diagram = this.moddle.create('bpmndi:BPMNDiagram', {
            id: generateId('BPMNDiagram')
        });

        const plane = this.moddle.create('bpmndi:BPMNPlane', {
            id: generateId('BPMNPlane'),
            bpmnElement: processId
        });

        // 创建节点图形信息
        const shapes = nodes.map(node => {
            const shape = this.moddle.create('bpmndi:BPMNShape', {
                id: generateId('BPMNShape'),
                bpmnElement: node.id
            });

            shape.bounds = this.moddle.create('dc:Bounds', {
                x: node.x || 0,
                y: node.y || 0,
                width: node.width || 100,
                height: node.height || 80
            });

            return shape;
        });

        // 创建边图形信息
        const edgeShapes = edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);

            const edgeShape = this.moddle.create('bpmndi:BPMNEdge', {
                id: generateId('BPMNEdge'),
                bpmnElement: edge.id
            });

            // 生成路径点
            if (sourceNode && targetNode) {
                const waypoints = this.generateWaypoints(sourceNode, targetNode);
                edgeShape.waypoint = waypoints.map(wp =>
                    this.moddle.create('di:waypoint', wp)
                );
            }

            return edgeShape;
        });

        plane.planeElement = [...shapes, ...edgeShapes];
        diagram.plane = plane;

        return diagram;
    }

    /**
     * Build diagram element map for position information
     */
    private buildDiagramElementMap(definitions: any): Map<string, any> {
        const diMap = new Map();

        const diagram = definitions.diagrams?.[0];
        if (!diagram?.plane?.planeElement) {
            return diMap;
        }

        diagram.plane.planeElement.forEach((element: any) => {
            if (element.bpmnElement) {
                diMap.set(element.bpmnElement, {
                    bounds: element.bounds ? {
                        x: element.bounds.x,
                        y: element.bounds.y,
                        width: element.bounds.width,
                        height: element.bounds.height
                    } : null,
                    waypoints: element.waypoint?.map((wp: any) => ({
                        x: wp.x,
                        y: wp.y
                    })) || []
                });
            }
        });

        return diMap;
    }

    /**
     * Generate waypoints for sequence flow
     */
    private generateWaypoints(source: X6NodeData, target: X6NodeData): BpmnWaypoint[] {
        const sourceX = (source.x || 0) + (source.width || 100) / 2;
        const sourceY = (source.y || 0) + (source.height || 80) / 2;
        const targetX = (target.x || 0) + (target.width || 100) / 2;
        const targetY = (target.y || 0) + (target.height || 80) / 2;

        return [
            { x: sourceX, y: sourceY },
            { x: targetX, y: targetY }
        ];
    }

    /**
     * Get BPMN type from X6 shape
     */
    private getBpmnTypeFromX6Shape(shape: string): string {
        const customMapping = this.options.nodeTypeMappings[shape];
        if (customMapping) return customMapping;

        return DEFAULT_NODE_MAPPINGS[shape] || 'bpmn:Task';
    }

    /**
     * Get X6 shape from BPMN type
     */
    private getX6ShapeFromBpmnType(bpmnType: string): string {
        return DEFAULT_BPMN_TO_X6_MAPPINGS[bpmnType] || `bpmn-${bpmnType.toLowerCase()}`;
    }

    /**
     * Add engine-specific attributes to BPMN element
     */
    private addEngineSpecificAttributes(element: any, data: any): void {
        const namespace = this.options.namespace;

        if (namespace === 'flowable' && data.flowable) {
            Object.keys(data.flowable).forEach(key => {
                if (data.flowable[key] !== undefined) {
                    element[`flowable:${key}`] = data.flowable[key];
                }
            });
        }

        if (namespace === 'camunda' && data.camunda) {
            Object.keys(data.camunda).forEach(key => {
                if (data.camunda[key] !== undefined) {
                    element[`camunda:${key}`] = data.camunda[key];
                }
            });
        }

        if (namespace === 'activiti' && data.activiti) {
            Object.keys(data.activiti).forEach(key => {
                if (data.activiti[key] !== undefined) {
                    element[`activiti:${key}`] = data.activiti[key];
                }
            });
        }
    }

    /**
     * Extract engine-specific data from BPMN element
     */
    private extractEngineSpecificData(element: any): any {
        const data: any = {};
        const namespace = this.options.namespace;

        // 提取所有属性
        Object.keys(element).forEach(key => {
            if (key.startsWith(`${namespace}:`)) {
                if (!data[namespace]) data[namespace] = {};
                const propName = key.substring(namespace.length + 1);
                data[namespace][propName] = element[key];
            }
        });

        return data;
    }

    /**
     * Validate BPMN definitions and return warnings
     */
    private validateBpmnDefinitions(definitions: any): string[] {
        const warnings: string[] = [];

        // 验证必要元素
        if (!definitions.targetNamespace) {
            warnings.push('Missing targetNamespace in definitions');
        }

        if (!definitions.rootElements || definitions.rootElements.length === 0) {
            warnings.push('No process elements found in definitions');
        }

        // 验证流程结构
        definitions.rootElements?.forEach((element: any) => {
            if (element.$type === 'bpmn:Process') {
                const processWarnings = this.validateProcess(element);
                warnings.push(...processWarnings);
            }
        });

        return warnings;
    }

    /**
     * Validate individual process element
     */
    private validateProcess(process: any): string[] {
        const warnings: string[] = [];
        const flowElements = process.flowElements || [];

        // 检查开始事件
        const startEvents = flowElements.filter((el: any) => 
            el.$type === 'bpmn:StartEvent'
        );
        if (startEvents.length === 0) {
            warnings.push(`Process ${process.id} has no start event`);
        }

        // 检查结束事件
        const endEvents = flowElements.filter((el: any) => 
            el.$type === 'bpmn:EndEvent'
        );
        if (endEvents.length === 0) {
            warnings.push(`Process ${process.id} has no end event`);
        }

        return warnings;
    }
} 