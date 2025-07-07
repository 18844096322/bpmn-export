import { BpmnConverter } from '../src/converter';
import { defaultOptions } from '../src/config';

describe('BpmnConverter', () => {
    let converter: BpmnConverter;

    beforeEach(() => {
        converter = new BpmnConverter(defaultOptions);
    });

    describe('convertToBpmn', () => {
        it('should convert simple process to BPMN XML', async () => {
            const graphData = {
                nodes: [
                    {
                        id: 'start',
                        shape: 'bpmn-start-event',
                        x: 100,
                        y: 100,
                        data: { name: 'Start' }
                    },
                    {
                        id: 'task1',
                        shape: 'bpmn-service-task',
                        x: 300,
                        y: 100,
                        data: {
                            name: 'Process Task',
                            flowable: {
                                delegateExpression: 'myService'
                            }
                        }
                    },
                    {
                        id: 'end',
                        shape: 'bpmn-end-event',
                        x: 500,
                        y: 100,
                        data: { name: 'End' }
                    }
                ],
                edges: [
                    {
                        id: 'flow1',
                        source: 'start',
                        target: 'task1',
                        data: { name: 'Flow 1' }
                    },
                    {
                        id: 'flow2',
                        source: 'task1',
                        target: 'end',
                        data: { name: 'Flow 2' }
                    }
                ]
            };

            const xml = await converter.convertToBpmn(graphData);

            expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
            expect(xml).toContain('<process id="Process_1"');
            expect(xml).toContain('<startEvent id="start" name="Start"');
            expect(xml).toContain('<serviceTask id="task1" name="Process Task"');
            expect(xml).toContain('flowable:delegateExpression="${myService}"');
            expect(xml).toContain('<endEvent id="end" name="End"');
            expect(xml).toContain('<sequenceFlow id="flow1"');
            expect(xml).toContain('<sequenceFlow id="flow2"');
        });

        it('should handle conditional flows', async () => {
            const graphData = {
                nodes: [
                    {
                        id: 'gateway',
                        shape: 'bpmn-exclusive-gateway',
                        x: 200,
                        y: 200,
                        data: { name: 'Decision', default: 'defaultFlow' }
                    }
                ],
                edges: [
                    {
                        id: 'conditionalFlow',
                        source: 'gateway',
                        target: 'task1',
                        data: {
                            name: 'Condition',
                            conditionExpression: 'amount > 1000'
                        }
                    },
                    {
                        id: 'defaultFlow',
                        source: 'gateway',
                        target: 'task2'
                    }
                ]
            };

            const xml = await converter.convertToBpmn(graphData);

            expect(xml).toContain('<exclusiveGateway id="gateway"');
            expect(xml).toContain('default="defaultFlow"');
            expect(xml).toContain('<conditionExpression');
            expect(xml).toContain('${amount > 1000}');
        });
    });

    describe('convertFromBpmn', () => {
        it('should convert BPMN XML to graph data', async () => {
            const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL">
          <process id="testProcess" name="Test Process">
            <startEvent id="start" name="Start"/>
            <serviceTask id="task1" name="Service Task" flowable:class="com.example.Service"/>
            <endEvent id="end" name="End"/>
            <sequenceFlow id="flow1" sourceRef="start" targetRef="task1"/>
            <sequenceFlow id="flow2" sourceRef="task1" targetRef="end"/>
          </process>
        </definitions>`;

            const graphData = await converter.convertFromBpmn(xml);

            expect(graphData.nodes).toHaveLength(3);
            expect(graphData.edges).toHaveLength(2);

            const startNode = graphData.nodes.find(n => n.id === 'start');
            expect(startNode).toBeDefined();
            expect(startNode?.shape).toBe('bpmn-start-event');
            expect(startNode?.data?.name).toBe('Start');

            const serviceTask = graphData.nodes.find(n => n.id === 'task1');
            expect(serviceTask).toBeDefined();
            expect(serviceTask?.shape).toBe('bpmn-service-task');
            expect(serviceTask?.data?.flowable?.class).toBe('com.example.Service');
        });
    });

    describe('custom converters', () => {
        it('should use custom node converter', async () => {
            converter.registerNodeConverter('custom-node', {
                toBpmn: (node) => ({
                    type: 'serviceTask',
                    id: node.id || 'custom',
                    name: 'Custom Node',
                    attributes: {
                        'custom:type': 'special'
                    },
                    extensionElements: {}
                }),
                fromBpmn: (element) => ({
                    shape: 'custom-node',
                    data: {
                        name: element.name,
                        customType: element.attributes?.['custom:type']
                    }
                })
            });

            const graphData = {
                nodes: [{
                    id: 'custom1',
                    shape: 'custom-node',
                    x: 100,
                    y: 100,
                    data: { name: 'My Custom Node' }
                }],
                edges: []
            };

            const xml = await converter.convertToBpmn(graphData);
            expect(xml).toContain('<serviceTask id="custom1"');
            expect(xml).toContain('custom:type="special"');
        });
    });
}); 