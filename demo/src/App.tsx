import React, { useEffect, useRef, useState } from 'react'
import { Graph } from '@antv/x6'
import {
    BpmnExportPlugin,
    BpmnExport,
    registerBpmnShapes,
    getRegisteredBpmnShapes
} from '@x6-plugin/bpmn-export'

const App: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<Graph>()
    const [bpmnXml, setBpmnXml] = useState<string>('')
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning' | '', message: string }>({ type: '', message: '' })

    useEffect(() => {
        if (!containerRef.current) return

        // 预先注册BPMN形状
        registerBpmnShapes()

        // 检查已注册的形状
        const registeredShapes = getRegisteredBpmnShapes()
        console.log('已注册的BPMN形状:', registeredShapes)

        // 初始化X6图形
        const graph = new Graph({
            container: containerRef.current,
            width: 1200,
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
                createEdge() {
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

        return () => {
            graph.dispose()
        }
    }, [])

    const createSampleNodes = (graph: Graph) => {
        // 第一行：开始事件变体
        graph.addNode({
            id: 'start-1',
            shape: 'bpmn-start-event',
            x: 50,
            y: 50,
            label: '开始',
            data: { name: '开始事件', type: 'startEvent' },
        })

        graph.addNode({
            id: 'start-message',
            shape: 'bpmn-start-message-event',
            x: 150,
            y: 50,
            label: '消息开始',
            data: { name: '消息开始事件', type: 'startEvent' },
        })

        graph.addNode({
            id: 'start-timer',
            shape: 'bpmn-start-timer-event',
            x: 250,
            y: 50,
            label: '定时开始',
            data: { name: '定时开始事件', type: 'startEvent' },
        })

        graph.addNode({
            id: 'start-signal',
            shape: 'bpmn-start-signal-event',
            x: 350,
            y: 50,
            label: '信号开始',
            data: { name: '信号开始事件', type: 'startEvent' },
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
                type: 'userTask',
                flowable: { assignee: 'manager' },
            },
        })

        graph.addNode({
            id: 'service-task',
            shape: 'bpmn-service-task',
            x: 150,
            y: 150,
            label: '服务任务',
            data: { name: '服务任务', type: 'serviceTask' },
        })

        graph.addNode({
            id: 'script-task',
            shape: 'bpmn-script-task',
            x: 250,
            y: 150,
            label: '脚本任务',
            data: { name: '脚本任务', type: 'scriptTask' },
        })

        graph.addNode({
            id: 'send-task',
            shape: 'bpmn-send-task',
            x: 350,
            y: 150,
            label: '发送任务',
            data: { name: '发送任务', type: 'sendTask' },
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

            const graphData = { nodes, edges }

            // 使用静态方法导出
            const result = await BpmnExport.toBpmn(graphData, {
                namespace: 'flowable',
                includeDI: true,
                format: true,
                processId: 'Process_Static',
                processName: 'Static Export Process',
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
        <div className="App">
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

            {/* 图形画布 */}
            <div ref={containerRef} className="graph-container" />

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