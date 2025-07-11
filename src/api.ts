import type { BpmnExportOptions, ConversionResult, NodeConverter, EdgeConverter } from './types';

declare module '@antv/x6' {
    interface Graph {
        /**
         * Exports the current graph data to BPMN XML.
         * @param options Optional configuration for the export.
         * @returns A promise resolving to the conversion result containing BPMN XML and warnings.
         */
        exportToBpmn(options?: Partial<BpmnExportOptions>): Promise<ConversionResult>;

        /**
         * Imports BPMN XML into the graph.
         * @param xml The BPMN XML string to import.
         * @param options Optional configuration for the import.
         * @returns A promise resolving to the conversion result containing graph data and warnings.
         */
        importFromBpmn(xml: string, options?: Partial<BpmnExportOptions>): Promise<ConversionResult>;

        /**
         * Registers a custom node converter for a specific node type.
         * @param nodeType The type of node to register the converter for.
         * @param converter The converter functions for toBpmn and fromBpmn.
         */
        registerNodeConverter(nodeType: string, converter: NodeConverter): void;

        /**
         * Registers a custom edge converter for a specific edge type.
         * @param edgeType The type of edge to register the converter for.
         * @param converter The converter functions for toBpmn and fromBpmn.
         */
        registerEdgeConverter(edgeType: string, converter: EdgeConverter): void;

        /**
         * Updates the conversion options for the BPMN plugin.
         * @param options Partial options to update.
         */
        setOptions(options: Partial<BpmnExportOptions>): void;
    }
} 