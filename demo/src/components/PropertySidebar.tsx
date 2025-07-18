import React, { useState } from 'react';

// Property sidebar styles
const sidebarStyles = {
    sidebar: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: '400px',
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
};

interface PropertySidebarProps {
    selectedNode: any;
    onPropertyChange: (key: string, value: any) => void;
    processConfig: any;
    onProcessChange: (key: string, value: any) => void;
    globalEvents: any;
    onGlobalEventAdd: (type: 'messages' | 'errors' | 'signals' | 'escalations') => void;
    onGlobalEventUpdate: (type: 'messages' | 'errors' | 'signals' | 'escalations', index: number, field: string, value: string) => void;
    onGlobalEventRemove: (type: 'messages' | 'errors' | 'signals' | 'escalations', index: number) => void;
    onExecutionListenerAdd: () => void;
    onExecutionListenerUpdate: (index: number, field: string, value: string) => void;
    onExecutionListenerRemove: (index: number) => void;
    onEventListenerAdd: () => void;
    onEventListenerUpdate: (index: number, field: string, value: string) => void;
    onEventListenerRemove: (index: number) => void;
    onDataObjectAdd: () => void;
    onDataObjectUpdate: (index: number, field: string, value: string | boolean) => void;
    onDataObjectRemove: (index: number) => void;
    onExtensionPropertyAdd: () => void;
    onExtensionPropertyUpdate: (index: number, field: string, value: string) => void;
    onExtensionPropertyRemove: (index: number) => void;
}

