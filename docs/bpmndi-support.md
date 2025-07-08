# BPMN Export Plugin 重构架构

## 🚀 重构概览

我们成功将BPMN导出插件重构为基于**bpmn-moddle**的架构，这确保了完全符合BPMN 2.0标准，并提供了更好的扩展性和维护性。

## 📊 架构对比

### 之前的架构（手工XML生成）
```
X6 Data → 自制转换器 → 手工生成XML → BPMN XML
```

### 重构后的架构（bpmn-moddle集成）
```
X6 Data → BpmnConverter → bpmn-moddle → 标准BPMN对象模型 → 标准BPMN XML
```

## 🎯 核心优势

### 1. **标准合规性**
- ✅ 使用官方bpmn-moddle库，确保100%符合BPMN 2.0规范
- ✅ 自动处理所有XML命名空间和元数据
- ✅ 支持完整的BPMN图形信息（bpmndi）

### 2. **扩展性提升**
- ✅ 插件化的节点/边转换器系统
- ✅ 支持多种BPMN引擎（Flowable、Camunda、Activiti）
- ✅ 完善的类型系统和错误处理

### 3. **维护性改善**
- ✅ 模块化架构，职责分离清晰
- ✅ 减少代码重复，提高代码质量
- ✅ 更好的测试和调试支持

## 🔧 新的API设计

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

### 插件集成使用
```typescript
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
const result = await graph.exportToBpmn();
await graph.importFromBpmn(bpmnXml);
```

## 🎨 自定义转换器

### 节点转换器示例
```typescript
converter.registerNodeConverter('bpmn-user-task', {
    toBpmn(node, moddle) {
        const userTask = moddle.create('bpmn:UserTask', {
            id: node.id,
            name: node.data?.name || ''
        });

        // 添加Flowable属性
        if (node.data?.flowable) {
            Object.keys(node.data.flowable).forEach(key => {
                userTask[`flowable:${key}`] = node.data.flowable[key];
            });
        }

        return userTask;
    },

    fromBpmn(bpmnElement, moddle) {
        const flowableData = {};
        
        // 提取Flowable属性
        Object.keys(bpmnElement).forEach(key => {
            if (key.startsWith('flowable:')) {
                const propName = key.substring(9);
                flowableData[propName] = bpmnElement[key];
            }
        });

        return {
            data: {
                name: bpmnElement.name,
                flowable: flowableData
            }
        };
    }
});
```

## 📈 性能优化

### 1. **减少序列化开销**
- 直接使用bpmn-moddle的对象模型，避免中间转换
- 优化大型流程图的处理性能

### 2. **内存使用优化**
- 按需加载BPMN包（bpmn, bpmndi, dc, di）
- 更好的垃圾回收策略

### 3. **错误处理改进**
- 详细的转换警告和错误信息
- 更好的调试支持

## 🔄 迁移指南

### API变更
```typescript
// 旧版本
const xml = await bpmnExport.exportXML();
await bpmnExport.importXML(xml);

// 新版本
const result = await bpmnExport.exportToBpmn();
await bpmnExport.importFromBpmn(result.data as string);
```

### 配置变更
```typescript
// 旧版本
{
    validateOnExport: true,
    formatXML: true,
    includeExtensionElements: true
}

// 新版本
{
    includeDI: true,
    format: true,
    namespace: 'flowable'
}
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

### 测试支持
```typescript
// 往返测试
const exportResult = await converter.convertToBpmn(originalData);
const importResult = await converter.convertFromBpmn(exportResult.data);
const roundTripData = importResult.data as X6GraphData;

// 验证数据完整性
assert.equal(originalData.nodes.length, roundTripData.nodes.length);
```

## 📝 总结

通过这次重构，我们实现了：

1. **技术债务清理** - 移除了自制的XML生成逻辑
2. **标准合规** - 使用官方BPMN库确保规范一致性  
3. **架构优化** - 更清晰的职责分离和模块化设计
4. **API改进** - 更直观和强大的开发者体验
5. **未来扩展** - 为后续功能扩展奠定了坚实基础

这个重构为插件的长期发展和维护奠定了坚实的技术基础。 