/**
 * Basic Usage Example - 重构版本
 * 使用新的bpmn-moddle集成API
 */

import { BpmnExport, BpmnConverter } from '../src/index';
import { X6GraphData } from '../src/types';

// 示例图形数据，包含节点的位置和大小信息
const graphData: X6GraphData = {
    nodes: [
        {
            id: 'start_1',
            shape: 'bpmn-start-event',
            x: 100,
            y: 100,
            width: 36,
            height: 36,
            data: {
                name: '开始事件'
            }
        },
        {
            id: 'task_1',
            shape: 'bpmn-user-task',
            x: 200,
            y: 80,
            width: 100,
            height: 80,
            data: {
                name: '用户任务',
                flowable: {
                    assignee: 'user1',
                    formKey: 'userTaskForm'
                }
            }
        },
        {
            id: 'gateway_1',
            shape: 'bpmn-exclusive-gateway',
            x: 350,
            y: 95,
            width: 50,
            height: 50,
            data: {
                name: '排他网关'
            }
        },
        {
            id: 'task_2',
            shape: 'bpmn-service-task',
            x: 450,
            y: 60,
            width: 100,
            height: 80,
            data: {
                name: '服务任务',
                flowable: {
                    delegateExpression: '${serviceDelegate}'
                }
            }
        },
        {
            id: 'task_3',
            shape: 'bpmn-script-task',
            x: 450,
            y: 160,
            width: 100,
            height: 80,
            data: {
                name: '脚本任务',
                flowable: {
                    scriptFormat: 'javascript',
                    script: 'execution.setVariable("result", "processed");'
                }
            }
        },
        {
            id: 'end_1',
            shape: 'bpmn-end-event',
            x: 600,
            y: 115,
            width: 36,
            height: 36,
            data: {
                name: '结束事件'
            }
        }
    ],
    edges: [
        {
            id: 'flow_1',
            source: 'start_1',
            target: 'task_1',
            data: {
                name: '开始流'
            }
        },
        {
            id: 'flow_2',
            source: 'task_1',
            target: 'gateway_1',
            data: {
                name: '任务完成'
            }
        },
        {
            id: 'flow_3',
            source: 'gateway_1',
            target: 'task_2',
            data: {
                name: '条件A',
                conditionExpression: '${condition == "A"}'
            }
        },
        {
            id: 'flow_4',
            source: 'gateway_1',
            target: 'task_3',
            data: {
                name: '条件B',
                conditionExpression: '${condition == "B"}'
            }
        },
        {
            id: 'flow_5',
            source: 'task_2',
            target: 'end_1',
            data: {
                name: '完成A'
            }
        },
        {
            id: 'flow_6',
            source: 'task_3',
            target: 'end_1',
            data: {
                name: '完成B'
            }
        }
    ]
};

/**
 * 示例1：使用静态方法导出BPMN
 */
async function exportToBpmnExample() {
    try {
        console.log('🚀 开始导出 BPMN...');

        const result = await BpmnExport.toBpmn(graphData, {
            processId: 'ExampleProcess',
            processName: '示例业务流程',
            namespace: 'flowable',
            targetNamespace: 'http://example.com/bpmn',
            includeDI: true,
            format: true
        });

        console.log('✅ BPMN 导出成功！');
        console.log('📄 生成的 XML:');
        console.log(result.data);

        if (result.warnings && result.warnings.length > 0) {
            console.warn('⚠️ 警告信息:', result.warnings);
        }

        return result.data;
    } catch (error) {
        console.error('❌ BPMN 导出失败:', error);
        throw error;
    }
}

/**
 * 示例2：使用BpmnConverter类
 */
async function converterExample() {
    try {
        console.log('🔧 使用 BpmnConverter 实例...');

        // 创建转换器实例
        const converter = new BpmnConverter({
            namespace: 'camunda',
            targetNamespace: 'http://camunda.org/example',
            includeDI: true
        });

        // 导出到BPMN
        const exportResult = await converter.convertToBpmn(graphData);
        console.log('✅ 导出成功');

        // 重新导入验证
        const importResult = await converter.convertFromBpmn(exportResult.data as string);
        console.log('✅ 导入成功，获得节点数量:', (importResult.data as X6GraphData).nodes.length);

        return { exportResult, importResult };
    } catch (error) {
        console.error('❌ 转换失败:', error);
        throw error;
    }
}

/**
 * 示例3：自定义节点转换器
 */
async function customConverterExample() {
    try {
        console.log('🎨 注册自定义转换器...');

        const converter = new BpmnConverter({
            namespace: 'flowable'
        });

        // 注册自定义用户任务转换器
        converter.registerNodeConverter('bpmn-user-task', {
            toBpmn(node, moddle) {
                const userTask = moddle.create('bpmn:UserTask', {
                    id: node.id,
                    name: node.data?.name || ''
                });

                // 添加自定义表单信息
                if (node.data?.flowable?.formKey) {
                    userTask.formKey = node.data.flowable.formKey;
                }

                // 添加自定义属性
                if (node.data?.priority) {
                    userTask.priority = node.data.priority;
                }

                return userTask;
            },

            fromBpmn(bpmnElement, moddle) {
                return {
                    data: {
                        name: bpmnElement.name,
                        flowable: {
                            formKey: bpmnElement.formKey
                        },
                        priority: bpmnElement.priority
                    }
                };
            }
        });

        const result = await converter.convertToBpmn(graphData);
        console.log('✅ 自定义转换成功！');
        return result.data;
    } catch (error) {
        console.error('❌ 自定义转换失败:', error);
        throw error;
    }
}

/**
 * 运行所有示例
 */
async function runExamples() {
    console.log('🌟 BPMN Export Plugin 示例\n');

    try {
        await exportToBpmnExample();
        console.log('\n' + '='.repeat(50) + '\n');

        await converterExample();
        console.log('\n' + '='.repeat(50) + '\n');

        await customConverterExample();
        console.log('\n✨ 所有示例执行完成！');
    } catch (error) {
        console.error('💥 示例执行失败:', error);
    }
}

// 导出示例函数供外部调用
export {
    exportToBpmnExample,
    converterExample,
    customConverterExample,
    runExamples,
    graphData
};

// 可以调用 runExamples() 来运行示例 