export const PropertySidebar: React.FC<PropertySidebarProps> = ({
    selectedNode,
    onPropertyChange,
    processConfig,
    onProcessChange,
    globalEvents,
    onGlobalEventAdd,
    onGlobalEventUpdate,
    onGlobalEventRemove,
    onExecutionListenerAdd,
    onExecutionListenerUpdate,
    onExecutionListenerRemove,
    onEventListenerAdd,
    onEventListenerUpdate,
    onEventListenerRemove,
    onDataObjectAdd,
    onDataObjectUpdate,
    onDataObjectRemove,
    onExtensionPropertyAdd,
    onExtensionPropertyUpdate,
    onExtensionPropertyRemove
}) => {
    const [extensionType, setExtensionType] = useState<string>('taskListener');

    if (!selectedNode && processConfig) {
        return (
            <div style={sidebarStyles.sidebar as React.CSSProperties}>
                <h3>流程属性面板</h3>
                <form style={sidebarStyles.form as React.CSSProperties}>
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>流程ID</label>
                        <input
                            style={sidebarStyles.input as React.CSSProperties}
                            type="text"
                            value={processConfig.processId || ''}
                            onChange={(e) => onProcessChange('processId', e.target.value)}
                        />
                    </div>
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>流程名称</label>
                        <input
                            style={sidebarStyles.input as React.CSSProperties}
                            type="text"
                            value={processConfig.processName || ''}
                            onChange={(e) => onProcessChange('processName', e.target.value)}
                        />
                    </div>
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>是否可执行</label>
                        <select
                            style={sidebarStyles.select as React.CSSProperties}
                            value={processConfig.isExecutable ? 'true' : 'false'}
                            onChange={(e) => onProcessChange('isExecutable', e.target.value === 'true')}
                        >
                            <option value="true">是</option>
                            <option value="false">否</option>
                        </select>
                    </div>

                    {/* Global Events Section */}
                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                        <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>全局事件</h4>
                        
                        {/* Messages */}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>消息列表</label>
                                <button
                                    type="button"
                                    style={sidebarStyles.addButton as React.CSSProperties}
                                    onClick={() => onGlobalEventAdd('messages')}
                                >
                                    添加消息
                                </button>
                            </div>
                            {globalEvents.messages.map((message: any, index: number) => (
                                <div key={message.id} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                        <strong>消息 {index + 1}</strong>
                                        <button
                                            type="button"
                                            style={sidebarStyles.removeButton as React.CSSProperties}
                                            onClick={() => onGlobalEventRemove('messages', index)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>ID</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={message.id}
                                            onChange={(e) => onGlobalEventUpdate('messages', index, 'id', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>名称</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={message.name}
                                            onChange={(e) => onGlobalEventUpdate('messages', index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>项目引用</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={message.itemRef || ''}
                                            onChange={(e) => onGlobalEventUpdate('messages', index, 'itemRef', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Errors */}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>错误列表</label>
                                <button
                                    type="button"
                                    style={sidebarStyles.addButton as React.CSSProperties}
                                    onClick={() => onGlobalEventAdd('errors')}
                                >
                                    添加错误
                                </button>
                            </div>
                            {globalEvents.errors.map((error: any, index: number) => (
                                <div key={error.id} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                        <strong>错误 {index + 1}</strong>
                                        <button
                                            type="button"
                                            style={sidebarStyles.removeButton as React.CSSProperties}
                                            onClick={() => onGlobalEventRemove('errors', index)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>ID</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={error.id}
                                            onChange={(e) => onGlobalEventUpdate('errors', index, 'id', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>名称</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={error.name}
                                            onChange={(e) => onGlobalEventUpdate('errors', index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>错误代码</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={error.errorCode || ''}
                                            onChange={(e) => onGlobalEventUpdate('errors', index, 'errorCode', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>结构引用</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={error.structureRef || ''}
                                            onChange={(e) => onGlobalEventUpdate('errors', index, 'structureRef', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Signals */}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>信号列表</label>
                                <button
                                    type="button"
                                    style={sidebarStyles.addButton as React.CSSProperties}
                                    onClick={() => onGlobalEventAdd('signals')}
                                >
                                    添加信号
                                </button>
                            </div>
                            {globalEvents.signals.map((signal: any, index: number) => (
                                <div key={signal.id} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                        <strong>信号 {index + 1}</strong>
                                        <button
                                            type="button"
                                            style={sidebarStyles.removeButton as React.CSSProperties}
                                            onClick={() => onGlobalEventRemove('signals', index)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>ID</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={signal.id}
                                            onChange={(e) => onGlobalEventUpdate('signals', index, 'id', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>名称</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={signal.name}
                                            onChange={(e) => onGlobalEventUpdate('signals', index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>结构引用</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={signal.structureRef || ''}
                                            onChange={(e) => onGlobalEventUpdate('signals', index, 'structureRef', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Escalations */}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>升级列表</label>
                                <button
                                    type="button"
                                    style={sidebarStyles.addButton as React.CSSProperties}
                                    onClick={() => onGlobalEventAdd('escalations')}
                                >
                                    添加升级
                                </button>
                            </div>
                            {globalEvents.escalations.map((escalation: any, index: number) => (
                                <div key={escalation.id} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                        <strong>升级 {index + 1}</strong>
                                        <button
                                            type="button"
                                            style={sidebarStyles.removeButton as React.CSSProperties}
                                            onClick={() => onGlobalEventRemove('escalations', index)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>ID</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={escalation.id}
                                            onChange={(e) => onGlobalEventUpdate('escalations', index, 'id', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>名称</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={escalation.name}
                                            onChange={(e) => onGlobalEventUpdate('escalations', index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>升级代码</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={escalation.escalationCode || ''}
                                            onChange={(e) => onGlobalEventUpdate('escalations', index, 'escalationCode', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>结构引用</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={escalation.structureRef || ''}
                                            onChange={(e) => onGlobalEventUpdate('escalations', index, 'structureRef', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Documentation */}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <label style={sidebarStyles.label as React.CSSProperties}>描述文档</label>
                            <textarea
                                style={{ ...sidebarStyles.input as React.CSSProperties, height: '100px' }}
                                value={processConfig.documentation || ''}
                                onChange={(e) => onProcessChange('documentation', e.target.value)}
                                placeholder="输入流程描述文档..."
                            />
                        </div>

                        {/* Execution Listeners */}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>执行监听器</label>
                                <button
                                    type="button"
                                    style={sidebarStyles.addButton as React.CSSProperties}
                                    onClick={() => onExecutionListenerAdd()}
                                >
                                    添加执行监听器
                                </button>
                            </div>
                            {processConfig.executionListeners.map((listener: any, index: number) => (
                                <div key={index} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                        <strong>执行监听器 {index + 1}</strong>
                                        <button
                                            type="button"
                                            style={sidebarStyles.removeButton as React.CSSProperties}
                                            onClick={() => onExecutionListenerRemove(index)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>事件</label>
                                        <select
                                            style={sidebarStyles.select as React.CSSProperties}
                                            value={listener.event || 'start'}
                                            onChange={(e) => onExecutionListenerUpdate(index, 'event', e.target.value)}
                                        >
                                            <option value="start">开始 (start)</option>
                                            <option value="end">结束 (end)</option>
                                        </select>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>实现类型</label>
                                        <select
                                            style={sidebarStyles.select as React.CSSProperties}
                                            value={listener.expression ? 'expression' : (listener.delegateExpression ? 'delegateExpression' : 'class')}
                                            onChange={(e) => {
                                                const type = e.target.value;
                                                // Clear previous implementation values
                                                const updatedListener = { ...listener };
                                                delete updatedListener.class;
                                                delete updatedListener.expression;
                                                delete updatedListener.delegateExpression;

                                                // Set default for new type
                                                if (type === 'class') {
                                                    updatedListener.class = 'com.example.ExecutionListener';
                                                } else if (type === 'expression') {
                                                    updatedListener.expression = '${expression}';
                                                } else if (type === 'delegateExpression') {
                                                    updatedListener.delegateExpression = '${delegateExpression}';
                                                }

                                                // Update the listener
                                                Object.keys(updatedListener).forEach(key => {
                                                    if (key !== '$type' && key !== 'event') {
                                                        onExecutionListenerUpdate(index, key, updatedListener[key]);
                                                    }
                                                });
                                            }}
                                        >
                                            <option value="class">Java类</option>
                                            <option value="expression">表达式</option>
                                            <option value="delegateExpression">委托表达式</option>
                                        </select>
                                    </div>

                                    {/* Implementation field based on type */}
                                    {listener.class && (
                                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                            <label style={sidebarStyles.label as React.CSSProperties}>类名</label>
                                            <input
                                                style={sidebarStyles.input as React.CSSProperties}
                                                type="text"
                                                value={listener.class}
                                                onChange={(e) => onExecutionListenerUpdate(index, 'class', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {listener.expression && (
                                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                            <label style={sidebarStyles.label as React.CSSProperties}>表达式</label>
                                            <input
                                                style={sidebarStyles.input as React.CSSProperties}
                                                type="text"
                                                value={listener.expression}
                                                onChange={(e) => onExecutionListenerUpdate(index, 'expression', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {listener.delegateExpression && (
                                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                            <label style={sidebarStyles.label as React.CSSProperties}>委托表达式</label>
                                            <input
                                                style={sidebarStyles.input as React.CSSProperties}
                                                type="text"
                                                value={listener.delegateExpression}
                                                onChange={(e) => onExecutionListenerUpdate(index, 'delegateExpression', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Event Listeners */}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>事件监听器</label>
                                <button
                                    type="button"
                                    style={sidebarStyles.addButton as React.CSSProperties}
                                    onClick={() => onEventListenerAdd()}
                                >
                                    添加事件监听器
                                </button>
                            </div>
                            {processConfig.eventListeners.map((listener: any, index: number) => (
                                <div key={index} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                        <strong>事件监听器 {index + 1}</strong>
                                        <button
                                            type="button"
                                            style={sidebarStyles.removeButton as React.CSSProperties}
                                            onClick={() => onEventListenerRemove(index)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>事件类型</label>
                                        <select
                                            style={sidebarStyles.select as React.CSSProperties}
                                            value={listener.event || 'PROCESS_STARTED'}
                                            onChange={(e) => onEventListenerUpdate(index, 'event', e.target.value)}
                                        >
                                            <option value="PROCESS_STARTED">流程开始</option>
                                            <option value="PROCESS_COMPLETED">流程完成</option>
                                            <option value="PROCESS_CANCELLED">流程取消</option>
                                            <option value="ACTIVITY_STARTED">活动开始</option>
                                            <option value="ACTIVITY_COMPLETED">活动完成</option>
                                            <option value="ACTIVITY_CANCELLED">活动取消</option>
                                            <option value="TASK_CREATED">任务创建</option>
                                            <option value="TASK_COMPLETED">任务完成</option>
                                        </select>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>实现类型</label>
                                        <select
                                            style={sidebarStyles.select as React.CSSProperties}
                                            value={listener.expression ? 'expression' : (listener.delegateExpression ? 'delegateExpression' : 'class')}
                                            onChange={(e) => {
                                                const type = e.target.value;
                                                // Clear previous implementation values
                                                const updatedListener = { ...listener };
                                                delete updatedListener.class;
                                                delete updatedListener.expression;
                                                delete updatedListener.delegateExpression;

                                                // Set default for new type
                                                if (type === 'class') {
                                                    updatedListener.class = 'com.example.EventListener';
                                                } else if (type === 'expression') {
                                                    updatedListener.expression = '${expression}';
                                                } else if (type === 'delegateExpression') {
                                                    updatedListener.delegateExpression = '${delegateExpression}';
                                                }

                                                // Update the listener
                                                Object.keys(updatedListener).forEach(key => {
                                                    if (key !== '$type' && key !== 'event') {
                                                        onEventListenerUpdate(index, key, updatedListener[key]);
                                                    }
                                                });
                                            }}
                                        >
                                            <option value="class">Java类</option>
                                            <option value="expression">表达式</option>
                                            <option value="delegateExpression">委托表达式</option>
                                        </select>
                                    </div>

                                    {/* Implementation field based on type */}
                                    {listener.class && (
                                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                            <label style={sidebarStyles.label as React.CSSProperties}>类名</label>
                                            <input
                                                style={sidebarStyles.input as React.CSSProperties}
                                                type="text"
                                                value={listener.class}
                                                onChange={(e) => onEventListenerUpdate(index, 'class', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {listener.expression && (
                                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                            <label style={sidebarStyles.label as React.CSSProperties}>表达式</label>
                                            <input
                                                style={sidebarStyles.input as React.CSSProperties}
                                                type="text"
                                                value={listener.expression}
                                                onChange={(e) => onEventListenerUpdate(index, 'expression', e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {listener.delegateExpression && (
                                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                            <label style={sidebarStyles.label as React.CSSProperties}>委托表达式</label>
                                            <input
                                                style={sidebarStyles.input as React.CSSProperties}
                                                type="text"
                                                value={listener.delegateExpression}
                                                onChange={(e) => onEventListenerUpdate(index, 'delegateExpression', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Data Objects */}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>数据对象</label>
                                <button
                                    type="button"
                                    style={sidebarStyles.addButton as React.CSSProperties}
                                    onClick={() => onDataObjectAdd()}
                                >
                                    添加数据对象
                                </button>
                            </div>
                            {processConfig.dataObjects.map((dataObject: any, index: number) => (
                                <div key={dataObject.id} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                        <strong>数据对象 {index + 1}</strong>
                                        <button
                                            type="button"
                                            style={sidebarStyles.removeButton as React.CSSProperties}
                                            onClick={() => onDataObjectRemove(index)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>ID</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={dataObject.id}
                                            onChange={(e) => onDataObjectUpdate(index, 'id', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>名称</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={dataObject.name}
                                            onChange={(e) => onDataObjectUpdate(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>项目主题引用</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={dataObject.itemSubjectRef || ''}
                                            onChange={(e) => onDataObjectUpdate(index, 'itemSubjectRef', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>是否集合</label>
                                        <select
                                            style={sidebarStyles.select as React.CSSProperties}
                                            value={dataObject.isCollection ? 'true' : 'false'}
                                            onChange={(e) => onDataObjectUpdate(index, 'isCollection', e.target.value === 'true')}
                                        >
                                            <option value="false">否</option>
                                            <option value="true">是</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Extension Properties */}
                        <div style={sidebarStyles.formGroup as React.CSSProperties}>
                            <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>扩展属性</label>
                                <button
                                    type="button"
                                    style={sidebarStyles.addButton as React.CSSProperties}
                                    onClick={() => onExtensionPropertyAdd()}
                                >
                                    添加属性
                                </button>
                            </div>
                            {processConfig.extensionProperties.map((property: any, index: number) => (
                                <div key={index} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                        <strong>属性 {index + 1}</strong>
                                        <button
                                            type="button"
                                            style={sidebarStyles.removeButton as React.CSSProperties}
                                            onClick={() => onExtensionPropertyRemove(index)}
                                        >
                                            删除
                                        </button>
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>属性名</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={property.name}
                                            onChange={(e) => onExtensionPropertyUpdate(index, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                        <label style={sidebarStyles.label as React.CSSProperties}>属性值</label>
                                        <input
                                            style={sidebarStyles.input as React.CSSProperties}
                                            type="text"
                                            value={property.value}
                                            onChange={(e) => onExtensionPropertyUpdate(index, 'value', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        )
    }

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
        e.preventDefault();
        const newExtension: any = { $type: `flowable:${extensionType}` };

        if (extensionType === 'taskListener' || extensionType === 'executionListener') {
            newExtension.event = 'create';
            newExtension.expression = '${expression}';
        } else if (extensionType === 'field') {
            newExtension.name = 'fieldName';
            newExtension.string = 'fieldValue';
        }

        const updatedExtensions = [...extensionElements, newExtension];
        onPropertyChange('extensionElements', updatedExtensions);
    };

    // Remove an extension element
    const removeExtensionElement = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        const updatedValues = [...extensionElements];
        updatedValues.splice(index, 1);
        const updatedExtensions = updatedValues;
        onPropertyChange('extensionElements', updatedExtensions);
    };

    // Update an extension element property
    const updateExtensionElement = (index: number, prop: string, value: any) => {
        const updatedValues = [...extensionElements];
        updatedValues[index][prop] = value;
        const updatedExtensions = updatedValues;
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

                {/* Node Documentation */}
                <div style={sidebarStyles.formGroup as React.CSSProperties}>
                    <label style={sidebarStyles.label as React.CSSProperties}>描述文档</label>
                    <textarea
                        style={{ ...sidebarStyles.input as React.CSSProperties, height: '80px' }}
                        value={data.documentation || ''}
                        onChange={(e) => onPropertyChange('documentation', e.target.value)}
                        placeholder="输入节点描述文档..."
                    />
                </div>

                {/* Node Extension Properties */}
                <div style={sidebarStyles.formGroup as React.CSSProperties}>
                    <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                        <label style={sidebarStyles.label as React.CSSProperties}>扩展属性</label>
                        <button
                            type="button"
                            style={sidebarStyles.addButton as React.CSSProperties}
                            onClick={() => {
                                const currentProps = data.extensionProperties || [];
                                const newProperty = {
                                    name: 'propertyName',
                                    value: 'propertyValue'
                                };
                                onPropertyChange('extensionProperties', [...currentProps, newProperty]);
                            }}
                        >
                            添加属性
                        </button>
                    </div>
                    {(data.extensionProperties || []).map((property: any, index: number) => (
                        <div key={index} style={sidebarStyles.extensionGroup as React.CSSProperties}>
                            <div style={sidebarStyles.extensionHeader as React.CSSProperties}>
                                <strong>属性 {index + 1}</strong>
                                <button
                                    type="button"
                                    style={sidebarStyles.removeButton as React.CSSProperties}
                                    onClick={() => {
                                        const currentProps = data.extensionProperties || [];
                                        const updatedProps = currentProps.filter((_: any, i: number) => i !== index);
                                        onPropertyChange('extensionProperties', updatedProps);
                                    }}
                                >
                                    删除
                                </button>
                            </div>
                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>属性名</label>
                                <input
                                    style={sidebarStyles.input as React.CSSProperties}
                                    type="text"
                                    value={property.name}
                                    onChange={(e) => {
                                        const currentProps = data.extensionProperties || [];
                                        const updatedProps = currentProps.map((prop: any, i: number) =>
                                            i === index ? { ...prop, name: e.target.value } : prop
                                        );
                                        onPropertyChange('extensionProperties', updatedProps);
                                    }}
                                />
                            </div>
                            <div style={sidebarStyles.formGroup as React.CSSProperties}>
                                <label style={sidebarStyles.label as React.CSSProperties}>属性值</label>
                                <input
                                    style={sidebarStyles.input as React.CSSProperties}
                                    type="text"
                                    value={property.value}
                                    onChange={(e) => {
                                        const currentProps = data.extensionProperties || [];
                                        const updatedProps = currentProps.map((prop: any, i: number) =>
                                            i === index ? { ...prop, value: e.target.value } : prop
                                        );
                                        onPropertyChange('extensionProperties', updatedProps);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
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
    );
};
