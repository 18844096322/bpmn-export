/**
 * BPMN Shapes Registration
 * 预定义BPMN相关的节点和边形状，确保插件能正常工作
 */

import { Graph, Node, Edge } from '@antv/x6';

/**
 * BPMN节点形状定义
 */
export const BpmnNodeShapes = {
    // 基础任务节点
    'bpmn-task': {
        inherit: 'rect',
        width: 100,
        height: 60,
        attrs: {
            body: {
                strokeWidth: 2,
                stroke: '#5F95FF',
                fill: '#EFF4FF',
                rx: 6,
                ry: 6,
            },
            text: {
                fontSize: 12,
                fill: '#262626',
            },
        },
        ports: {
            groups: {
                top: {
                    position: 'top',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#5F95FF',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
                right: {
                    position: 'right',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#5F95FF',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
                bottom: {
                    position: 'bottom',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#5F95FF',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
                left: {
                    position: 'left',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#5F95FF',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
            },
            items: [
                { group: 'top' },
                { group: 'right' },
                { group: 'bottom' },
                { group: 'left' },
            ],
        },
    },

    // 用户任务
    'bpmn-user-task': {
        inherit: 'bpmn-task',
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'user-icon',
            },
        ],
        attrs: {
            'user-icon': {
                d: 'M8,10 C8,8.895 8.895,8 10,8 C11.105,8 12,8.895 12,10 C12,11.105 11.105,12 10,12 C8.895,12 8,11.105 8,10 Z M6,18 C6,15.791 7.791,14 10,14 C12.209,14 14,15.791 14,18 L6,18 Z',
                fill: '#5F95FF',
                strokeWidth: 1,
                stroke: '#5F95FF',
                transform: 'scale(1.5)',
            },
        },
    },

    // 服务任务
    'bpmn-service-task': {
        inherit: 'bpmn-task',
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'service-icon',
            },
        ],
        attrs: {
            'service-icon': {
                d: 'M8,8 L12,8 L12,12 L8,12 Z M9,9 L11,9 M9,10 L11,10 M9,11 L11,11',
                fill: 'none',
                strokeWidth: 1,
                stroke: '#5F95FF',
                transform: 'translate(-10, -10) scale(2.5)',
            },
        },
    },

    // 脚本任务
    'bpmn-script-task': {
        inherit: 'bpmn-task',
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'script-icon',
            },
        ],
        attrs: {
            'script-icon': {
                d: 'M8,8 L12,8 M8,10 L12,10 M8,12 L10,12',
                fill: 'none',
                strokeWidth: 1,
                stroke: '#5F95FF',
                transform: 'translate(-10, -10) scale(2.5)',
            },
        },
    },

    // 开始事件
    'bpmn-start-event': {
        inherit: 'circle',
        width: 50,
        height: 50,
        attrs: {
            body: {
                strokeWidth: 2,
                stroke: '#52C41A',
                fill: '#F6FFED',
            },
            text: {
                fontSize: 12,
                fill: '#262626',
            },
        },
        ports: {
            groups: {
                out: {
                    position: 'right',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#52C41A',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
            },
            items: [{ group: 'out' }],
        },
    },

    // 结束事件
    'bpmn-end-event': {
        inherit: 'circle',
        width: 50,
        height: 50,
        attrs: {
            body: {
                strokeWidth: 4,
                stroke: '#FF4D4F',
                fill: '#FFF2F0',
            },
            text: {
                fontSize: 12,
                fill: '#262626',
            },
        },
        ports: {
            groups: {
                in: {
                    position: 'left',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#FF4D4F',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
            },
            items: [{ group: 'in' }],
        },
    },

    // 中间事件
    'bpmn-intermediate-event': {
        inherit: 'circle',
        width: 50,
        height: 50,
        attrs: {
            body: {
                strokeWidth: 2,
                stroke: '#FA8C16',
                fill: '#FFF7E6',
            },
            text: {
                fontSize: 12,
                fill: '#262626',
            },
        },
        ports: {
            groups: {
                in: {
                    position: 'left',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#FA8C16',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
                out: {
                    position: 'right',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#FA8C16',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
            },
            items: [{ group: 'in' }, { group: 'out' }],
        },
    },

    // 排他网关
    'bpmn-exclusive-gateway': {
        inherit: 'polygon',
        width: 60,
        height: 60,
        attrs: {
            body: {
                strokeWidth: 2,
                stroke: '#FF6B35',
                fill: '#FFE7E0',
                refPoints: '0,10 10,0 20,10 10,20',
            },
            text: {
                fontSize: 10,
                fill: '#262626',
            },
        },
        ports: {
            groups: {
                in: {
                    position: 'left',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#FF6B35',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
                out: {
                    position: 'right',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#FF6B35',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
            },
            items: [{ group: 'in' }, { group: 'out' }],
        },
    },

    // 并行网关
    'bpmn-parallel-gateway': {
        inherit: 'bpmn-exclusive-gateway',
        markup: [
            {
                tagName: 'polygon',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'plus-icon',
            },
        ],
        attrs: {
            body: {
                stroke: '#722ED1',
                fill: '#F9F0FF',
            },
            'plus-icon': {
                d: 'M15,10 L25,10 M20,5 L20,15',
                strokeWidth: 2,
                stroke: '#722ED1',
                transform: 'translate(-10, 10) scale(2)',
            },
        },
    },

    // 包容网关
    'bpmn-inclusive-gateway': {
        inherit: 'bpmn-exclusive-gateway',
        markup: [
            {
                tagName: 'polygon',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'circle',
                selector: 'circle-icon',
            },
        ],
        attrs: {
            body: {
                stroke: '#13C2C2',
                fill: '#E6FFFB',
            },
            'circle-icon': {
                r: 8,
                cx: 30,
                cy: 30,
                strokeWidth: 2,
                stroke: '#13C2C2',
                fill: 'none',
                // transform: 'translate(-30, -30)',
            },
        },
    },

    // 数据对象
    'bpmn-data-object': {
        inherit: 'rect',
        width: 60,
        height: 80,
        attrs: {
            body: {
                strokeWidth: 2,
                stroke: '#1890FF',
                fill: '#E6F7FF',
                rx: 0,
                ry: 0,
            },
            text: {
                fontSize: 10,
                fill: '#262626',
            },
        },
    },

    // 数据存储
    'bpmn-data-store': {
        inherit: 'ellipse',
        width: 80,
        height: 40,
        attrs: {
            body: {
                strokeWidth: 2,
                stroke: '#1890FF',
                fill: '#E6F7FF',
            },
            text: {
                fontSize: 10,
                fill: '#262626',
            },
        },
    },

    // 开始事件变体
    'bpmn-start-message-event': {
        inherit: 'bpmn-start-event',
        markup: [
            {
                tagName: 'circle',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'message-icon',
            },
        ],
        attrs: {
            'message-icon': {
                d: 'M8,10 L12,10 L12,14 L8,14 Z M8,10 L10,12 L12,10',
                fill: 'none',
                strokeWidth: 1,
                stroke: '#52C41A',
                transform: 'translate(5, 5)',
            },
        },
    },

    'bpmn-start-timer-event': {
        inherit: 'bpmn-start-event',
        markup: [
            {
                tagName: 'circle',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'circle',
                selector: 'timer-icon',
            },
            {
                tagName: 'path',
                selector: 'timer-hands',
            },
        ],
        attrs: {
            'timer-icon': {
                r: 6,
                cx: 25,
                cy: 25,
                strokeWidth: 1,
                stroke: '#52C41A',
                fill: 'none',
            },
            'timer-hands': {
                d: 'M25,25 L25,20 M25,25 L28,28',
                strokeWidth: 1,
                stroke: '#52C41A',
            },
        },
    },

    'bpmn-start-signal-event': {
        inherit: 'bpmn-start-event',
        markup: [
            {
                tagName: 'circle',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'polygon',
                selector: 'signal-icon',
            },
        ],
        attrs: {
            'signal-icon': {
                points: '25,18 32,32 18,32',
                strokeWidth: 1,
                stroke: '#52C41A',
                fill: 'none',
            },
        },
    },

    // 结束事件变体
    'bpmn-end-message-event': {
        inherit: 'bpmn-end-event',
        markup: [
            {
                tagName: 'circle',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'message-icon',
            },
        ],
        attrs: {
            'message-icon': {
                d: 'M8,10 L12,10 L12,14 L8,14 Z M8,10 L10,12 L12,10',
                fill: '#FF4D4F',
                strokeWidth: 1,
                stroke: '#FF4D4F',
                transform: 'translate(5, 5)',
            },
        },
    },

    'bpmn-end-error-event': {
        inherit: 'bpmn-end-event',
        markup: [
            {
                tagName: 'circle',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'error-icon',
            },
        ],
        attrs: {
            'error-icon': {
                d: 'M18,18 L32,32 M32,18 L18,32',
                strokeWidth: 2,
                stroke: '#FF4D4F',
                transform: 'translate(-7, -7)',
            },
        },
    },

    'bpmn-end-terminate-event': {
        inherit: 'bpmn-end-event',
        markup: [
            {
                tagName: 'circle',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'circle',
                selector: 'terminate-icon',
            },
        ],
        attrs: {
            'terminate-icon': {
                r: 12,
                cx: 25,
                cy: 25,
                strokeWidth: 0,
                fill: '#FF4D4F',
            },
        },
    },

    // 中间事件变体
    'bpmn-intermediate-throw-event': {
        inherit: 'bpmn-intermediate-event',
        attrs: {
            body: {
                strokeWidth: 4, // 抛出事件有双线
            },
        },
    },
    // 边界事件
    'bpmn-boundary-event': {
        inherit: 'bpmn-intermediate-event',
        width: 40,
        height: 40,
        attrs: {
            body: {
                stroke: '#FA8C16',
                fill: '#FFF7E6',
                strokeDasharray: '3 3', // 边界事件通常是虚线
            },
        },
    },

    // 任务变体
    'bpmn-send-task': {
        inherit: 'bpmn-task',
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'send-icon',
            },
        ],
        attrs: {
            'send-icon': {
                d: 'M8,8 L12,10 L8,12 Z M12,10 L18,10',
                fill: 'none',
                strokeWidth: 1,
                stroke: '#5F95FF',
                transform: 'translate(-5, -5) scale(2)',
            },
        },
    },

    'bpmn-receive-task': {
        inherit: 'bpmn-task',
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'receive-icon',
            },
        ],
        attrs: {
            'receive-icon': {
                d: 'M8,8 L12,8 L12,12 L8,12 Z M8,8 L10,10 L12,8',
                fill: 'none',
                strokeWidth: 1,
                stroke: '#5F95FF',
                transform: 'translate(-5, -5) scale(2)',
            },
        },
    },

    'bpmn-manual-task': {
        inherit: 'bpmn-task',
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'manual-icon',
            },
        ],
        attrs: {
            'manual-icon': {
                d: 'M8,12 L8,10 C8,8.5 9,8 10,8 C11,8 12,8.5 12,10 L12,12 M10,8 L10,6',
                fill: 'none',
                strokeWidth: 1,
                stroke: '#5F95FF',
                transform: 'translate(-5, -5) scale(2)',
            },
        },
    },

    'bpmn-business-rule-task': {
        inherit: 'bpmn-task',
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'rect',
                selector: 'table-icon',
            },
            {
                tagName: 'path',
                selector: 'table-lines',
            },
        ],
        attrs: {
            'table-icon': {
                x: 8,
                y: 8,
                width: 12,
                height: 8,
                strokeWidth: 1,
                stroke: '#5F95FF',
                fill: 'none',
                transform: 'translate(5, 5)',
            },
            'table-lines': {
                d: 'M8,10 L20,10 M8,12 L20,12 M12,8 L12,16',
                strokeWidth: 1,
                stroke: '#5F95FF',
                transform: 'translate(-5, -5) scale(2)',
            },
        },
    },

    'bpmn-call-activity': {
        inherit: 'bpmn-task',
        attrs: {
            body: {
                strokeWidth: 4, // 调用活动有粗边框
                stroke: '#722ED1',
                fill: '#F9F0FF',
            },
        },
    },

    // 网关变体
    'bpmn-event-based-gateway': {
        inherit: 'bpmn-exclusive-gateway',
        markup: [
            {
                tagName: 'polygon',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'circle',
                selector: 'event-icon',
            },
            {
                tagName: 'polygon',
                selector: 'pentagon-icon',
            },
        ],
        attrs: {
            body: {
                stroke: '#52C41A',
                fill: '#F6FFED',
            },
            'event-icon': {
                r: 8,
                cx: 30,
                cy: 30,
                strokeWidth: 1,
                stroke: '#52C41A',
                fill: 'none',
                // transform: 'translate(-30, -30)',
            },
            'pentagon-icon': {
                points: '30,22 26,27 28,32 32,32 34,27',
                strokeWidth: 1,
                stroke: '#52C41A',
                fill: 'none',
                // transform: 'translate(-30, -30)',
            },
        },
    },

    // 子流程
    'bpmn-subprocess': {
        inherit: 'rect',
        width: 150,
        height: 100,
        markup: [
            {
                tagName: 'rect',
                selector: 'body',
            },
            {
                tagName: 'text',
                selector: 'text',
            },
            {
                tagName: 'path',
                selector: 'plus-icon',
            },
        ],
        attrs: {
            body: {
                strokeWidth: 2,
                stroke: '#1890FF',
                fill: '#E6F7FF',
                rx: 6,
                ry: 6,
            },
            text: {
                fontSize: 12,
                fill: '#262626',
            },
            'plus-icon': {
                d: 'M70,85 L80,85 M75,80 L75,90',
                strokeWidth: 2,
                stroke: '#1890FF',
            },
        },
        ports: {
            groups: {
                top: {
                    position: 'top',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#1890FF',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
                right: {
                    position: 'right',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#1890FF',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
                bottom: {
                    position: 'bottom',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#1890FF',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
                left: {
                    position: 'left',
                    attrs: {
                        circle: {
                            r: 4,
                            magnet: true,
                            stroke: '#1890FF',
                            strokeWidth: 1,
                            fill: '#fff',
                            style: {
                                visibility: 'hidden',
                            },
                        },
                    },
                },
            },
            items: [
                { group: 'top' },
                { group: 'right' },
                { group: 'bottom' },
                { group: 'left' },
            ],
        },
    },
};

/**
 * BPMN边形状定义
 */
export const BpmnEdgeShapes = {
    // 序列流
    'bpmn-sequence-flow': {
        inherit: 'edge',
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
        router: {
            name: 'manhattan',
            args: {
                padding: 1,
            },
        },
        connector: {
            name: 'rounded',
            args: {
                radius: 8,
            },
        },
    },

    // 消息流
    'bpmn-message-flow': {
        inherit: 'edge',
        attrs: {
            line: {
                stroke: '#52C41A',
                strokeWidth: 2,
                strokeDasharray: '5 5',
                targetMarker: {
                    name: 'block',
                    width: 12,
                    height: 8,
                    fill: '#52C41A',
                },
                sourceMarker: {
                    name: 'circle',
                    r: 4,
                    fill: '#52C41A',
                },
            },
        },
        router: {
            name: 'manhattan',
            args: {
                padding: 1,
            },
        },
    },

    // 关联线
    'bpmn-association': {
        inherit: 'edge',
        attrs: {
            line: {
                stroke: '#D9D9D9',
                strokeWidth: 1.5,
                strokeDasharray: '3 3',
                // targetMarker: 'none',
            },
        },
        router: {
            name: 'manhattan',
            args: {
                padding: 1,
            },
        },
    },
};

/**
 * 注册所有BPMN形状到Graph实例
 */
export function registerBpmnShapes(graph?: Graph): void {
    // 注册节点形状
    Object.entries(BpmnNodeShapes).forEach(([name, config]) => {
        // 全局注册，无论是否提供graph实例
        if (!Node.registry.exist(name)) {
            Node.registry.register(name, config, true);
        }
    });

    // 注册边形状
    Object.entries(BpmnEdgeShapes).forEach(([name, config]) => {
        // 全局注册，无论是否提供graph实例
        if (!Edge.registry.exist(name)) {
            Edge.registry.register(name, config, true);
        }
    });
}

/**
 * 检查形状是否已注册
 */
export function isShapeRegistered(shapeName: string, isEdge = false): boolean {
    if (isEdge) {
        return Edge.registry.exist(shapeName);
    }
    return Node.registry.exist(shapeName);
}

/**
 * 获取已注册的BPMN形状列表
 */
export function getRegisteredBpmnShapes(): { nodes: string[]; edges: string[] } {
    const nodeShapes = Object.keys(BpmnNodeShapes).filter(name =>
        Node.registry.exist(name)
    );
    const edgeShapes = Object.keys(BpmnEdgeShapes).filter(name =>
        Edge.registry.exist(name)
    );

    return {
        nodes: nodeShapes,
        edges: edgeShapes,
    };
}

/**
 * 用户自定义形状注册函数
 */
export function registerCustomBpmnShape(
    shapeName: string,
    config: any,
    isEdge = false,
    override = true
): void {
    if (isEdge) {
        Edge.registry.register(shapeName, config, override);
    } else {
        Node.registry.register(shapeName, config, override);
    }
} 