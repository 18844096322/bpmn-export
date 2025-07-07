# @x6-plugin/bpmn-export

A powerful plugin for AntV X6 that enables seamless conversion between X6 graphs and BPMN XML format. Perfect for integrating X6-based workflow designers with BPMN-compatible engines like Flowable, Camunda, and Activiti.

## Features

- 🔄 **Bidirectional Conversion**: Convert between X6 graph data and BPMN XML
- 🎨 **Visual Fidelity**: Preserves layout and styling information
- 🔌 **Plugin Architecture**: Extensible design for custom node types and properties
- ✅ **BPMN 2.0 Compliant**: Generates standard-compliant BPMN XML
- 🚀 **Engine Support**: Compatible with Flowable, Camunda, Activiti extensions
- 📦 **TypeScript Support**: Full type definitions included

## Installation

```bash
npm install @x6-plugin/bpmn-export
# or
yarn add @x6-plugin/bpmn-export
# or
pnpm add @x6-plugin/bpmn-export
```

## Quick Start

### Using as X6 Plugin (Recommended)

```typescript
import { Graph } from '@antv/x6';
import { BpmnExport } from '@x6-plugin/bpmn-export';

// Initialize X6 graph
const graph = new Graph({
  container: document.getElementById('container'),
  // ... other options
});

// Install the plugin
graph.use(new BpmnExport({
  processId: 'myProcess',
  processName: 'My Process',
  namespace: 'flowable' // 'flowable' | 'camunda' | 'activiti'
}));

// Use through Graph methods
await graph.exportBPMN('my-process.bpmn');
const xml = await graph.toBPMN();
await graph.fromBPMN(bpmnXmlString);
const validation = await graph.validateBPMN();
```

### Alternative Direct Usage

```typescript
// Get plugin instance
const bpmnExport = graph.getPlugin<BpmnExport>('bpmn-export');

// Direct method calls
const xml = await bpmnExport.exportXML();
await bpmnExport.importXML(bpmnXml);
await bpmnExport.exportToFile('process.bpmn');
```

## API Reference

### Plugin Options

```typescript
interface BpmnExportOptions {
  processId?: string;          // Default process ID
  processName?: string;        // Default process name
  namespace?: 'flowable' | 'camunda' | 'activiti'; // Target engine
  validateOnExport?: boolean;  // Validate before export
  formatXML?: boolean;         // Pretty print XML
  encoding?: string;           // XML encoding (default: UTF-8)
}
```

### Graph Methods (After Plugin Installation)

#### `graph.exportBPMN(filename?: string): Promise<void>`
Exports the graph as a downloadable BPMN file.

#### `graph.toBPMN(): Promise<string>`
Exports the current graph as BPMN XML string.

#### `graph.fromBPMN(xml: string): Promise<void>`
Imports BPMN XML and renders it in the X6 graph.

#### `graph.validateBPMN(): Promise<ValidationResult>`
Validates the current graph against BPMN specifications.

### Plugin Instance Methods

#### `exportXML(): Promise<string>`
Exports the current graph as BPMN XML string.

#### `importXML(xml: string): Promise<void>`
Imports BPMN XML and renders it in the X6 graph.

#### `exportToFile(filename?: string): Promise<void>`
Exports the graph as a downloadable BPMN file.

#### `importFromFile(file: File): Promise<void>`
Imports a BPMN file into the graph.

#### `validate(): ValidationResult`
Validates the current graph against BPMN specifications.

#### `registerNodeConverter(nodeType: string, converter: NodeConverter): void`
Registers a custom node converter.

#### `registerEdgeConverter(edgeType: string, converter: EdgeConverter): void`
Registers a custom edge converter.

## Node Type Mapping

The plugin automatically maps between X6 node types and BPMN elements:

| X6 Shape | BPMN Element |
|----------|--------------|
| `bpmn-start-event` | `<startEvent>` |
| `bpmn-end-event` | `<endEvent>` |
| `bpmn-task` | `<task>` |
| `bpmn-service-task` | `<serviceTask>` |
| `bpmn-user-task` | `<userTask>` |
| `bpmn-script-task` | `<scriptTask>` |
| `bpmn-exclusive-gateway` | `<exclusiveGateway>` |
| `bpmn-parallel-gateway` | `<parallelGateway>` |
| `bpmn-inclusive-gateway` | `<inclusiveGateway>` |

## Custom Node Types

Register custom node type converters:

```typescript
const bpmnExport = graph.getPlugin<BpmnExport>('bpmn-export');

bpmnExport.registerNodeConverter('custom-node', {
  toBpmn: (node) => ({
    type: 'serviceTask',
    id: node.id,
    name: node.getData()?.name,
    attributes: {
      'flowable:class': node.getData()?.className
    }
  }),
  fromBpmn: (element) => ({
    shape: 'custom-node',
    data: {
      name: element.name,
      className: element.attributes?.['flowable:class']
    }
  })
});
```

## Extension Properties

The plugin supports engine-specific extensions:

```typescript
// Flowable extensions
node.setData({
  flowable: {
    async: true,
    exclusive: false,
    delegateExpression: '${myDelegate}'
  }
});

// Camunda extensions
node.setData({
  camunda: {
    asyncBefore: true,
    asyncAfter: false,
    jobPriority: 10
  }
});
```

## Examples

### Basic Process

```typescript
// Create a simple process
graph.addNode({
  shape: 'bpmn-start-event',
  x: 100,
  y: 100,
  data: { name: 'Start' }
});

graph.addNode({
  id: 'task1',
  shape: 'bpmn-service-task',
  x: 300,
  y: 100,
  data: { 
    name: 'Process Data',
    flowable: {
      delegateExpression: '${processService}'
    }
  }
});

graph.addNode({
  shape: 'bpmn-end-event',
  x: 500,
  y: 100,
  data: { name: 'End' }
});

// Connect nodes
graph.addEdge({
  source: 'start',
  target: 'task1'
});

graph.addEdge({
  source: 'task1',
  target: 'end'
});

// Export to BPMN
await graph.exportBPMN('my-process.bpmn');
```

### Plugin Management

```typescript
// Enable/disable plugin
const bpmnExport = graph.getPlugin<BpmnExport>('bpmn-export');
bpmnExport.disable();
bpmnExport.enable();

// Check if enabled
if (bpmnExport.isEnabled()) {
  await graph.exportBPMN();
}

// Update options at runtime
bpmnExport.setOptions({
  validateOnExport: false,
  formatXML: false
});
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Lint code
npm run lint
```

## Why X6 Plugin Architecture?

This plugin follows the X6 plugin architecture to provide:

1. **Consistent API**: All X6 plugins work the same way
2. **Lifecycle Management**: Enable/disable functionality as needed
3. **Graph Integration**: Methods are available directly on the graph instance
4. **Resource Management**: Automatic cleanup when graph is disposed

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

MIT © [Your Name] 