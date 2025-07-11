# BPMN Export Plugin 一个可以将X6图形数据导出为BPMN XML，并支持导入BPMN XML生成图形的插件。


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