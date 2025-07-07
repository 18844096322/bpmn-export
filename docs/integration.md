# Integration Guide

This guide helps you integrate @x6-plugin/bpmn-export with your X6-based workflow designer.

## Installation

```bash
npm install @x6-plugin/bpmn-export
```

## Basic Setup

### 1. Install the Plugin

```typescript
import { Graph } from '@antv/x6';
import { BpmnExport } from '@x6-plugin/bpmn-export';

// Create your X6 graph
const graph = new Graph({
  container: document.getElementById('container'),
  width: 1200,
  height: 800,
  grid: true,
  snapline: true,
  selecting: true,
  connecting: {
    snap: true,
    allowBlank: false,
    allowLoop: false,
    highlight: true,
  }
});

// Install the BPMN export plugin
graph.use(new BpmnExport({
  processId: 'myProcess',
  processName: 'My Process',
  namespace: 'flowable',
  validateOnExport: true,
  formatXML: true
}));
```

### 2. Configure Node Shapes

Register BPMN-compatible node shapes in your X6 graph:

```typescript
// Register BPMN shapes
Graph.registerNode('bpmn-start-event', {
  inherit: 'circle',
  width: 36,
  height: 36,
  attrs: {
    body: {
      fill: '#f5f5f5',
      stroke: '#333',
      strokeWidth: 2
    },
    label: {
      textAnchor: 'middle',
      textVerticalAnchor: 'top',
      refY: '100%',
      refY2: 4
    }
  }
});

Graph.registerNode('bpmn-service-task', {
  inherit: 'rect',
  width: 100,
  height: 80,
  attrs: {
    body: {
      fill: '#f5f5f5',
      stroke: '#333',
      strokeWidth: 2,
      rx: 6,
      ry: 6
    },
    label: {
      textAnchor: 'middle',
      textVerticalAnchor: 'middle'
    }
  }
});

// Register more shapes as needed...
```

## Using the Plugin

### Export Functions

```typescript
// Export to BPMN XML string
const xml = await graph.toBPMN();

// Export to downloadable file
await graph.exportBPMN('my-process.bpmn');

// Validate before export
const validation = await graph.validateBPMN();
if (validation.valid) {
  await graph.exportBPMN();
} else {
  console.error('Validation errors:', validation.errors);
}
```

### Import Functions

```typescript
// Import from BPMN XML
await graph.fromBPMN(xmlString);

// Import from file
const fileInput = document.getElementById('file-input') as HTMLInputElement;
fileInput.addEventListener('change', async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const bpmnPlugin = graph.getPlugin<BpmnExport>('bpmn-export');
    if (bpmnPlugin) {
      await bpmnPlugin.importFromFile(file);
    }
  }
});
```

## UI Integration

### Toolbar Integration

```typescript
// Create export button
const exportButton = document.createElement('button');
exportButton.textContent = 'Export BPMN';
exportButton.onclick = async () => {
  try {
    const validation = await graph.validateBPMN();
    if (!validation.valid) {
      alert('Process has validation errors:\n' + 
        validation.errors.map(e => e.message).join('\n'));
      return;
    }
    await graph.exportBPMN();
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed: ' + error.message);
  }
};

// Create import button
const importButton = document.createElement('button');
importButton.textContent = 'Import BPMN';
importButton.onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.bpmn,.xml';
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const bpmnPlugin = graph.getPlugin<BpmnExport>('bpmn-export');
      if (bpmnPlugin) {
        try {
          await bpmnPlugin.importFromFile(file);
          alert('Import successful!');
        } catch (error) {
          console.error('Import failed:', error);
          alert('Import failed: ' + error.message);
        }
      }
    }
  };
  input.click();
};
```

### Menu Integration

```typescript
// Add to context menu
graph.on('cell:contextmenu', ({ cell, e }) => {
  e.preventDefault();
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  
  const exportItem = document.createElement('div');
  exportItem.textContent = 'Export Process';
  exportItem.onclick = async () => {
    await graph.exportBPMN(`${cell.getData()?.name || 'process'}.bpmn`);
    menu.remove();
  };
  
  menu.appendChild(exportItem);
  document.body.appendChild(menu);
});
```

## Working with Different Engines

### Flowable Integration

```typescript
// Configure for Flowable
graph.use(new BpmnExport({
  namespace: 'flowable',
  processId: 'myFlowableProcess',
  processName: 'My Flowable Process'
}));

// Add Flowable-specific properties
const serviceTask = graph.addNode({
  shape: 'bpmn-service-task',
  x: 300,
  y: 200,
  data: {
    name: 'Send Email',
    flowable: {
      delegateExpression: '${emailService}',
      async: true,
      exclusive: false,
      skipExpression: '${skipEmail}'
    }
  }
});
```

### Camunda Integration

```typescript
// Configure for Camunda
graph.use(new BpmnExport({
  namespace: 'camunda',
  processId: 'myCamundaProcess',
  processName: 'My Camunda Process'
}));

// Add Camunda-specific properties
const userTask = graph.addNode({
  shape: 'bpmn-user-task',
  x: 300,
  y: 200,
  data: {
    name: 'Approve Request',
    camunda: {
      assignee: '${approver}',
      candidateGroups: 'managers',
      formKey: 'embedded:app:forms/approve.html',
      priority: 100
    }
  }
});
```

## Custom Node Types

### Register Custom Converters

