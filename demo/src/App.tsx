import React, { useEffect, useRef, useState } from 'react'
import { Graph, Cell, Node, Edge } from '@antv/x6'
import {
    BpmnExportPlugin,
    BpmnExport,
    registerBpmnShapes,
    getRegisteredBpmnShapes
} from '@x6-plugin/bpmn-export'

// Property sidebar styles
const sidebarStyles = {
    sidebar: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: '300px',
        height: '100%',
        background: '#f8f8f8',
        borderLeft: '1px solid #ddd',
        padding: '10px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        color: 'black',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: {
        fontWeight: 'bold',
    },
    input: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    select: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ddd',
    },
    button: {
        padding: '8px 12px',
        background: '#4a90e2',
        // color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '10px',
    },
    extensionGroup: {
        border: '1px solid #ddd',
        padding: '10px',
        borderRadius: '4px',
        marginTop: '5px',
        backgroundColor: '#f1f1f1',
    },
    addButton: {
        padding: '5px 10px',
        background: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '5px',
        fontSize: '12px',
    },
    removeButton: {
        padding: '3px 8px',
        background: '#f44336',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '5px',
        fontSize: '12px',
    },
    extensionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '5px',
    }
}

// Property sidebar component
const PropertySidebar = ({ selectedNode, onPropertyChange }: any) => {
    const [extensionType, setExtensionType] = useState<string>('taskListener');

    if (!selectedNode) {
        return (
            <div style={sidebarStyles.sidebar as React.CSSProperties}>
                <h3>属性面板</h3>
                <p>请选择一个节点查看属性</p>
            </div>
        )
    }

    const { shape, data = {} } = selectedNode;
    const nodeType = shape.replace('bpmn-', '');

    // Initialize or get existing extensionElements
    const extensionElements = data.extensionElements || [];

    const handleNestedPropertyChange = (objectKey: string, propertyKey: string, value: any) => {
        const newObject = {
            ...(data[objectKey] || {}),
            [propertyKey]: value,
        };
        if (value === '' || value === undefined) {
            delete newObject[propertyKey];
        }
        onPropertyChange(objectKey, newObject);
    };

    // Add a new extension element
    const addExtensionElement = (e: React.MouseEvent) => {
        e.preventDefault(); // 阻止表单提交
        const newExtension: any = { $type: `flowable:${extensionType}` };

        // Set default properties based on extension type
        if (extensionType === 'taskListener' || extensionType === 'executionListener') {
            newExtension.event = 'create';
            newExtension.expression = '${expression}';
        } else if (extensionType === 'field') {
            newExtension.name = 'fieldName';
            newExtension.string = 'fieldValue';
        }

        const updatedExtensions =
            [...extensionElements, newExtension]
            ;

        onPropertyChange('extensionElements', updatedExtensions);
    };

    // Remove an extension element
    const removeExtensionElement = (index: number, e: React.MouseEvent) => {
        e.preventDefault(); // 阻止表单提交
        const updatedValues = [...extensionElements];
        updatedValues.splice(index, 1);

        const updatedExtensions =
            updatedValues
            ;

        onPropertyChange('extensionElements', updatedExtensions);
    };

    // Update an extension element property
    const updateExtensionElement = (index: number, prop: string, value: any) => {
        const updatedValues = [...extensionElements];
        updatedValues[index][prop] = value;

        const updatedExtensions =
            updatedValues
            ;

        onPropertyChange('extensionElements', updatedExtensions);
    };

    // Determine which properties to show based on node type
    const renderPropertyFields = () => {
        const commonFields = (
            <>
                <div style={sidebarStyles.formGroup as React.CSSProperties}>
                    <label style={sidebarStyles.label as React.CSSProperties}>ID</label>
                    <input
                        style={sidebarStyles.input as React.CSSProperties}
                        type="text"
                        value={selectedNode.id}
                        disabled
                    />
                </div>
                <div style={sidebarStyles.formGroup as React.CSSProperties}>
                    <label style={sidebarStyles.label as React.CSSProperties}>名称</label>
                    <input
                        style={sidebarStyles.input as React.CSSProperties}
                        type="text"
                        value={data.name || ''}
                        onChange={(e) => onPropertyChange('name', e.target.value)}
                    />
                </div>
            </>
        );

        const loopCharacteristics = data.loopCharacteristics || {};

        const showMultiInstance =
            nodeType.includes('task') ||
            nodeType === 'call-activity' ||
            nodeType === 'subprocess';

        const multiInstanceForm = (
            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                <label style={sidebarStyles.label as React.CSSProperties}>多实例配置</label>
                <div style={sidebarStyles.extensionGroup as React.CSSProperties}>
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>执行方式</label>
                        <select
                            style={sidebarStyles.select as React.CSSProperties}
                            value={loopCharacteristics.isSequential ? 'sequential' : 'parallel'}
                            onChange={(e) => handleNestedPropertyChange('loopCharacteristics', 'isSequential', e.target.value === 'sequential')}
                        >
                            <option value="parallel">并行 (Parallel)</option>
                            <option value="sequential">串行 (Sequential)</option>
                        </select>
                    </div>
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>循环基数 (Loop Cardinality)</label>
                        <input
                            style={sidebarStyles.input as React.CSSProperties}
                            type="text"
                            placeholder="e.g., 5 or ${items.size()}"
                            value={loopCharacteristics.loopCardinality || ''}
                            onChange={(e) => handleNestedPropertyChange('loopCharacteristics', 'loopCardinality', e.target.value)}
                        />
                    </div>
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>集合 (Collection)</label>
                        <input
                            style={sidebarStyles.input as React.CSSProperties}
                            type="text"
                            placeholder="e.g., myCollection"
                            value={loopCharacteristics['flowable:collection'] || ''}
                            onChange={(e) => handleNestedPropertyChange('loopCharacteristics', 'flowable:collection', e.target.value)}
                        />
                    </div>
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>元素变量 (Element Variable)</label>
                        <input
                            style={sidebarStyles.input as React.CSSProperties}
                            type="text"
                            placeholder="e.g., item"
                            value={loopCharacteristics['flowable:elementVariable'] || ''}
                            onChange={(e) => handleNestedPropertyChange('loopCharacteristics', 'flowable:elementVariable', e.target.value)}
                        />
                    </div>
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>完成条件 (Completion Condition)</label>
                        <input
                            style={sidebarStyles.input as React.CSSProperties}
                            type="text"
                            placeholder="e.g., ${nrOfCompletedInstances == 5}"
                            value={loopCharacteristics.completionCondition || ''}
                            onChange={(e) => handleNestedPropertyChange('loopCharacteristics', 'completionCondition', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        );

        // Task specific fields
        if (nodeType.includes('task')) {
            return (
                <>
                    {commonFields}
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>是否异步</label>
                        <select
                            style={sidebarStyles.select as React.CSSProperties}
                            value={data.async ? 'true' : 'false'}
                            onChange={(e) => onPropertyChange('async', e.target.value === 'true')}
                        >
                            <option value="false">否</option>
                            <option value="true">是</option>
                        </select>
                    </div>

                    {/* User task specific fields */}
                    {nodeType === 'user-task' && (
                        <>
                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>办理人</label>
                                <input
                                    style={sidebarStyles.input as React.CSSProperties}
                                    type="text"
                                    value={data.assignee || ''}
                                    onChange={(e) => onPropertyChange('assignee', e.target.value)}
                                />
                            </div>
                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>候选用户</label>
                                <input
                                    style={sidebarStyles.input as React.CSSProperties}
                                    type="text"
                                    value={data.candidateUsers || ''}
                                    onChange={(e) => onPropertyChange('candidateUsers', e.target.value)}
                                />
                            </div>
                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>候选组</label>
                                <input
                                    style={sidebarStyles.input as React.CSSProperties}
                                    type="text"
                                    value={data.candidateGroups || ''}
                                    onChange={(e) => onPropertyChange('candidateGroups', e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Service task specific fields */}
                    {nodeType === 'service-task' && (
                        <>
                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>实现类</label>
                                <input
                                    style={sidebarStyles.input as React.CSSProperties}
                                    type="text"
                                    value={data.implementation || ''}
                                    onChange={(e) => onPropertyChange('implementation', e.target.value)}
                                />
                            </div>
                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>委托表达式</label>
                                <input
                                    style={sidebarStyles.input as React.CSSProperties}
                                    type="text"
                                    value={data.delegateExpression || ''}
                                    onChange={(e) => onPropertyChange('delegateExpression', e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {/* Script task specific fields */}
                    {nodeType === 'script-task' && (
                        <>
                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>脚本格式</label>
                                <input
                                    style={sidebarStyles.input as React.CSSProperties}
                                    type="text"
                                    value={data.scriptFormat || ''}
                                    onChange={(e) => onPropertyChange('scriptFormat', e.target.value)}
                                />
                            </div>
                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>脚本内容</label>
                                <textarea
                                    style={{ ...sidebarStyles.input as React.CSSProperties, height: '100px' }}
                                    value={data.script || ''}
                                    onChange={(e) => onPropertyChange('script', e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {showMultiInstance && multiInstanceForm}

                    {/* Extension elements section for tasks */}
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>扩展元素</label>

                        {/* Add new extension element */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <select
                                style={sidebarStyles.select as React.CSSProperties}
                                value={extensionType}
                                onChange={(e) => setExtensionType(e.target.value)}
                            >
                                <option value="taskListener">任务监听器</option>
                                <option value="executionListener">执行监听器</option>
                                <option value="field">字段</option>
                            </select>
                            <button
                                style={sidebarStyles.addButton as React.CSSProperties}
                                onClick={(e) => addExtensionElement(e)}
                            >
                                添加
                            </button>
                        </div>

                        {/* List of extension elements */}
                        {extensionElements && extensionElements.map((extension: any, index: number) => {
                            const extensionTypeName = extension.$type.split(':')[1];

                            return (
                                <div key={index} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                        <strong>{extensionTypeName}</strong>
                                        <button
                                            style={sidebarStyles.removeButton as React.CSSProperties}
                                            onClick={(e) => removeExtensionElement(index, e)}
                                        >
                                            删除
                                        </button>
                                    </div>

                                    {/* TaskListener or ExecutionListener fields */}
                                    {(extensionTypeName === 'taskListener' || extensionTypeName === 'executionListener') && (
                                        <>
                                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                                <label style={sidebarStyles.label as React.CSSProperties}>事件</label>
                                                <select
                                                    style={sidebarStyles.select as React.CSSProperties}
                                                    value={extension.event || 'create'}
                                                    onChange={(e) => updateExtensionElement(index, 'event', e.target.value)}
                                                >
                                                    <option value="create">创建 (create)</option>
                                                    <option value="assignment">分配 (assignment)</option>
                                                    <option value="complete">完成 (complete)</option>
                                                    {extensionTypeName === 'executionListener' && (
                                                        <>
                                                            <option value="start">开始 (start)</option>
                                                            <option value="end">结束 (end)</option>
                                                            <option value="take">接收 (take)</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>

                                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                                <label style={sidebarStyles.label as React.CSSProperties}>实现类型</label>
                                                <select
                                                    style={sidebarStyles.select as React.CSSProperties}
                                                    value={extension.expression ? 'expression' : (extension.delegateExpression ? 'delegateExpression' : 'class')}
                                                    onChange={(e) => {
                                                        const type = e.target.value;
                                                        // Clear previous implementation values
                                                        const updatedExtension = { ...extension };
                                                        delete updatedExtension.class;
                                                        delete updatedExtension.expression;
                                                        delete updatedExtension.delegateExpression;

                                                        // Set default for new type
                                                        if (type === 'class') {
                                                            updatedExtension.class = 'com.example.Listener';
                                                        } else if (type === 'expression') {
                                                            updatedExtension.expression = '${expression}';
                                                        } else if (type === 'delegateExpression') {
                                                            updatedExtension.delegateExpression = '${delegateExpression}';
                                                        }

                                                        // Update all values at once
                                                        const updatedValues = [...extensionElements];
                                                        updatedValues[index] = updatedExtension;
                                                        onPropertyChange('extensionElements', updatedValues);
                                                    }}
                                                >
                                                    <option value="class">Java类</option>
                                                    <option value="expression">表达式</option>
                                                    <option value="delegateExpression">委托表达式</option>
                                                </select>
                                            </div>

                                            {/* Implementation field based on type */}
                                            {extension.class && (
                                                <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                                    <label style={sidebarStyles.label as React.CSSProperties}>类名</label>
                                                    <input
                                                        style={sidebarStyles.input as React.CSSProperties}
                                                        type="text"
                                                        value={extension.class}
                                                        onChange={(e) => updateExtensionElement(index, 'class', e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {extension.expression && (
                                                <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                                    <label style={sidebarStyles.label as React.CSSProperties}>表达式</label>
                                                    <input
                                                        style={sidebarStyles.input as React.CSSProperties}
                                                        type="text"
                                                        value={extension.expression}
                                                        onChange={(e) => updateExtensionElement(index, 'expression', e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {extension.delegateExpression && (
                                                <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                                    <label style={sidebarStyles.label as React.CSSProperties}>委托表达式</label>
                                                    <input
                                                        style={sidebarStyles.input as React.CSSProperties}
                                                        type="text"
                                                        value={extension.delegateExpression}
                                                        onChange={(e) => updateExtensionElement(index, 'delegateExpression', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Field extension */}
                                    {extensionTypeName === 'field' && (
                                        <>
                                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                                <label style={sidebarStyles.label as React.CSSProperties}>字段名称</label>
                                                <input
                                                    style={sidebarStyles.input as React.CSSProperties}
                                                    type="text"
                                                    value={extension.name || ''}
                                                    onChange={(e) => updateExtensionElement(index, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                                <label style={sidebarStyles.label as React.CSSProperties}>字段值类型</label>
                                                <select
                                                    style={sidebarStyles.select as React.CSSProperties}
                                                    value={extension.string ? 'string' : 'expression'}
                                                    onChange={(e) => {
                                                        const type = e.target.value;
                                                        const updatedExtension = { ...extension };
                                                        delete updatedExtension.string;
                                                        delete updatedExtension.expression;

                                                        if (type === 'string') {
                                                            updatedExtension.string = 'value';
                                                        } else {
                                                            updatedExtension.expression = '${expression}';
                                                        }

                                                        const updatedValues = [...extensionElements];
                                                        updatedValues[index] = updatedExtension;
                                                        onPropertyChange('extensionElements', updatedValues);
                                                    }}
                                                >
                                                    <option value="string">字符串</option>
                                                    <option value="expression">表达式</option>
                                                </select>
                                            </div>

                                            {extension.string !== undefined && (
                                                <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                                    <label style={sidebarStyles.label as React.CSSProperties}>字符串值</label>
                                                    <input
                                                        style={sidebarStyles.input as React.CSSProperties}
                                                        type="text"
                                                        value={extension.string}
                                                        onChange={(e) => updateExtensionElement(index, 'string', e.target.value)}
                                                    />
                                                </div>
                                            )}

                                            {extension.expression !== undefined && (
                                                <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                                    <label style={sidebarStyles.label as React.CSSProperties}>表达式值</label>
                                                    <input
                                                        style={sidebarStyles.input as React.CSSProperties}
                                                        type="text"
                                                        value={extension.expression}
                                                        onChange={(e) => updateExtensionElement(index, 'expression', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )
        }

        // Gateway specific fields
        if (nodeType.includes('gateway')) {
            return (
                <>
                    {commonFields}
                    {nodeType === 'exclusive-gateway' && (
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <label style={sidebarStyles.label as React.CSSProperties}>默认流转</label>
                            <input
                                style={sidebarStyles.input as React.CSSProperties}
                                type="text"
                                value={data.default || ''}
                                onChange={(e) => onPropertyChange('default', e.target.value)}
                            />
                        </div>
                    )}
                </>
            )
        }

        // Sequence flow specific fields
        if (nodeType === 'sequence-flow' || shape === 'bpmn-sequence-flow') {
            return (
                <>
                    {commonFields}
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>条件表达式</label>
                        <textarea
                            style={{ ...sidebarStyles.input as React.CSSProperties, height: '80px' }}
                            value={data.conditionExpression || ''}
                            onChange={(e) => onPropertyChange('conditionExpression', e.target.value)}
                        />
                    </div>
                </>
            )
        }

        // Event specific fields
        if (nodeType.includes('event')) {
            let eventFields = commonFields;

            // Timer event fields
            if (nodeType.includes('timer')) {
                eventFields = (
                    <>
                        {eventFields}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <label style={sidebarStyles.label as React.CSSProperties}>时间表达式</label>
                            <input
                                style={sidebarStyles.input as React.CSSProperties}
                                type="text"
                                value={data.timerDefinition || ''}
                                onChange={(e) => onPropertyChange('timerDefinition', e.target.value)}
                            />
                        </div>
                    </>
                )
            }

            // Message event fields
            if (nodeType.includes('message')) {
                eventFields = (
                    <>
                        {eventFields}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <label style={sidebarStyles.label as React.CSSProperties}>消息名称</label>
                            <input
                                style={sidebarStyles.input as React.CSSProperties}
                                type="text"
                                value={data.messageRef || ''}
                                onChange={(e) => onPropertyChange('messageRef', e.target.value)}
                            />
                        </div>
                    </>
                )
            }

            return eventFields;
        }

        if (nodeType === 'subprocess' || nodeType === 'call-activity') {
            return (
                <>
                    {commonFields}
                    {showMultiInstance && multiInstanceForm}
                </>
            );
        }

        // Default for any other node type
        return commonFields;
    };

    return (
        <div style={sidebarStyles.sidebar as React.CSSProperties}>
            <h3>属性面板: {nodeType}</h3>
            <form style={sidebarStyles.form as React.CSSProperties}>
                {renderPropertyFields()}
            </form>
        </div>
    )
}

const App: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const graphRef = useRef<Graph>()
    const [bpmnXml, setBpmnXml] = useState<string>('')
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'warning' | '', message: string }>({ type: '', message: '' })
    const [selectedNode, setSelectedNode] = useState<any>(null)

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