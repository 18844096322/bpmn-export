/**
 * X6 BPMN Export Plugin - Main Entry Point
 * 重构版本，使用bpmn-moddle处理BPMN对象模型
 */

import { Graph } from '@antv/x6';
import { BpmnConverter } from './converter';
import { BpmnExportOptions, X6GraphData, ConversionResult } from './types';
import { registerCustomBpmnShape } from './shapes';
// import { defaultOptions } from './config';

/**
 * BPMN Export Plugin for X6
 */
export class BpmnExportPlugin implements Graph.Plugin {
    public name = 'bpmn-export';
    private converter: BpmnConverter;
    private graph!: Graph; // Use definite assignment assertion

    constructor(options: Partial<BpmnExportOptions> = {}) {
        this.converter = new BpmnConverter(options);

        // 不自动注册BPMN形状
        // registerBpmnShapes();
    }

    /**
     * Dispose plugin resources
     */
    dispose(): void {
        // Clean up any resources if needed
        // The converter doesn't have a dispose method, so nothing to clean up
    }

    /**
     * Initialize plugin with graph instance
     */
    init(graph: Graph) {
        this.graph = graph;
        this.setupGraphMethods();
    }

    /**
     * Export graph to BPMN XML
     */
    async exportToBpmn(options?: Partial<BpmnExportOptions & { globalEvents?: any }>): Promise<ConversionResult> {
        if (options) {
            this.converter.setOptions(options);
        }

        const graphData = this.extractGraphData();

        // Add global events if provided
        if (options?.globalEvents) {
            graphData.globalEvents = options.globalEvents;
        }

        return await this.converter.convertToBpmn(graphData);
    }

    /**
     * Import BPMN XML to graph
     */
    async importFromBpmn(xml: string, options?: Partial<BpmnExportOptions>): Promise<ConversionResult> {
        if (options) {
            this.converter.setOptions(options);
        }

        const result = await this.converter.convertFromBpmn(xml);
        console.log(result, 'result');
        if (result.data && typeof result.data === 'object') {
            this.applyGraphData(result.data as X6GraphData);
        }

        return result;
    }

    /**
     * Register custom node converter
     */
    registerNodeConverter(nodeType: string, converter: any): void {
        this.converter.registerNodeConverter(nodeType, converter);
    }

    /**
     * Register custom edge converter  
     */
    registerEdgeConverter(edgeType: string, converter: any): void {
        this.converter.registerEdgeConverter(edgeType, converter);
    }

    /**
     * Update converter options
     */
    setOptions(options: Partial<BpmnExportOptions>): void {
        this.converter.setOptions(options);
    }

    /**
     * Register custom BPMN shape (allows users to override default shapes)
     */
    registerCustomShape(shapeName: string, config: any, isEdge = false, override = true): void {
        registerCustomBpmnShape(shapeName, config, isEdge, override);
    }

    /**
     * Extract graph data from X6 Graph
     */
    private extractGraphData(): X6GraphData {
        const cells = this.graph.getCells();
        const nodes = cells.filter(cell => cell.isNode()).map(node => ({
            id: node.id,
            shape: node.shape,
            x: node.position().x,
            y: node.position().y,
            width: node.size().width,
            height: node.size().height,
            label: String(node.getAttrs()?.text?.text || ''),
            data: (node as any).getData?.() || {}
        }));

        const edges = cells.filter(cell => cell.isEdge()).map(edge => ({
            id: edge.id,
            source: edge.getSourceCellId(),
            target: edge.getTargetCellId(),
            shape: edge.shape,
            label: String((edge as any).getLabels?.()?.[0]?.attrs?.text?.text || ''),
            data: (edge as any).getData?.() || {}
        }));

        return { nodes, edges };
    }

    /**
     * Apply graph data to X6 Graph
     */
    private applyGraphData(graphData: X6GraphData): void {
        const { nodes, edges } = graphData;

        // Clear existing cells
        this.graph.clearCells();

        // Add nodes
        nodes.forEach((nodeData: any) => {
            const node = this.graph.createNode({
                id: nodeData.id,
                shape: nodeData.shape,
                x: nodeData.x || 0,
                y: nodeData.y || 0,
                width: nodeData.width || 100,
                height: nodeData.height || 80,
                label: nodeData.label,
                data: nodeData.data
            });
            this.graph.addNode(node);
        });

        // Add edges
        edges.forEach((edgeData: any) => {
            const edge = this.graph.createEdge({
                id: edgeData.id,
                shape: edgeData.shape,
                source: edgeData.source,
                target: edgeData.target,
                label: edgeData.label,
                data: edgeData.data
            });
            this.graph.addEdge(edge);
        });
    }

    /**
     * Setup graph extension methods
     */
    private setupGraphMethods(): void {
        const self = this;

        // Extend Graph prototype with BPMN methods
        (this.graph as any).exportToBpmn = async function (options?: Partial<BpmnExportOptions & { globalEvents?: any }>) {
            return await self.exportToBpmn(options);
        };

        (this.graph as any).importFromBpmn = async function (xml: string, options?: Partial<BpmnExportOptions>) {
            return await self.importFromBpmn(xml, options);
        };

        (this.graph as any).registerBpmnNodeConverter = function (nodeType: string, converter: any) {
            self.registerNodeConverter(nodeType, converter);
        };

        (this.graph as any).registerBpmnEdgeConverter = function (edgeType: string, converter: any) {
            self.registerEdgeConverter(edgeType, converter);
        };

        (this.graph as any).setBpmnOptions = function (options: Partial<BpmnExportOptions>) {
            self.setOptions(options);
        };
    }
}

/**
 * Static convenience methods
 */
export namespace BpmnExport {
    /**
     * Create a new BPMN converter instance
     */
    export function create(options?: Partial<BpmnExportOptions>): BpmnConverter {
        return new BpmnConverter(options);
    }

    /**
     * Convert X6 graph data to BPMN XML
     */
    export async function toBpmn(graphData: X6GraphData, options?: Partial<BpmnExportOptions>): Promise<ConversionResult> {
        const converter = create(options);
        return await converter.convertToBpmn(graphData);
    }

    /**
     * Convert BPMN XML to X6 graph data  
     */
    export async function fromBpmn(xml: string, options?: Partial<BpmnExportOptions>): Promise<ConversionResult> {
        const converter = create(options);
        return await converter.convertFromBpmn(xml);
    }
}

// Export types and defaults
export * from './types';
export * from './config';
export { BpmnConverter } from './converter.js';

// Export shape registration utilities
export {
    registerBpmnShapes,
    registerCustomBpmnShape,
    isShapeRegistered,
    getRegisteredBpmnShapes,
    BpmnNodeShapes,
    BpmnEdgeShapes
} from './shapes';

// Default export
export default BpmnExportPlugin; 