```typescript
// Get plugin instance
const bpmnPlugin = graph.getPlugin<BpmnExport>('bpmn-export');

if (bpmnPlugin) {
  // Register custom service task
  bpmnPlugin.registerNodeConverter('custom-service-task', {
    toBpmn: (node) => ({
      type: 'serviceTask',
      id: node.id,
      name: node.getData()?.name,
      attributes: {
        'flowable:type': 'http',
        'flowable:httpUrl': node.getData()?.url,
        'flowable:httpMethod': node.getData()?.method || 'GET'
      }
    }),
    fromBpmn: (element) => ({
      shape: 'custom-service-task',
      data: {
        name: element.name,
        url: element.attributes?.['flowable:httpUrl'],
        method: element.attributes?.['flowable:httpMethod']
      }
    })
  });

  // Register custom shape
  Graph.registerNode('custom-service-task', {
    inherit: 'rect',
    width: 100,
    height: 80,
    markup: [
      {
        tagName: 'rect',
        selector: 'body'
      },
      {
        tagName: 'image',
        selector: 'icon'
      },
      {
        tagName: 'text',
        selector: 'label'
      }
    ],
    attrs: {
      body: {
        fill: '#e3f2fd',
        stroke: '#1976d2',
        strokeWidth: 2,
        rx: 6
      },
      icon: {
        href: 'http-icon.svg',
        width: 20,
        height: 20,
        refX: 8,
        refY: 8
      },
      label: {
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        fontSize: 14
      }
    }
  });
}
```

## Validation Integration

### Custom Validation Rules

```typescript
// Add validation before export
const originalExport = graph.exportBPMN.bind(graph);
graph.exportBPMN = async function(filename?: string) {
  // Custom validation
  const nodes = this.getNodes();
  const hasStart = nodes.some(n => n.shape === 'bpmn-start-event');
  const hasEnd = nodes.some(n => n.shape === 'bpmn-end-event');
  
  if (!hasStart || !hasEnd) {
    throw new Error('Process must have at least one start and end event');
  }
  
  // Check for disconnected nodes
  const disconnected = nodes.filter(node => {
    const edges = this.getConnectedEdges(node);
    return edges.length === 0;
  });
  
  if (disconnected.length > 0) {
    throw new Error(`Disconnected nodes found: ${
      disconnected.map(n => n.getData()?.name || n.id).join(', ')
    }`);
  }
  
  // Proceed with export
  return originalExport(filename);
};
```

### Visual Validation Feedback

```typescript
// Highlight validation errors
async function validateWithFeedback() {
  const validation = await graph.validateBPMN();
  
  // Clear previous highlights
  graph.getCells().forEach(cell => {
    cell.removeTools();
  });
  
  if (!validation.valid) {
    validation.errors.forEach(error => {
      if (error.nodeId) {
        const node = graph.getCellById(error.nodeId);
        if (node) {
          // Highlight error node
          node.attr('body/stroke', '#f44336');
          node.attr('body/strokeWidth', 3);
          
          // Add error tooltip
          node.addTools({
            name: 'tooltip',
            args: {
              content: error.message,
              position: 'top'
            }
          });
        }
      }
    });
  }
  
  return validation;
}
```

## Plugin Management

### Dynamic Configuration

```typescript
// Get plugin instance for runtime configuration
const bpmnPlugin = graph.getPlugin<BpmnExport>('bpmn-export');

if (bpmnPlugin) {
  // Update namespace based on user selection
  const engineSelect = document.getElementById('engine-select') as HTMLSelectElement;
  engineSelect.addEventListener('change', (e) => {
    const engine = (e.target as HTMLSelectElement).value;
    bpmnPlugin.setOptions({
      namespace: engine as 'flowable' | 'camunda' | 'activiti'
    });
  });

  // Toggle validation
  const validateCheckbox = document.getElementById('validate-on-export') as HTMLInputElement;
  validateCheckbox.addEventListener('change', (e) => {
    bpmnPlugin.setOptions({
      validateOnExport: (e.target as HTMLInputElement).checked
    });
  });
}
```

### Plugin Lifecycle

```typescript
// Disable plugin during certain operations
async function performBatchOperation() {
  const bpmnPlugin = graph.getPlugin<BpmnExport>('bpmn-export');
  
  // Temporarily disable
  bpmnPlugin?.disable();
  
  try {
    // Perform operations without plugin interference
    await doSomething();
  } finally {
    // Re-enable
    bpmnPlugin?.enable();
  }
}

// Check plugin status
function getPluginStatus() {
  const bpmnPlugin = graph.getPlugin<BpmnExport>('bpmn-export');
  return {
    installed: !!bpmnPlugin,
    enabled: bpmnPlugin?.isEnabled() ?? false
  };
}
```

## Best Practices

1. **Always validate before export** to ensure BPMN compliance
2. **Use consistent node shapes** that map to BPMN elements
3. **Store process metadata** in node/edge data properties
4. **Handle import/export errors** gracefully with user feedback
5. **Test with target engines** to ensure compatibility
6. **Use TypeScript** for better type safety and IDE support

## Troubleshooting

### Common Issues

1. **"Plugin not installed" error**
   - Ensure `graph.use(new BpmnExport())` is called after graph creation

2. **Missing node types after import**
   - Register all custom node shapes before importing
   - Check node type mappings in the plugin configuration

3. **Validation errors**
   - Use `graph.validateBPMN()` to identify issues
   - Check console for detailed error messages

4. **Export produces invalid XML**
   - Ensure node data properties are properly formatted
   - Avoid special characters in IDs and names

### Debug Mode

```typescript
// Enable debug logging
const bpmnPlugin = graph.getPlugin<BpmnExport>('bpmn-export');
if (bpmnPlugin) {
  // Access internal converter for debugging
  const converter = bpmnPlugin.getConverter();
  // Log conversion details
  console.log('Converter options:', converter);
}
``` 