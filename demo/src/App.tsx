import React, { useEffect, useRef, useState } from 'react'
import { Graph, Node, Edge } from '@antv/x6'
import {
    BpmnExportPlugin,
    BpmnExport,
    registerBpmnShapes,
    getRegisteredBpmnShapes
} from '@x6-plugin/bpmn-export'
import { PropertySidebar } from './components/PropertySidebar'

const App: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<Graph>()
    const [bpmnXml, setBpmnXml] = useState<string>('')
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning' | '', message: string }>({ type: '', message: '' })
    const [selectedNode, setSelectedNode] = useState<any>(null)
    const [processConfig, setProcessConfig] = useState({
        processId: 'Process_Demo',
        processName: 'Demo Process',
        isExecutable: true,
        documentation: '',
        executionListeners: [] as Array<{
            // $type: string;
            event: string;
            class?: string;
            expression?: string;
            delegateExpression?: string;
        }>,
        eventListeners: [] as Array<{
            // $type: string;
            event: string;
            class?: string;
            expression?: string;
            delegateExpression?: string;
        }>,
        dataObjects: [] as Array<{
            id: string;
            name: string;
            itemSubjectRef?: string;
            isCollection?: boolean;
        }>,
        extensionProperties: [] as Array<{
            name: string;
            value: string;
        }>
    });

    // Global events state
    const [globalEvents, setGlobalEvents] = useState({
        messages: [] as Array<{ id: string; name: string; itemRef?: string }>,
        errors: [] as Array<{ id: string; name: string; errorCode?: string; structureRef?: string }>,
        signals: [] as Array<{ id: string; name: string; structureRef?: string }>,
        escalations: [] as Array<{ id: string; name: string; escalationCode?: string; structureRef?: string }>
    });

    // Global events management functions
    const addGlobalEvent = (type: 'messages' | 'errors' | 'signals' | 'escalations') => {
        const newEvent = {
            id: `${type.slice(0, -1)}_${Date.now()}`,
            name: `New ${type.slice(0, -1)}`,
            ...(type === 'errors' && { errorCode: '' }),
            ...(type === 'escalations' && { escalationCode: '' }),
            ...(type !== 'messages' && { structureRef: '' }),
            ...(type === 'messages' && { itemRef: '' })
        };

        setGlobalEvents(prev => ({
            ...prev,
            [type]: [...prev[type], newEvent]
        }));
    };

    const updateGlobalEvent = (type: 'messages' | 'errors' | 'signals' | 'escalations', index: number, field: string, value: string) => {
        setGlobalEvents(prev => ({
            ...prev,
            [type]: prev[type].map((event, i) =>
                i === index ? { ...event, [field]: value } : event
            )
        }));
    };

    const removeGlobalEvent = (type: 'messages' | 'errors' | 'signals' | 'escalations', index: number) => {
        setGlobalEvents(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    // Process execution listeners management
    const addExecutionListener = () => {
        const newListener = {
            // $type: 'flowable:ExecutionListener',
            event: 'start',
            expression: '${expression}'
        };

        setProcessConfig(prev => ({
            ...prev,
            executionListeners: [...prev.executionListeners, newListener]
        }));
    };

    const updateExecutionListener = (index: number, field: string, value: string) => {
        setProcessConfig(prev => ({
            ...prev,
            executionListeners: prev.executionListeners.map((listener, i) =>
                i === index ? { ...listener, [field]: value } : listener
            )
        }));
    };

    const removeExecutionListener = (index: number) => {
        setProcessConfig(prev => ({
            ...prev,
            executionListeners: prev.executionListeners.filter((_, i) => i !== index)
        }));
    };

    // Process event listeners management
    const addEventListener = () => {
        const newListener = {
            // $type: 'flowable:EventListener',
            event: 'PROCESS_STARTED',
            expression: '${expression}'
        };

        setProcessConfig(prev => ({
            ...prev,
            eventListeners: [...prev.eventListeners, newListener]
        }));
    };

    const updateEventListener = (index: number, field: string, value: string) => {
        setProcessConfig(prev => ({
            ...prev,
            eventListeners: prev.eventListeners.map((listener, i) =>
                i === index ? { ...listener, [field]: value } : listener
            )
        }));
    };

    const removeEventListener = (index: number) => {
        setProcessConfig(prev => ({
            ...prev,
            eventListeners: prev.eventListeners.filter((_, i) => i !== index)
        }));
    };

    // Data objects management
    const addDataObject = () => {
        const newDataObject = {
            id: `dataObject_${Date.now()}`,
            name: 'New Data Object',
            itemSubjectRef: '',
            isCollection: false
        };

        setProcessConfig(prev => ({
            ...prev,
            dataObjects: [...prev.dataObjects, newDataObject]
        }));
    };

    const updateDataObject = (index: number, field: string, value: string | boolean) => {
        setProcessConfig(prev => ({
            ...prev,
            dataObjects: prev.dataObjects.map((dataObject, i) =>
                i === index ? { ...dataObject, [field]: value } : dataObject
            )
        }));
    };

    const removeDataObject = (index: number) => {
        setProcessConfig(prev => ({
            ...prev,
            dataObjects: prev.dataObjects.filter((_, i) => i !== index)
        }));
    };

    // Extension properties management
    const addExtensionProperty = () => {
        const newProperty = {
            name: 'propertyName',
            value: 'propertyValue'
        };

        setProcessConfig(prev => ({
            ...prev,
            extensionProperties: [...prev.extensionProperties, newProperty]
        }));
    };

    const updateExtensionProperty = (index: number, field: string, value: string) => {
        setProcessConfig(prev => ({
            ...prev,
            extensionProperties: prev.extensionProperties.map((property, i) =>
                i === index ? { ...property, [field]: value } : property
            )
        }));
    };

    const removeExtensionProperty = (index: number) => {
        setProcessConfig(prev => ({
            ...prev,
            extensionProperties: prev.extensionProperties.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        if (!containerRef.current) return

        // 预先注册BPMN形状
        registerBpmnShapes()

        // 检查已注册的形状
        const registeredShapes = getRegisteredBpmnShapes()
        console.log('已注册的BPMN形状:', registeredShapes)

        // 初始化X6图形
        const graph: Graph = new Graph({
            container: containerRef.current,
            width: 1500, // 缩小画布宽度，为侧边栏腾出空间
            height: 800,
            grid: true,
            background: {
                color: '#f5f5f5',
            },
            panning: true,
            mousewheel: {
                enabled: true,
                zoomAtMousePosition: true,
                modifiers: 'ctrl',
                minScale: 0.5,
                maxScale: 3,
            },
            connecting: {
                router: 'manhattan',
                connector: {
                    name: 'rounded',
                    args: {
                        radius: 8,
                    },
                },
                // anchor: 'anchor',
                // connectionPoint: 'anchor',
                allowBlank: false,
                snap: {
                    radius: 20,
                },
                createEdge(): Edge {
                    return graph.createEdge({
                        attrs: {
                            line: {
                                stroke: '#A2B1C3',
                                strokeWidth: 2,
                                targetMarker: {
                                    name: 'block',
                                    width: 12,
                                    height: 8,
                                },
                            },
                        },
                        zIndex: 0,
                    })
                },
                validateConnection({ targetMagnet }) {
                    return !!targetMagnet
                },
            },
        })

        // 注册BPMN插件
        const bpmnPlugin = new BpmnExportPlugin({
            namespace: 'flowable',
            includeDI: true,
            format: true,
            processId: 'Process_Demo',
            processName: 'Demo Process',
        })

        graph.use(bpmnPlugin)

        graphRef.current = graph


        // 创建一些示例节点
        createSampleNodes(graph)

        // 添加节点选择事件监听
        graph.on('node:click', ({ node }: { node: Node }) => {
            const nodeData = {
                id: node.id,
                shape: node.shape,
                data: node.getData() || {},
            }
            setSelectedNode(nodeData)
        })

        graph.on('edge:click', ({ edge }: { edge: Edge }) => {
            const edgeData = {
                id: edge.id,
                shape: edge.shape,
                data: edge.getData() || {},
            }
            setSelectedNode(edgeData)
        })

        graph.on('blank:click', () => {
            setSelectedNode(null)
        })

        return () => {
            graph.dispose()
        }
    }, [])

    // 更新节点属性
    const handlePropertyChange = (key: string, value: any) => {
        if (!graphRef.current || !selectedNode) return

        const cell = graphRef.current.getCellById(selectedNode.id)
        if (!cell) return

        // 更新本地状态
        setSelectedNode({
            ...selectedNode,
            data: {
                ...selectedNode.data,
                [key]: value
            }
        })

        // 更新图形中的节点数据
        const currentData = cell.getData() || {}
        cell.setData({
            ...currentData,
            [key]: value
        })
        console.log(cell.getData(), 'cell.getData()');

        // 如果是name属性，也更新label
        if (key === 'name' && cell.isNode()) {
            ; (cell as Node).setAttrs({
                text: {
                    text: value
                }
            })
        }
    }

    const createSampleNodes = (graph: Graph) => {
        // 第一行：开始事件变体
        graph.addNode({
            id: 'start-1',
            shape: 'bpmn-start-event',
            x: 50,
            y: 50,
            label: '开始',
            data: { name: '开始事件' },
        })

        graph.addNode({
            id: 'start-message',
            shape: 'bpmn-start-message-event',
            x: 150,
            y: 50,
            label: '消息开始',
            data: { name: '消息开始事件' },
        })

        graph.addNode({
            id: 'start-timer',
            shape: 'bpmn-start-timer-event',
            x: 250,
            y: 50,
            label: '定时开始',
            data: { name: '定时开始事件' },
        })

        graph.addNode({
            id: 'start-signal',
            shape: 'bpmn-start-signal-event',
            x: 350,
            y: 50,
            label: '信号开始',
            data: { name: '信号开始事件' },
        })

        // 第二行：任务类型
        graph.addNode({
            id: 'user-task',
            shape: 'bpmn-user-task',
            x: 50,
            y: 150,
            label: '用户任务',
            data: {
                name: '用户任务',
                flowable: { assignee: 'manager' },
            },
        })

        graph.addNode({
            id: 'service-task',
            shape: 'bpmn-service-task',
            x: 150,
            y: 150,
            label: '服务任务',
            data: { name: '服务任务' },
        })

        graph.addNode({
            id: 'script-task',
            shape: 'bpmn-script-task',
            x: 250,
            y: 150,
            label: '脚本任务',
            data: { name: '脚本任务' },
        })

        graph.addNode({
            id: 'send-task',
            shape: 'bpmn-send-task',
            x: 350,
            y: 150,
            label: '发送任务',
            data: { name: '发送任务' },
        })

        graph.addNode({
            id: 'receive-task',
            shape: 'bpmn-receive-task',
            x: 450,
            y: 150,
            label: '接收任务',
            data: { name: '接收任务', type: 'receiveTask' },
        })

        graph.addNode({
            id: 'manual-task',
            shape: 'bpmn-manual-task',
            x: 550,
            y: 150,
            label: '手工任务',
            data: { name: '手工任务', type: 'manualTask' },
        })

        graph.addNode({
            id: 'business-rule-task',
            shape: 'bpmn-business-rule-task',
            x: 650,
            y: 150,
            label: '规则任务',
            data: { name: '业务规则任务', type: 'businessRuleTask' },
        })

        graph.addNode({
            id: 'call-activity',
            shape: 'bpmn-call-activity',
            x: 750,
            y: 150,
            label: '调用活动',
            data: { name: '调用活动', type: 'callActivity' },
        })

        // 第三行：网关类型
        graph.addNode({
            id: 'exclusive-gateway',
            shape: 'bpmn-exclusive-gateway',
            x: 50,
            y: 250,
            label: '排他网关',
            data: { name: '排他网关', type: 'exclusiveGateway' },
        })

        graph.addNode({
            id: 'parallel-gateway',
            shape: 'bpmn-parallel-gateway',
            x: 150,
            y: 250,
            label: '并行网关',
            data: { name: '并行网关', type: 'parallelGateway' },
        })

        graph.addNode({
            id: 'inclusive-gateway',
            shape: 'bpmn-inclusive-gateway',
            x: 250,
            y: 250,
            label: '包容网关',
            data: { name: '包容网关', type: 'inclusiveGateway' },
        })

        graph.addNode({
            id: 'event-based-gateway',
            shape: 'bpmn-event-based-gateway',
            x: 350,
            y: 250,
            label: '事件网关',
            data: { name: '事件网关', type: 'eventBasedGateway' },
        })

        // 中间事件
        graph.addNode({
            id: 'intermediate-event',
            shape: 'bpmn-intermediate-event',
            x: 450,
            y: 250,
            label: '中间事件',
            data: { name: '中间事件', type: 'intermediateCatchEvent' },
        })

        graph.addNode({
            id: 'intermediate-throw-event',
            shape: 'bpmn-intermediate-throw-event',
            x: 550,
            y: 250,
            label: '抛出事件',
            data: { name: '中间抛出事件', type: 'intermediateThrowEvent' },
        })

        graph.addNode({
            id: 'boundary-event',
            shape: 'bpmn-boundary-event',
            x: 650,
            y: 250,
            label: '边界事件',
            data: { name: '边界事件', type: 'boundaryEvent' },
        })

        // 第四行：结束事件和其他
        graph.addNode({
            id: 'end-event',
            shape: 'bpmn-end-event',
            x: 50,
            y: 350,
            label: '结束',
            data: { name: '结束事件', type: 'endEvent' },
        })

        graph.addNode({
            id: 'end-message-event',
            shape: 'bpmn-end-message-event',
            x: 150,
            y: 350,
            label: '消息结束',
            data: { name: '消息结束事件', type: 'endEvent' },
        })

        graph.addNode({
            id: 'end-error-event',
            shape: 'bpmn-end-error-event',
            x: 250,
            y: 350,
            label: '错误结束',
            data: { name: '错误结束事件', type: 'endEvent' },
        })

        graph.addNode({
            id: 'end-terminate-event',
            shape: 'bpmn-end-terminate-event',
            x: 350,
            y: 350,
            label: '终止结束',
            data: { name: '终止结束事件', type: 'endEvent' },
        })

        // 数据对象和子流程
        graph.addNode({
            id: 'data-object',
            shape: 'bpmn-data-object',
            x: 450,
            y: 350,
            label: '数据对象',
            data: { name: '数据对象', type: 'dataObject' },
        })

        graph.addNode({
            id: 'data-store',
            shape: 'bpmn-data-store',
            x: 550,
            y: 350,
            label: '数据存储',
            data: { name: '数据存储', type: 'dataStoreReference' },
        })

        graph.addNode({
            id: 'subprocess',
            shape: 'bpmn-subprocess',
            x: 650,
            y: 320,
            label: '子流程',
            data: { name: '子流程', type: 'subProcess' },
        })

        // 添加一些连接线示例
        graph.addEdge({
            id: 'edge-1',
            shape: 'bpmn-sequence-flow',
            source: 'start-1',
            target: 'user-task',
            data: { name: '开始流程' },
        })

        graph.addEdge({
            id: 'edge-2',
            shape: 'bpmn-sequence-flow',
            source: 'user-task',
            target: 'exclusive-gateway',
            data: { name: '提交' },
        })

        graph.addEdge({
            id: 'edge-3',
            shape: 'bpmn-sequence-flow',
            source: 'exclusive-gateway',
            target: 'end-event',
            data: {
                name: '通过',
                conditionExpression: '${approved == true}'
            },
        })

        // 消息流示例
        graph.addEdge({
            id: 'message-flow-1',
            shape: 'bpmn-message-flow',
            source: 'send-task',
            target: 'start-message',
            data: { name: '发送消息' },
        })

        // 关联线示例
        graph.addEdge({
            id: 'association-1',
            shape: 'bpmn-association',
            source: 'data-object',
            target: 'service-task',
            data: { name: '数据关联' },
        })
    }

    const handleExportToBpmn = async () => {
        try {
            setStatus({ type: '', message: '' })

            if (!graphRef.current) {
                throw new Error('Graph not initialized')
            }

            // 使用插件方法导出
            const result = await (graphRef.current as any).exportToBpmn({
                namespace: 'flowable',
                includeDI: true,
                format: true,
                processId: processConfig.processId,
                processName: processConfig.processName,
                isExecutable: processConfig.isExecutable,
                documentation: processConfig.documentation,
                executionListeners: processConfig.executionListeners,
                eventListeners: processConfig.eventListeners,
                dataObjects: processConfig.dataObjects,
                extensionProperties: processConfig.extensionProperties,
                globalEvents: globalEvents,
            })


            setBpmnXml(result.data)
            setStatus({
                type: 'success',
                message: `导出成功！${result.warnings?.length ? `警告: ${result.warnings.length}` : ''}`
            })
        } catch (error) {
            console.error('Export failed:', error)
            setStatus({
                type: 'error',
                message: `导出失败: ${error instanceof Error ? error.message : String(error)}`
            })
        }
    }

    const handleImportFromBpmn = async () => {
        try {
            setStatus({ type: '', message: '' })

            if (!graphRef.current || !bpmnXml.trim()) {
                throw new Error('Graph not initialized or no BPMN XML provided')
            }

            // 使用插件方法导入
            const result = await (graphRef.current as any).importFromBpmn(bpmnXml, {
                namespace: 'flowable',
            })

            // 如果导入结果包含全局事件，更新状态
            if (result.data && result.data.globalEvents) {
                setGlobalEvents(result.data.globalEvents);
            }

            // 如果导入结果包含流程属性，更新状态
            if (result.data && result.data.processProperties) {
                const props = result.data.processProperties;
                setProcessConfig(prev => ({
                    ...prev,
                    documentation: props.documentation || '',
                    executionListeners: props.executionListeners || [],
                    eventListeners: props.eventListeners || [],
                    dataObjects: props.dataObjects || [],
                    extensionProperties: props.extensionProperties || []
                }));
            }

            setStatus({
                type: 'success',
                message: `导入成功！${result.warnings?.length ? `警告: ${result.warnings.length}` : ''}`
            })
        } catch (error) {
            console.error('Import failed:', error)
            setStatus({
                type: 'error',
                message: `导入失败: ${error instanceof Error ? error.message : String(error)}`
            })
        }
    }

    const handleExportStaticMethod = async () => {
        try {
            setStatus({ type: '', message: '' })

            if (!graphRef.current) {
                throw new Error('Graph not initialized')
            }

            // 获取图形数据
            const cells = graphRef.current.getCells()
            const nodes = cells.filter(cell => cell.isNode()).map(node => ({
                id: node.id,
                shape: node.shape,
                x: node.position().x,
                y: node.position().y,
                width: node.size().width,
                height: node.size().height,
                label: String(node.getAttrs()?.text?.text || ''),
                data: (node as any).getData?.() || {}
            }))

            const edges = cells.filter(cell => cell.isEdge()).map(edge => ({
                id: edge.id,
                source: edge.getSourceCellId(),
                target: edge.getTargetCellId(),
                shape: edge.shape,
                label: String((edge as any).getLabels?.()?.[0]?.attrs?.text?.text || ''),
                data: (edge as any).getData?.() || {}
            }))

            const graphData = { nodes, edges, globalEvents }

            // 使用静态方法导出
            const result = await BpmnExport.toBpmn(graphData, {
                namespace: 'flowable',
                includeDI: true,
                format: true,
                processId: processConfig.processId,
                processName: processConfig.processName,
                isExecutable: processConfig.isExecutable,
                documentation: processConfig.documentation,
                executionListeners: processConfig.executionListeners,
                eventListeners: processConfig.eventListeners,
                dataObjects: processConfig.dataObjects,
                extensionProperties: processConfig.extensionProperties,
            })

            setBpmnXml(result.data as string)
            setStatus({
                type: 'success',
                message: `静态方法导出成功！${result.warnings?.length ? `警告: ${result.warnings.length}` : ''}`
            })
        } catch (error) {
            console.error('Static export failed:', error)
            setStatus({
                type: 'error',
                message: `静态方法导出失败: ${error instanceof Error ? error.message : String(error)}`
            })
        }
    }

    const handleClearGraph = () => {
        if (graphRef.current) {
            graphRef.current.clearCells()
            setStatus({ type: 'success', message: '图形已清空' })
        }
    }

    const handleResetSample = () => {
        if (graphRef.current) {
            graphRef.current.clearCells()
            createSampleNodes(graphRef.current)
            setStatus({ type: 'success', message: '示例数据已重置' })
        }
    }

    const handleDownloadBpmn = () => {
        if (!bpmnXml.trim()) {
            setStatus({ type: 'warning', message: '没有BPMN XML可下载' })
            return
        }

        const blob = new Blob([bpmnXml], { type: 'text/xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'process.bpmn'
        a.click()
        URL.revokeObjectURL(url)
        setStatus({ type: 'success', message: 'BPMN文件已下载' })
    }

    return (
        <div className="App" style={{ position: 'relative' }}>
            <h1>BPMN Export Plugin Demo</h1>
            <p>
                这是一个演示X6 BPMN导出插件功能的示例应用。
                <br />
                您可以在下面的画布中创建流程图，然后导出为BPMN XML格式。
            </p>

            {/* 控制面板 */}
            <div className="control-panel">
                <button onClick={handleExportToBpmn}>
                    导出BPMN (插件方法)
                </button>
                <button onClick={handleExportStaticMethod}>
                    导出BPMN (静态方法)
                </button>
                <button onClick={handleImportFromBpmn} disabled={!bpmnXml.trim()}>
                    导入BPMN
                </button>
                <button onClick={handleDownloadBpmn} disabled={!bpmnXml.trim()}>
                    下载BPMN文件
                </button>
                <button onClick={handleClearGraph}>
                    清空画布
                </button>
                <button onClick={handleResetSample}>
                    重置示例
                </button>
            </div>

            {/* 状态信息 */}
            {status.message && (
                <div className={`status ${status.type}`}>
                    {status.message}
                </div>
            )}

            <div style={{ display: 'flex', position: 'relative', height: '800px' }}>
                {/* 图形画布 */}
                <div ref={containerRef} className="graph-container" style={{ flexGrow: 1 }} />

                {/* 属性侧边栏 */}
                <PropertySidebar
                    selectedNode={selectedNode}
                    onPropertyChange={handlePropertyChange}
                    processConfig={processConfig}
                    onProcessChange={(key: string, value: any) => {
                        setProcessConfig(prev => ({ ...prev, [key]: value }))
                        console.log('Process config updated', processConfig)
                    }}
                    globalEvents={globalEvents}
                    onGlobalEventAdd={addGlobalEvent}
                    onGlobalEventUpdate={updateGlobalEvent}
                    onGlobalEventRemove={removeGlobalEvent}
                    onExecutionListenerAdd={addExecutionListener}
                    onExecutionListenerUpdate={updateExecutionListener}
                    onExecutionListenerRemove={removeExecutionListener}
                    onEventListenerAdd={addEventListener}
                    onEventListenerUpdate={updateEventListener}
                    onEventListenerRemove={removeEventListener}
                    onDataObjectAdd={addDataObject}
                    onDataObjectUpdate={updateDataObject}
                    onDataObjectRemove={removeDataObject}
                    onExtensionPropertyAdd={addExtensionProperty}
                    onExtensionPropertyUpdate={updateExtensionProperty}
                    onExtensionPropertyRemove={removeExtensionProperty}
                />
            </div>

            {/* BPMN XML 输出 */}
            <div>
                <h3>BPMN XML 输出:</h3>
                <textarea
                    className="xml-output"
                    value={bpmnXml}
                    onChange={(e) => setBpmnXml(e.target.value)}
                    placeholder="导出的BPMN XML将显示在这里，您也可以在这里粘贴BPMN XML来导入..."
                />
            </div>
        </div>
    )
}

export default App 