/**
 * Basic usage example for @x6-plugin/bpmn-export
 */

import { Graph } from '@antv/x6';
import { BpmnExport } from '../src';

// Initialize X6 graph
const graph = new Graph({
    container: document.getElementById('container')!,
    width: 1200,
    height: 800,
    grid: true
});

// Install BPMN export plugin using X6 standard plugin mechanism
graph.use(new BpmnExport({
    processId: 'myProcess',
    processName: 'My Business Process',
    namespace: 'flowable',
    validateOnExport: true,
    formatXML: true
}));

// Create a simple process
async function createSimpleProcess() {
    // Add start event
    const start = graph.addNode({
        id: 'start',
        shape: 'bpmn-start-event',
        x: 100,
        y: 200,
        width: 36,
        height: 36,
        data: {
            name: 'Process Start'
        }
    });

    // Add service task
    const serviceTask = graph.addNode({
        id: 'serviceTask1',
        shape: 'bpmn-service-task',
        x: 250,
        y: 180,
        width: 100,
        height: 80,
        data: {
            name: 'Process Order',
            flowable: {
                delegateExpression: 'orderService',
                async: true,
                exclusive: false
            }
        }
    });

    // Add exclusive gateway
    const gateway = graph.addNode({
        id: 'gateway1',
        shape: 'bpmn-exclusive-gateway',
        x: 450,
        y: 195,
        width: 50,
        height: 50,
        data: {
            name: 'Order Valid?',
            default: 'flow3' // Default flow ID
        }
    });

    // Add user task (approval path)
    const approvalTask = graph.addNode({
        id: 'userTask1',
        shape: 'bpmn-user-task',
        x: 600,
        y: 100,
        width: 100,
        height: 80,
        data: {
            name: 'Approve Order',
            assignee: '${manager}',
            formKey: 'order-approval-form',
            flowable: {
                candidateGroups: 'managers',
                priority: 50
            }
        }
    });

    // Add script task (rejection path)
    const scriptTask = graph.addNode({
        id: 'scriptTask1',
        shape: 'bpmn-script-task',
        x: 600,
        y: 280,
        width: 100,
        height: 80,
        data: {
            name: 'Send Rejection Email',
            scriptFormat: 'javascript',
            script: `
        var email = execution.getVariable('customerEmail');
        var orderNumber = execution.getVariable('orderNumber');
        print('Sending rejection email to ' + email + ' for order ' + orderNumber);
      `,
            flowable: {
                autoStoreVariables: true
            }
        }
    });

    // Add end events
    const endApproved = graph.addNode({
        id: 'endApproved',
        shape: 'bpmn-end-event',
        x: 800,
        y: 118,
        width: 36,
        height: 36,
        data: {
            name: 'Order Approved'
        }
    });

    const endRejected = graph.addNode({
        id: 'endRejected',
        shape: 'bpmn-end-event',
        x: 800,
        y: 298,
        width: 36,
        height: 36,
        data: {
            name: 'Order Rejected'
        }
    });

    // Connect nodes with edges
    graph.addEdge({
        id: 'flow1',
        source: start,
        target: serviceTask,
        data: {
            name: 'Start Process'
        }
    });

    graph.addEdge({
        id: 'flow2',
        source: serviceTask,
        target: gateway
    });

    graph.addEdge({
        id: 'flow3',
        source: gateway,
        target: approvalTask,
        data: {
            name: 'Valid Order',
            conditionExpression: '${orderAmount <= 10000}'
        }
    });

    graph.addEdge({
        id: 'flow4',
        source: gateway,
        target: scriptTask,
        data: {
            name: 'Invalid Order',
            conditionExpression: '${orderAmount > 10000}'
        }
    });

    graph.addEdge({
        id: 'flow5',
        source: approvalTask,
        target: endApproved
    });

    graph.addEdge({
        id: 'flow6',
        source: scriptTask,
        target: endRejected
    });
}

// Export and validation examples using X6 plugin methods
async function demonstrateExport() {
    // Create the process
    await createSimpleProcess();

    // Validate the process using Graph method
    const validation = await graph.validateBPMN();
    console.log('Validation result:', validation);

    if (!validation.valid) {
        console.error('Validation errors:', validation.errors);
        validation.warnings.forEach(warning => {
            console.warn(`Warning: ${warning.message}`);
        });
    }

    // Export to XML using Graph method
    const xml = await graph.toBPMN();
    console.log('Generated BPMN XML:', xml);

    // Export to file using Graph method
    await graph.exportBPMN('my-process.bpmn');
}

// Import example using X6 plugin methods
async function demonstrateImport() {
    const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" 
             xmlns:flowable="http://flowable.org/bpmn">
  <process id="simpleProcess" name="Simple Process">
    <startEvent id="start" name="Start"/>
    <serviceTask id="task1" name="Do Something" flowable:class="com.example.MyService"/>
    <endEvent id="end" name="End"/>
    <sequenceFlow id="flow1" sourceRef="start" targetRef="task1"/>
    <sequenceFlow id="flow2" sourceRef="task1" targetRef="end"/>
  </process>
</definitions>`;

    // Clear existing graph
    graph.clearCells();

    // Import BPMN using Graph method
    await graph.fromBPMN(bpmnXml);
}

// Custom converter example using plugin instance
function registerCustomConverters() {
    // Get plugin instance
    const bpmnPlugin = graph.getPlugin<BpmnExport>('bpmn-export');

    if (bpmnPlugin) {
        // Register custom node converter
        bpmnPlugin.registerNodeConverter('custom-task', {
            toBpmn: (node) => ({
                type: 'serviceTask',
                id: node.id || 'customTask',
                name: node.getData()?.name,
                attributes: {
                    'flowable:type': 'custom',
                    'flowable:customAttribute': node.getData()?.customValue
                },
                extensionElements: {}
            }),
            fromBpmn: (element) => ({
                shape: 'custom-task',
                data: {
                    name: element.name,
                    customValue: element.attributes?.['flowable:customAttribute']
                }
            })
        });
    }
}

// Plugin management example
function demonstratePluginManagement() {
    const bpmnPlugin = graph.getPlugin<BpmnExport>('bpmn-export');

    if (bpmnPlugin) {
        // Check if enabled
        console.log('Plugin enabled:', bpmnPlugin.isEnabled());

        // Disable temporarily
        bpmnPlugin.disable();
        console.log('Plugin disabled');

        // Re-enable
        bpmnPlugin.enable();
        console.log('Plugin re-enabled');

        // Update options
        bpmnPlugin.setOptions({
            validateOnExport: false,
            formatXML: false
        });
    }
}

// Initialize and run examples
document.addEventListener('DOMContentLoaded', () => {
    // Register custom converters
    registerCustomConverters();

    // Add export button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export BPMN';
    exportBtn.onclick = () => demonstrateExport();
    document.body.appendChild(exportBtn);

    // Add import button
    const importBtn = document.createElement('button');
    importBtn.textContent = 'Import Sample BPMN';
    importBtn.onclick = () => demonstrateImport();
    document.body.appendChild(importBtn);

    // Add plugin management button
    const pluginBtn = document.createElement('button');
    pluginBtn.textContent = 'Test Plugin Management';
    pluginBtn.onclick = () => demonstratePluginManagement();
    document.body.appendChild(pluginBtn);

    // Create initial process
    createSimpleProcess();
}); 