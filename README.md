# x6-bpmn-export-plugin

[![npm version](https://badge.fury.io/js/x6-bpmn-export-plugin.svg)](https://badge.fury.io/js/x6-bpmn-export-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个用于 AntV X6 的 BPMN XML 导入/导出插件，支持将 X6 图形数据转换为标准的 BPMN 2.0 XML 格式。

## ✨ 特性

- 🚀 支持 X6 图形数据与 BPMN XML 的双向转换
- 📊 支持多种 BPMN 元素类型（任务、网关、事件等）
- 🔧 支持流程引擎扩展（Flowable、Camunda、Activiti）
- 📝 支持流程级和节点级的文档、扩展属性
- 🎯 支持全局事件定义（消息、错误、信号、升级）
- 🔄 支持多实例配置和循环特性
- 📐 支持 BPMN DI（图形信息）的导入导出
- 🎛️ 支持任务监听器、执行监听器等扩展元素
- 🔗 支持条件表达式和脚本配置

## 📦 安装

```bash
npm install x6-bpmn-export-plugin
```

## 📊 架构

```
X6 Data → BpmnConverter → bpmn-moddle → 标准BPMN对象模型 → 标准BPMN XML
```

## 🔨 使用

### 静态方法使用
```typescript
import { BpmnExport } from '@x6-plugin/bpmn-export';

// 导出BPMN
const result = await BpmnExport.toBpmn(graphData, {
    namespace: 'flowable',
    includeDI: true,
    format: true
});

// 导入BPMN
const graphData = await BpmnExport.fromBpmn(xmlString);
```

### 实例化使用
```typescript
import { BpmnConverter } from '@x6-plugin/bpmn-export';

const converter = new BpmnConverter({
    processId: 'MyProcess',
    namespace: 'camunda',
    targetNamespace: 'http://example.com/bpmn'
});

// 自定义转换器
converter.registerNodeConverter('custom-task', {
    toBpmn(node, moddle) {
        return moddle.create('bpmn:ServiceTask', {
            id: node.id,
            name: node.data?.name
        });
    },
    fromBpmn(element, moddle) {
        return {
            data: { name: element.name }
        };
    }
});
```

### 插件集成使用（推荐）
```typescript
import { BpmnExportPlugin } from '@x6-plugin/bpmn-export';

const graph = new Graph({
    container: document.getElementById('container')!,
});

graph.use(BpmnExportPlugin({
    namespace: 'flowable', // 命名空间
    includeDI: true, // 是否包含BPMN DI信息
    format: true, // 格式化XML输出
}));

// 使用扩展的Graph方法
const result = await graph.exportToBpmn();
await graph.importFromBpmn(bpmnXml);
```
### 节点形状

| 形状名称 | BPMN类型 | 描述 |
|---------|----------|------|
| `bpmn-task` | Task | 基础任务 |
| `bpmn-user-task` | UserTask | 用户任务 |
| `bpmn-service-task` | ServiceTask | 服务任务 |
| `bpmn-script-task` | ScriptTask | 脚本任务 |
| `bpmn-start-event` | StartEvent | 开始事件 |
| `bpmn-end-event` | EndEvent | 结束事件 |
| `bpmn-intermediate-event` | IntermediateEvent | 中间事件 |
| `bpmn-exclusive-gateway` | ExclusiveGateway | 排他网关 |
| `bpmn-parallel-gateway` | ParallelGateway | 并行网关 |
| `bpmn-inclusive-gateway` | InclusiveGateway | 包容网关 |
| `bpmn-data-object` | DataObject | 数据对象 |
| `bpmn-data-store` | DataStoreReference | 数据存储 |
| `bpmn-sub-process` | SubProcess | 子流程 |
| `bpmn-call-activity` | CallActivity | 调用活动 |
| `bpmn-business-rule-task` | BusinessRuleTask | 业务规则任务 |
| `bpmn-event-based-gateway` | EventBasedGateway | 事件网关 |
| `bpmn-manual-task` | ManualTask | 手动任务 |
| `bpmn-receive-task` | ReceiveTask | 接收任务 |
| `bpmn-send-task` | SendTask | 发送任务 |


### 边形状

| 形状名称 | BPMN类型 | 描述 |
|---------|----------|------|
| `bpmn-sequence-flow` | SequenceFlow | 序列流 |
| `bpmn-message-flow` | MessageFlow | 消息流 |
| `bpmn-association` | Association | 关联线 |

## 🔧 自定义形状

### 覆盖内置形状

您可以覆盖任何内置的BPMN形状定义：

```typescript
import { registerCustomBpmnShape } from '@x6-plugin/bpmn-export';

// 自定义用户任务样式
registerCustomBpmnShape('bpmn-user-task', {
  inherit: 'rect',
  width: 120,
  height: 80,
  attrs: {
    body: {
      strokeWidth: 3,
      stroke: '#FF6B35',
      fill: '#FFE7E0',
      rx: 10,
      ry: 10,
    },
    text: {
      fontSize: 14,
      fill: '#000',
      fontWeight: 'bold',
    },
  },
}, false, true); // isEdge=false, override=true
```

### 添加新的BPMN形状

```typescript
// 添加自定义的业务规则任务
registerCustomBpmnShape('bpmn-business-rule-task', {
  inherit: 'bpmn-task',
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'text' },
    { tagName: 'path', selector: 'rule-icon' },
  ],
  attrs: {
    body: {
      stroke: '#722ED1',
      fill: '#F9F0FF',
    },
    'rule-icon': {
      d: 'M8,8 L12,8 M8,10 L12,10 M8,12 L12,12',
      strokeWidth: 2,
      stroke: '#722ED1',
      transform: 'translate(5, 5)',
    },
  },
});
```

### 自定义边形状

```typescript
// 添加条件流
registerCustomBpmnShape('bpmn-conditional-flow', {
  inherit: 'edge',
  attrs: {
    line: {
      stroke: '#FA8C16',
      strokeWidth: 2,
      strokeDasharray: '8 4',
      targetMarker: {
        name: 'block',
        width: 12,
        height: 8,
        fill: '#FA8C16',
      },
      sourceMarker: {
        name: 'diamond',
        width: 8,
        height: 8,
        fill: '#FA8C16',
      },
    },
  },
}, true); // isEdge=true
```

## 🔍 形状检查工具

### 检查形状是否已注册

```typescript
import { isShapeRegistered } from '@x6-plugin/bpmn-export';

// 检查节点形状
if (isShapeRegistered('bpmn-user-task')) {
  console.log('用户任务形状已注册');
}

// 检查边形状
if (isShapeRegistered('bpmn-sequence-flow', true)) {
  console.log('序列流形状已注册');
}
```

### 获取已注册的形状列表

```typescript
import { getRegisteredBpmnShapes } from '@x6-plugin/bpmn-export';

const registeredShapes = getRegisteredBpmnShapes();
console.log('已注册的节点形状:', registeredShapes.nodes);
console.log('已注册的边形状:', registeredShapes.edges);
```

## 📚 完整示例

```typescript
import { Graph } from '@antv/x6';
import { 
  BpmnExportPlugin,
  registerBpmnShapes,
  registerCustomBpmnShape,
  getRegisteredBpmnShapes 
} from '@x6-plugin/bpmn-export';

// 1. 预注册所有BPMN形状
registerBpmnShapes();

// 2. 自定义特殊形状
registerCustomBpmnShape('my-custom-task', {
  inherit: 'bpmn-task',
  attrs: {
    body: { stroke: '#FF0000', fill: '#FFE6E6' }
  }
});

// 3. 检查注册情况
const shapes = getRegisteredBpmnShapes();
console.log('可用的BPMN形状:', shapes);

// 4. 创建Graph并使用插件
const graph = new Graph({
  container: document.getElementById('container')!
});

const bpmnPlugin = new BpmnExportPlugin({
  namespace: 'flowable',
  includeDI: true
});

graph.use(bpmnPlugin);

// 5. 安全使用BPMN形状
graph.addNode({
  shape: 'bpmn-start-event',
  x: 100,
  y: 100,
  label: '开始'
});

graph.addNode({
  shape: 'bpmn-user-task',
  x: 250,
  y: 100,
  label: '用户任务'
});

graph.addEdge({
  shape: 'bpmn-sequence-flow',
  source: { x: 150, y: 125 },
  target: { x: 250, y: 125 }
});
```

## 🛠️ 开发工具

### 调试支持
```typescript
const result = await converter.convertToBpmn(graphData);

// 检查警告
if (result.warnings.length > 0) {
    console.warn('转换警告:', result.warnings);
}

// 检查生成的XML
console.log('生成的BPMN XML:', result.data);
```

## 📋 支持的BPMN元素类型

### 🎯 事件类型
| X6 Shape | BPMN 类型 | 描述 |
|----------|-----------|------|
| `bpmn-start-event` | StartEvent | 开始事件 |
| `bpmn-start-message-event` | StartEvent | 消息开始事件 |
| `bpmn-start-timer-event` | StartEvent | 定时开始事件 |
| `bpmn-end-event` | EndEvent | 结束事件 |
| `bpmn-end-message-event` | EndEvent | 消息结束事件 |
| `bpmn-intermediate-event` | IntermediateCatchEvent | 中间捕获事件 |
| `bpmn-boundary-event` | BoundaryEvent | 边界事件 |

### 📋 任务类型
| X6 Shape | BPMN 类型 | 描述 |
|----------|-----------|------|
| `bpmn-task` | Task | 基础任务 |
| `bpmn-user-task` | UserTask | 用户任务 |
| `bpmn-service-task` | ServiceTask | 服务任务 |
| `bpmn-script-task` | ScriptTask | 脚本任务 |
| `bpmn-send-task` | SendTask | 发送任务 |
| `bpmn-receive-task` | ReceiveTask | 接收任务 |
| `bpmn-manual-task` | ManualTask | 手工任务 |
| `bpmn-business-rule-task` | BusinessRuleTask | 业务规则任务 |
| `bpmn-call-activity` | CallActivity | 调用活动 |

### 🔀 网关类型
| X6 Shape | BPMN 类型 | 描述 |
|----------|-----------|------|
| `bpmn-exclusive-gateway` | ExclusiveGateway | 排他网关 |
| `bpmn-inclusive-gateway` | InclusiveGateway | 包容网关 |
| `bpmn-parallel-gateway` | ParallelGateway | 并行网关 |
| `bpmn-event-based-gateway` | EventBasedGateway | 事件网关 |

### 🏗️ 其他元素
| X6 Shape | BPMN 类型 | 描述 |
|----------|-----------|------|
| `bpmn-subprocess` | SubProcess | 子流程 |
| `bpmn-data-object` | DataObject | 数据对象 |
| `bpmn-data-store` | DataStoreReference | 数据存储引用 |

## 🔧 业务属性配置

插件支持丰富的BPMN业务属性配置，这些属性通过节点的`data`字段进行设置，并在导出时转换为相应的BPMN XML元素。

### 📝 通用属性（所有节点类型）

#### 基础属性
```typescript
{
  id: string,              // 节点唯一标识符
  name: string,            // 节点显示名称
  documentation: string,   // 节点描述文档
  async: boolean          // 是否异步执行（仅任务类型）
}
```

#### 扩展属性
```typescript
{
  extensionProperties: Array<{
    name: string,    // 属性名
    value: string    // 属性值
  }>
}
```

### 👤 用户任务 (UserTask) 专有属性

```typescript
{
  assignee: string,           // 办理人
  candidateUsers: string,     // 候选用户（逗号分隔）
  candidateGroups: string,    // 候选组（逗号分隔）
  dueDate: string,           // 到期时间
  priority: string           // 优先级
}
```

**示例：**
```typescript
const userTaskData = {
  name: "审批任务",
  assignee: "admin",
  candidateUsers: "user1,user2,user3",
  candidateGroups: "managers,supervisors",
  documentation: "这是一个需要管理员审批的任务"
}
```

### ⚙️ 服务任务 (ServiceTask) 专有属性

```typescript
{
  implementation: string,        // 实现类全限定名
  delegateExpression: string,    // 委托表达式
  expression: string,           // 执行表达式
  resultVariable: string        // 结果变量名
}
```

**示例：**
```typescript
const serviceTaskData = {
  name: "发送邮件",
  implementation: "com.example.EmailService",
  delegateExpression: "${emailService}",
  async: true
}
```

### 📜 脚本任务 (ScriptTask) 专有属性

```typescript
{
  scriptFormat: string,    // 脚本语言格式（如：javascript, groovy）
  script: string,         // 脚本内容
  resultVariable: string  // 结果变量名
}
```

**示例：**
```typescript
const scriptTaskData = {
  name: "计算总价",
  scriptFormat: "javascript",
  script: "var total = price * quantity; execution.setVariable('total', total);",
  resultVariable: "calculatedTotal"
}
```

### 🔄 多实例配置 (Multi-Instance)

适用于所有任务类型和子流程，支持并行和串行多实例执行：

```typescript
{
  loopCharacteristics: {
    isSequential: boolean,                    // 是否串行执行
    loopCardinality: string,                 // 循环基数
    "flowable:collection": string,           // 集合变量
    "flowable:elementVariable": string,      // 元素变量
    completionCondition: string              // 完成条件
  }
}
```

**示例：**
```typescript
const multiInstanceTaskData = {
  name: "批量处理任务",
  loopCharacteristics: {
    isSequential: false,
    "flowable:collection": "userList",
    "flowable:elementVariable": "user",
    completionCondition: "${nrOfCompletedInstances == nrOfInstances}"
  }
}
```

### 🎧 扩展元素 (Extension Elements)

支持任务监听器、执行监听器和字段配置：

```typescript
{
  extensionElements: Array<{
    event: string,        // 事件类型
    class?: string,       // Java类名
    expression?: string,  // 表达式
    delegateExpression?: string,  // 委托表达式
    name?: string,        // 字段名（仅field类型）
    string?: string       // 字段值（仅field类型）
  }>
}
```

#### 任务监听器 (Task Listener)
```typescript
{
  extensionElements: [
    {
      event: "create",  // create, assignment, complete
      class: "com.example.TaskCreateListener"
    }
  ]
}
```

#### 执行监听器 (Execution Listener)
```typescript
{
  extensionElements: [
    {
      event: "start",  // start, end, take
      expression: "${listenerBean.onStart(execution)}"
    }
  ]
}
```

#### 字段配置 (Field)
```typescript
{
  extensionElements: [
    {
      name: "emailTemplate",
      string: "welcome-email.html"
    }
  ]
}
```

### 🌐 流程级属性

流程级属性通过导出选项进行配置：

```typescript
const exportOptions = {
  processId: "demo-process",
  processName: "演示流程",
  isExecutable: true,
  documentation: "这是一个演示流程",

  // 流程级执行监听器
  executionListeners: [
    {
      event: "start",
      class: "com.example.ProcessStartListener"
    }
  ],

  // 流程级事件监听器
  eventListeners: [
    {
      event: "PROCESS_STARTED",
      class: "com.example.ProcessEventListener"
    }
  ],

  // 流程级扩展属性
  extensionProperties: [
    {
      name: "timeout",
      value: "30000"
    }
  ],

  // 数据对象定义
  dataObjects: [
    {
      id: "customerData",
      name: "客户数据",
      itemSubjectRef: "CustomerType"
    }
  ]
}
```

### 🌍 全局事件定义

支持消息、错误、信号和升级事件的全局定义：

```typescript
const globalEvents = {
  // 消息定义
  messages: [
    {
      id: "paymentRequest",
      name: "支付请求消息"
    }
  ],

  // 错误定义
  errors: [
    {
      id: "paymentError",
      name: "支付错误",
      errorCode: "PAYMENT_FAILED"
    }
  ],

  // 信号定义
  signals: [
    {
      id: "approvalSignal",
      name: "审批信号"
    }
  ],

  // 升级定义
  escalations: [
    {
      id: "timeoutEscalation",
      name: "超时升级",
      escalationCode: "TIMEOUT"
    }
  ]
}
```

## 🚀 完整使用示例

### 创建复杂的业务流程

```typescript
import { Graph } from '@antv/x6'
import { BpmnExportPlugin } from 'x6-bpmn-export-plugin'

// 创建图形实例
const graph = new Graph({
  container: document.getElementById('container')!,
  width: 1200,
  height: 800
})

// 注册插件
graph.use(new BpmnExportPlugin({
  namespace: 'flowable',
  processId: 'order-process',
  processName: '订单处理流程'
}))

// 添加开始事件
graph.addNode({
  id: 'start',
  shape: 'bpmn-start-event',
  x: 100,
  y: 200,
  data: {
    name: '订单创建',
    documentation: '客户创建新订单时触发'
  }
})

// 添加用户任务
graph.addNode({
  id: 'review-task',
  shape: 'bpmn-user-task',
  x: 300,
  y: 200,
  data: {
    name: '订单审核',
    assignee: 'reviewer',
    candidateGroups: 'sales-team',
    documentation: '销售团队审核订单信息',
    extensionProperties: [
      { name: 'formKey', value: 'order-review-form' }
    ],
    extensionElements: [
      {
        event: 'create',
        class: 'com.example.OrderReviewTaskListener'
      }
    ]
  }
})

// 添加服务任务
graph.addNode({
  id: 'payment-task',
  shape: 'bpmn-service-task',
  x: 500,
  y: 200,
  data: {
    name: '处理支付',
    implementation: 'com.example.PaymentService',
    async: true,
    documentation: '调用支付服务处理订单支付',
    extensionElements: [
      {
        name: 'paymentGateway',
        string: 'stripe'
      }
    ]
  }
})

// 添加脚本任务
graph.addNode({
  id: 'calculate-task',
  shape: 'bpmn-script-task',
  x: 700,
  y: 200,
  data: {
    name: '计算折扣',
    scriptFormat: 'javascript',
    script: `
      var discount = 0;
      if (orderAmount > 1000) {
        discount = orderAmount * 0.1;
      }
      execution.setVariable('discount', discount);
    `,
    resultVariable: 'calculatedDiscount'
  }
})

// 添加连接线
graph.addEdge({
  source: 'start',
  target: 'review-task',
  shape: 'bpmn-sequence-flow'
})

graph.addEdge({
  source: 'review-task',
  target: 'payment-task',
  shape: 'bpmn-sequence-flow'
})

graph.addEdge({
  source: 'payment-task',
  target: 'calculate-task',
  shape: 'bpmn-sequence-flow'
})

// 导出BPMN
const exportResult = await graph.exportToBpmn({
  namespace: 'flowable',
  includeDI: true,
  format: true,
  globalEvents: {
    messages: [
      { id: 'orderCreated', name: '订单创建消息' }
    ],
    errors: [
      { id: 'paymentFailed', name: '支付失败', errorCode: 'PAYMENT_ERROR' }
    ]
  }
})

console.log(exportResult.data) // 生成的BPMN XML
```

## 📖 API 参考

### BpmnExportPlugin 配置选项

```typescript
interface BpmnExportOptions {
  targetNamespace?: string          // BPMN目标命名空间
  processId?: string               // 流程ID
  processName?: string             // 流程名称
  isExecutable?: boolean           // 是否可执行
  namespace?: 'flowable' | 'camunda' | 'activiti'  // 引擎类型
  includeDI?: boolean              // 是否包含图形信息
  format?: boolean                 // 是否格式化XML
  documentation?: string           // 流程文档
  executionListeners?: Array<...>  // 执行监听器
  eventListeners?: Array<...>      // 事件监听器
  dataObjects?: Array<...>         // 数据对象
  extensionProperties?: Array<...> // 扩展属性
}
```

### 导出方法

```typescript
// 插件方法
const result = await graph.exportToBpmn(options)

// 静态方法
const result = await BpmnExport.toBpmn(graphData, options)
```

### 导入方法

```typescript
// 插件方法
await graph.importFromBpmn(bpmnXml, options)

// 静态方法
const graphData = await BpmnExport.fromBpmn(bpmnXml, options)
```

## 🔍 故障排除

### 常见问题

1. **扩展属性未正确导出**
   - 确保扩展属性数组格式正确
   - 检查属性名和值是否为字符串类型

2. **监听器配置无效**
   - 确保事件类型与监听器类型匹配

3. **多实例配置不生效**
   - 检查`loopCharacteristics`对象结构
   - 确保集合变量和元素变量名称正确

## 📄 许可证

MIT License
