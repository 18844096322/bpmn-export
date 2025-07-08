# X6 BPMN Export Plugin 🚀

基于bpmn-moddle的标准BPMN导入导出插件，为AntV X6图形编辑器提供完整的BPMN 2.0支持。

## ✨ 重构亮点

本插件已全面重构，采用**bpmn-moddle**作为底层解析引擎，确保：

- ✅ **100%标准合规** - 完全符合BPMN 2.0规范
- ✅ **图形信息完整** - 包含完整的bpmndi图形布局信息  
- ✅ **多引擎支持** - 支持Flowable、Camunda、Activiti
- ✅ **扩展性强** - 插件化转换器架构
- ✅ **类型安全** - 完整的TypeScript类型定义

## 📦 安装

```bash
npm install @x6-plugin/bpmn-export
```

## 🚀 快速开始

### 静态方法使用

```typescript
import { BpmnExport } from '@x6-plugin/bpmn-export';

// 导出BPMN
const result = await BpmnExport.toBpmn(graphData, {
    processId: 'MyProcess',
    processName: '我的业务流程',
    namespace: 'flowable',
    includeDI: true,
    format: true
});

console.log(result.data); // 标准BPMN XML

// 导入BPMN
const importResult = await BpmnExport.fromBpmn(bpmnXml);
console.log(importResult.data); // X6图形数据
```

### 转换器实例使用

```typescript
import { BpmnConverter } from '@x6-plugin/bpmn-export';

const converter = new BpmnConverter({
    namespace: 'camunda',
    targetNamespace: 'http://example.com/bpmn'
});

// 导出
const exportResult = await converter.convertToBpmn(graphData);

// 导入  
const importResult = await converter.convertFromBpmn(bpmnXml);
```

### 插件集成使用

```typescript
import { Graph } from '@antv/x6';
import { BpmnExportPlugin } from '@x6-plugin/bpmn-export';

const graph = new Graph({
    container: document.getElementById('container')!,
    plugins: [
        new BpmnExportPlugin({
            namespace: 'flowable',
            includeDI: true
        })
    ]
});

// 使用扩展的Graph方法
const result = await (graph as any).exportToBpmn();
await (graph as any).importFromBpmn(bpmnXml);
```

## 🔧 配置选项

```typescript
interface BpmnExportOptions {
    /** 目标命名空间 */
    targetNamespace?: string;
    /** 流程ID */
    processId?: string;
    /** 流程名称 */
    processName?: string;
    /** BPMN引擎类型 */
    namespace?: 'flowable' | 'camunda' | 'activiti';
    /** 自定义节点类型映射 */
    nodeTypeMappings?: Record<string, string>;
    /** 包含图形信息 */
    includeDI?: boolean;
    /** 格式化XML输出 */
    format?: boolean;
}
```

## 🎨 自定义转换器

### 注册节点转换器

```typescript
converter.registerNodeConverter('bpmn-user-task', {
    toBpmn(node, moddle) {
        const userTask = moddle.create('bpmn:UserTask', {
            id: node.id,
            name: node.data?.name || ''
        });

        // 添加Flowable属性
        if (node.data?.flowable?.assignee) {
            userTask['flowable:assignee'] = node.data.flowable.assignee;
        }

        return userTask;
    },

    fromBpmn(bpmnElement, moddle) {
        return {
            data: {
                name: bpmnElement.name,
                flowable: {
                    assignee: bpmnElement['flowable:assignee']
                }
            }
        };
    }
});
```

### 注册边转换器

```typescript
converter.registerEdgeConverter('custom-flow', {
    toBpmn(edge, moddle) {
        const flow = moddle.create('bpmn:SequenceFlow', {
            id: edge.id,
            sourceRef: edge.source,
            targetRef: edge.target,
            name: edge.data?.name
        });

        if (edge.data?.condition) {
            flow.conditionExpression = moddle.create('bpmn:FormalExpression', {
                body: edge.data.condition
            });
        }

        return flow;
    },

    fromBpmn(sequenceFlow, moddle) {
        return {
            data: {
                name: sequenceFlow.name,
                condition: sequenceFlow.conditionExpression?.body
            }
        };
    }
});
```

## 📊 支持的BPMN元素

### 事件 (Events)
- ✅ StartEvent - 开始事件
- ✅ EndEvent - 结束事件  
- ✅ IntermediateCatchEvent - 中间捕获事件
- ✅ IntermediateThrowEvent - 中间抛出事件
- ✅ BoundaryEvent - 边界事件

### 任务 (Tasks)  
- ✅ Task - 基础任务
- ✅ UserTask - 用户任务
- ✅ ServiceTask - 服务任务
- ✅ ScriptTask - 脚本任务
- ✅ SendTask - 发送任务
- ✅ ReceiveTask - 接收任务
- ✅ ManualTask - 手工任务
- ✅ BusinessRuleTask - 业务规则任务
- ✅ CallActivity - 调用活动

