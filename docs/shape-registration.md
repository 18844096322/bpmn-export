# BPMN 形状注册指南

## 🎯 解决的问题

在使用X6 BPMN插件时，如果项目中没有预先注册相应的BPMN形状，会出现类似以下错误：

```
Node with name 'bpmn-start-event' does not exist.
Edge with name 'bpmn-sequence-flow' does not exist.
```

为了解决这个问题，插件内置了完整的BPMN形状定义，并提供了灵活的注册机制。

### 插件注册

### 手动预注册

插件内置了bpmn形状的定义，并提供了`registerBpmnShapes()`方法来注册这些形状。您可以在创建Graph实例之前调用此方法：

```typescript
import { registerBpmnShapes } from '@x6-plugin/bpmn-export';

// 在创建Graph之前注册
registerBpmnShapes();

const graph = new Graph({
  container: document.getElementById('container')!
});
```

## 📋 内置BPMN形状列表

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

## ⚡ 性能优化建议

1. **按需注册**: 如果您只使用部分BPMN形状，可以手动注册具体的形状而不是全部注册
2. **一次性注册**: 在应用启动时统一注册所有需要的形状，避免运行时重复注册
3. **形状继承**: 利用形状继承机制，基于已有形状创建新形状，减少重复定义

## 🐛 常见问题

### Q: 为什么我的自定义形状没有生效？

A: 确保在使用形状之前已经注册，并且设置了 `override: true` 参数。

### Q: 如何知道某个形状已经被注册？

A: 使用 `isShapeRegistered(shapeName, isEdge)` 函数检查。

### Q: 插件会影响我项目中的其他形状吗？

A: 不会。插件只注册以 `bpmn-` 开头的形状，不会影响您现有的形状定义。

---

通过这套形状注册机制，您可以确保BPMN插件能够正常工作，同时保持高度的定制化灵活性！ 🎉 