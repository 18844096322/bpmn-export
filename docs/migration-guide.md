# Migration Guide

This guide helps you migrate from the initial API design to the X6 standard plugin architecture.

## Overview of Changes

The plugin now follows the X6 standard plugin architecture, which provides better integration with the X6 ecosystem and consistent API patterns across all X6 plugins.

### Key Changes:

1. **Installation**: Use `graph.use()` instead of direct instantiation
2. **Method Access**: Methods are available directly on the graph instance
3. **Plugin Management**: Support for enable/disable/dispose lifecycle

## Migration Steps

### 1. Update Plugin Installation

**Before:**
```typescript
import { BpmnExport } from '@x6-plugin/bpmn-export';

const bpmnExport = new BpmnExport(graph, {
  processId: 'myProcess',
  processName: 'My Process',
  namespace: 'flowable'
});
```

**After:**
```typescript
import { BpmnExport } from '@x6-plugin/bpmn-export';

graph.use(new BpmnExport({
  processId: 'myProcess',
  processName: 'My Process',
  namespace: 'flowable'
}));
```

### 2. Update Method Calls

**Before:**
```typescript
// Export to XML
const xml = await bpmnExport.exportXML();

// Import from XML
await bpmnExport.importXML(xmlString);

// Export to file
await bpmnExport.exportToFile('process.bpmn');

// Validate
const result = await bpmnExport.validate();
```

**After:**
```typescript
// Export to XML
const xml = await graph.toBPMN();

// Import from XML
await graph.fromBPMN(xmlString);

// Export to file
await graph.exportBPMN('process.bpmn');

// Validate
const result = await graph.validateBPMN();
```

### 3. Access Plugin Instance (When Needed)

If you need direct access to the plugin instance:

**Before:**
```typescript
// You already have the instance
bpmnExport.registerNodeConverter('custom-node', converter);
```

**After:**
```typescript
// Get plugin instance
const bpmnExport = graph.getPlugin<BpmnExport>('bpmn-export');
if (bpmnExport) {
  bpmnExport.registerNodeConverter('custom-node', converter);
}
```

### 4. Plugin Lifecycle Management

The new architecture supports plugin lifecycle management:

```typescript
const bpmnExport = graph.getPlugin<BpmnExport>('bpmn-export');

// Disable plugin temporarily
bpmnExport.disable();

// Re-enable plugin
bpmnExport.enable();

// Check if enabled
if (bpmnExport.isEnabled()) {
  // Plugin is active
}

// Dispose plugin
graph.disposePlugins(['bpmn-export']);
```

## Complete Migration Example

**Before:**
```typescript
import { Graph } from '@antv/x6';
import { BpmnExport } from '@x6-plugin/bpmn-export';

// Setup
const graph = new Graph({ container });
const bpmnExport = new BpmnExport(graph, {
  processId: 'myProcess',
  validateOnExport: true
});

// Register custom converter
bpmnExport.registerNodeConverter('my-node', {
  toBpmn: (node) => ({ /* ... */ }),
  fromBpmn: (element) => ({ /* ... */ })
});

// Use the plugin
async function exportProcess() {
  const validation = await bpmnExport.validate();
  if (validation.valid) {
    const xml = await bpmnExport.exportXML();
    await bpmnExport.exportToFile('process.bpmn');
  }
}

// Import process
async function importProcess(xml: string) {
  await bpmnExport.importXML(xml);
}
```

**After:**
```typescript
import { Graph } from '@antv/x6';
import { BpmnExport } from '@x6-plugin/bpmn-export';

// Setup
const graph = new Graph({ container });
graph.use(new BpmnExport({
  processId: 'myProcess',
  validateOnExport: true
}));

// Register custom converter
const bpmnExport = graph.getPlugin<BpmnExport>('bpmn-export');
if (bpmnExport) {
  bpmnExport.registerNodeConverter('my-node', {
    toBpmn: (node) => ({ /* ... */ }),
    fromBpmn: (element) => ({ /* ... */ })
  });
}

// Use the plugin
async function exportProcess() {
  const validation = await graph.validateBPMN();
  if (validation.valid) {
    const xml = await graph.toBPMN();
    await graph.exportBPMN('process.bpmn');
  }
}

// Import process
async function importProcess(xml: string) {
  await graph.fromBPMN(xml);
}
```

## API Mapping Reference

| Old API | New API | Notes |
|---------|---------|-------|
| `new BpmnExport(graph, options)` | `graph.use(new BpmnExport(options))` | Plugin installation |
| `bpmnExport.exportXML()` | `graph.toBPMN()` | Export to XML string |
| `bpmnExport.importXML(xml)` | `graph.fromBPMN(xml)` | Import from XML |
| `bpmnExport.exportToFile(name)` | `graph.exportBPMN(name)` | Export to file |
| `bpmnExport.validate()` | `graph.validateBPMN()` | Validate graph |
| `bpmnExport.importFromFile(file)` | Get plugin instance first | Direct plugin method |
| `bpmnExport.registerNodeConverter()` | Get plugin instance first | Direct plugin method |
| `bpmnExport.setOptions()` | Get plugin instance first | Direct plugin method |

## Benefits of the New Architecture

1. **Consistent API**: All X6 plugins work the same way
2. **Better Integration**: Methods are available directly on the graph instance
3. **Lifecycle Management**: Enable/disable plugins as needed
4. **Resource Cleanup**: Automatic disposal when graph is destroyed
5. **Plugin Discovery**: Use `graph.getPlugin()` to access any installed plugin

## Troubleshooting

### Plugin Not Found

If you get "BPMN export plugin not installed" error:

```typescript
// Make sure plugin is installed
graph.use(new BpmnExport(options));

// Check if plugin is available
const plugin = graph.getPlugin('bpmn-export');
if (!plugin) {
  console.error('Plugin not installed');
}
```

### TypeScript Types

Make sure to import types for Graph extensions:

```typescript
import { Graph } from '@antv/x6';
import { BpmnExport } from '@x6-plugin/bpmn-export';

// Now graph.toBPMN() etc. will have proper types
```

## Need Help?

If you encounter any issues during migration:

1. Check the [examples](../examples) directory for updated usage patterns
2. Review the [API documentation](../README.md#api-reference)
3. Open an issue on GitHub with your specific use case 