### 网关 (Gateways)
- ✅ ExclusiveGateway - 排他网关
- ✅ InclusiveGateway - 包容网关
- ✅ ParallelGateway - 并行网关
- ✅ EventBasedGateway - 事件网关

### 数据对象
- ✅ DataObject - 数据对象
- ✅ DataStoreReference - 数据存储引用

### 流程流
- ✅ SequenceFlow - 序列流（支持条件表达式）

## 🏗️ 架构设计

```
X6 Graph Data
      ↓
 BpmnConverter
      ↓ 
  bpmn-moddle ←→ BPMN Object Model
      ↓                 ↑
Standard BPMN XML ←→ XML Parser
```

### 核心组件

1. **BpmnConverter** - 主转换器，处理X6数据与BPMN对象模型的转换
2. **bpmn-moddle** - 官方BPMN解析器，确保标准合规性
3. **转换器注册表** - 支持自定义节点和边的转换逻辑
4. **类型系统** - 完整的TypeScript类型定义

## 🔥 生成的BPMN XML特性

### 完整的XML结构
```xml
<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL"
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
             xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
             xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
             xmlns:flowable="http://flowable.org/bpmn"
             targetNamespace="http://example.com/bpmn"
             exporter="X6 BPMN Export Plugin"
             exporterVersion="2.0.0">
             
  <!-- 业务流程定义 -->
  <process id="MyProcess" name="业务流程" isExecutable="true">
    <!-- 流程元素 -->
  </process>
  
  <!-- 图形布局信息 -->
  <bpmndi:BPMNDiagram id="BPMNDiagram_xxx">
    <bpmndi:BPMNPlane id="BPMNPlane_xxx" bpmnElement="MyProcess">
      <!-- 节点图形信息 -->
      <bpmndi:BPMNShape id="BPMNShape_xxx" bpmnElement="nodeId">
        <dc:Bounds x="100" y="100" width="100" height="80" />
      </bpmndi:BPMNShape>
      
      <!-- 连线图形信息 -->
      <bpmndi:BPMNEdge id="BPMNEdge_xxx" bpmnElement="flowId">
        <di:waypoint x="150" y="140" />
        <di:waypoint x="250" y="140" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>
```

### 引擎特定属性支持

**Flowable属性示例：**
```xml
<userTask id="userTask1" name="审批任务" 
          flowable:assignee="manager"
          flowable:formKey="approvalForm">
```

**Camunda属性示例：**
```xml
<serviceTask id="serviceTask1" name="服务调用"
             camunda:delegateExpression="${serviceDelegate}"
             camunda:async="true">
```

## 📖 API文档

### BpmnConverter类

```typescript
class BpmnConverter {
    constructor(options?: Partial<BpmnExportOptions>);
    
    // 转换方法
    convertToBpmn(graphData: X6GraphData): Promise<ConversionResult>;
    convertFromBpmn(xml: string): Promise<ConversionResult>;
    
    // 注册自定义转换器
    registerNodeConverter(nodeType: string, converter: NodeConverter): void;
    registerEdgeConverter(edgeType: string, converter: EdgeConverter): void;
    
    // 配置管理
    setOptions(options: Partial<BpmnExportOptions>): void;
}
```

### 转换结果

```typescript
interface ConversionResult {
    /** 转换后的数据 */
    data: string | X6GraphData;
    /** 转换警告 */
    warnings?: string[];
    /** 元素ID映射 */
    elementsById?: Record<string, any>;
}
```

## 🧪 测试示例

```typescript
// 往返转换测试
const originalData = { nodes: [...], edges: [...] };

// X6 → BPMN
const exportResult = await converter.convertToBpmn(originalData);
const bpmnXml = exportResult.data as string;

// BPMN → X6
const importResult = await converter.convertFromBpmn(bpmnXml);
const roundTripData = importResult.data as X6GraphData;

// 验证数据完整性
assert.equal(originalData.nodes.length, roundTripData.nodes.length);
assert.equal(originalData.edges.length, roundTripData.edges.length);
```

## 🔄 从旧版本迁移

### API变更对照

| 旧版本API | 新版本API |
|-----------|-----------|
| `exportXML()` | `exportToBpmn()` |
| `importXML(xml)` | `importFromBpmn(xml)` |
| `validateOnExport` | 移除（使用bpmn-moddle内置验证）|
| `formatXML` | `format` |

### 配置变更

```typescript
// 旧配置
{
    validateOnExport: true,
    formatXML: true,
    includeExtensionElements: true
}

// 新配置  
{
    includeDI: true,
    format: true,
    namespace: 'flowable'
}
```

## 🛠️ 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test

# 运行示例
npm run example
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

**通过这次重构，我们实现了:**

1. ✅ **技术债务清理** - 移除自制XML生成逻辑
2. ✅ **标准合规** - 使用官方bpmn-moddle确保BPMN 2.0兼容性
3. ✅ **架构优化** - 清晰的职责分离和模块化设计
4. ✅ **API改进** - 更直观强大的开发者体验
5. ✅ **扩展性增强** - 插件化转换器支持自定义扩展

这为插件的长期发展奠定了坚实的技术基础！🚀 