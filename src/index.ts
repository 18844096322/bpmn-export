/**
 * @x6-plugin/bpmn-export
 * 
 * AntV X6 plugin for BPMN XML import/export
 */

import { Graph } from '@antv/x6';
import { BpmnConverter } from './converter';
import { BpmnValidator } from './validator';
import { BpmnExportOptions, ValidationResult } from './types';
import { defaultOptions } from './config';

export class BpmnExport implements Graph.Plugin {
    public name = 'bpmn-export';
    private graph: Graph;
    private options: Required<BpmnExportOptions>;
    private converter: BpmnConverter;
    private validator: BpmnValidator;
    private enabled = true;

    constructor(options: BpmnExportOptions = {}) {
        this.options = { ...defaultOptions, ...options };
        this.converter = new BpmnConverter(this.options);
        this.validator = new BpmnValidator(this.options);
    }

    /**
     * Initialize plugin with graph instance
     */
    init(graph: Graph): void {
        this.graph = graph;
        this.installAPIs();
    }

    /**
     * Enable the plugin
     */
    enable(): void {
        this.enabled = true;
    }

    /**
     * Disable the plugin
     */
    disable(): void {
        this.enabled = false;
    }

    /**
     * Check if plugin is enabled
     */
    isEnabled(): boolean {
        return this.enabled;
    }

    /**
     * Dispose the plugin
     */
    dispose(): void {
        // Clean up resources if needed
    }

    /**
     * Export X6 graph to BPMN XML
     */
    async exportXML(): Promise<string> {
        if (!this.enabled) {
            throw new Error('BPMN export plugin is disabled');
        }

        const graphData = this.graph.toJSON();

        // Validate if required
        if (this.options.validateOnExport) {
            const validation = await this.validate();
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
        }

        return this.converter.convertToBpmn(graphData);
    }

    /**
     * Import BPMN XML to X6 graph
     */
    async importXML(xml: string): Promise<void> {
        if (!this.enabled) {
            throw new Error('BPMN export plugin is disabled');
        }

        const graphData = await this.converter.convertFromBpmn(xml);
        this.graph.fromJSON(graphData);
    }

    /**
     * Export graph to BPMN file
     */
    async exportToFile(filename?: string): Promise<void> {
        const xml = await this.exportXML();
        const blob = new Blob([xml], { type: 'text/xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `${this.options.processId}-${Date.now()}.bpmn`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Import BPMN file to graph
     */
    async importFromFile(file: File): Promise<void> {
        const xml = await file.text();
        await this.importXML(xml);
    }

    /**
     * Validate current graph
     */
    async validate(): Promise<ValidationResult> {
        if (!this.enabled) {
            throw new Error('BPMN export plugin is disabled');
        }

        const graphData = this.graph.toJSON();
        return this.validator.validate(graphData);
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
     * Get converter instance
     */
    getConverter(): BpmnConverter {
        return this.converter;
    }

    /**
     * Get validator instance
     */
    getValidator(): BpmnValidator {
        return this.validator;
    }

    /**
     * Update options
     */
    setOptions(options: Partial<BpmnExportOptions>): void {
        this.options = { ...this.options, ...options };
        this.converter.setOptions(this.options);
        this.validator.setOptions(this.options);
    }

    /**
     * Install Graph prototype methods
     */
    private installAPIs(): void {
        const plugin = this;

        // Extend Graph prototype with BPMN methods
        Object.defineProperties(Graph.prototype, {
            exportBPMN: {
                value: async function (this: Graph, filename?: string) {
                    const bpmnPlugin = this.getPlugin<BpmnExport>('bpmn-export');
                    if (bpmnPlugin) {
                        await bpmnPlugin.exportToFile(filename);
                    } else {
                        throw new Error('BPMN export plugin not installed');
                    }
                },
                writable: true,
                configurable: true
            },

            toBPMN: {
                value: async function (this: Graph): Promise<string> {
                    const bpmnPlugin = this.getPlugin<BpmnExport>('bpmn-export');
                    if (bpmnPlugin) {
                        return bpmnPlugin.exportXML();
                    } else {
                        throw new Error('BPMN export plugin not installed');
                    }
                },
                writable: true,
                configurable: true
            },

            fromBPMN: {
                value: async function (this: Graph, xml: string): Promise<void> {
                    const bpmnPlugin = this.getPlugin<BpmnExport>('bpmn-export');
                    if (bpmnPlugin) {
                        await bpmnPlugin.importXML(xml);
                    } else {
                        throw new Error('BPMN export plugin not installed');
                    }
                },
                writable: true,
                configurable: true
            },

            validateBPMN: {
                value: async function (this: Graph): Promise<ValidationResult> {
                    const bpmnPlugin = this.getPlugin<BpmnExport>('bpmn-export');
                    if (bpmnPlugin) {
                        return bpmnPlugin.validate();
                    } else {
                        throw new Error('BPMN export plugin not installed');
                    }
                },
                writable: true,
                configurable: true
            }
        });
    }
}

// Extend Graph interface
declare module '@antv/x6' {
    interface Graph {
        exportBPMN(filename?: string): Promise<void>;
        toBPMN(): Promise<string>;
        fromBPMN(xml: string): Promise<void>;
        validateBPMN(): Promise<ValidationResult>;
    }
}

// Export all types and utilities
export * from './types';
export * from './converter';
export * from './validator';
export * from './mappings';
export * from './utils';

// Default export
export default BpmnExport; 