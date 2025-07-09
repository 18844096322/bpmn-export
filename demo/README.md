# BPMN Export Plugin Demo

这是一个基于 React + Vite 的演示应用，用于验证 X6 BPMN Export Plugin 的功能。

## 🚀 快速开始

### 1. 自动运行（推荐）

```bash
# 进入demo目录
cd demo

# 运行自动化脚本（会自动安装依赖并启动）
chmod +x run-demo.sh
./run-demo.sh
```

### 2. 手动运行

```bash
# 进入demo目录
cd demo

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📖 使用说明

### Demo功能

1. **预设示例流程** - 页面加载时会自动创建一个包含开始事件、用户任务、排他网关和结束事件的示例流程
2. **导出BPMN** - 支持两种导出方式：
   - 插件方法：通过Graph实例上扩展的方法导出
   - 静态方法：通过BpmnExport命名空间的静态方法导出
3. **导入BPMN** - 可以将BPMN XML导入回图形画布
4. **下载文件** - 将生成的BPMN XML保存为.bpmn文件
5. **图形操作** - 清空画布、重置示例数据

### 技术特性验证

- ✅ **插件集成** - 验证BpmnExportPlugin能正确集成到X6图形中
- ✅ **方法扩展** - 验证Graph实例上的BPMN相关方法能正常工作
- ✅ **静态方法** - 验证BpmnExport命名空间的静态方法功能
- ✅ **数据转换** - 验证X6图形数据与BPMN XML的双向转换
- ✅ **引擎属性** - 验证Flowable引擎特定属性的支持
- ✅ **图形信息** - 验证BPMN DI图形布局信息的生成和解析

## 🎯 验证重点

### 1. 插件架构验证

```typescript
// 验证插件能正确注册和初始化
const bpmnPlugin = new BpmnExportPlugin({
  namespace: 'flowable',
  includeDI: true,
  format: true
});

graph.use(bpmnPlugin); // 应该成功注册
```

### 2. API调用验证

```typescript
// 验证Graph扩展方法
const result = await graph.exportToBpmn();
await graph.importFromBpmn(bpmnXml);

// 验证静态方法
const result = await BpmnExport.toBpmn(graphData);
const result = await BpmnExport.fromBpmn(bpmnXml);
```

### 3. 数据完整性验证

- 节点属性正确映射
- 边关系保持完整
- 图形位置信息准确
- 引擎特定属性保留

## 🔧 开发调试

### 查看生成的BPMN XML

导出的BPMN XML会显示在页面下方的文本框中，您可以：

1. 复制XML到BPMN编辑器（如Camunda Modeler）中查看
2. 验证XML结构是否符合BPMN 2.0标准
3. 检查是否包含正确的namespace声明
4. 确认图形信息（BPMN DI）是否完整

### 常见问题排查

1. **插件加载失败**
   - 检查控制台是否有导入错误
   - 确认../src/index.ts文件存在

2. **导出失败**
   - 查看控制台错误信息
   - 确认图形中有有效的节点和边

3. **导入失败**
   - 检查BPMN XML格式是否正确
   - 确认XML包含有效的流程定义

## 📊 示例输出

成功运行后，您应该能看到类似这样的BPMN XML输出：

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
  <process id="Process_Demo" name="Demo Process" isExecutable="true">
    <!-- 流程元素 -->
  </process>
  <bpmndi:BPMNDiagram>
    <!-- 图形信息 -->
  </bpmndi:BPMNDiagram>
</definitions>
```

## 🎨 自定义测试

您可以在demo中进行以下自定义测试：

1. **添加新节点** - 手动在画布中添加节点和连线
2. **修改属性** - 通过代码修改节点的data属性
3. **测试不同引擎** - 尝试camunda或activiti namespace
4. **导入外部BPMN** - 将现有的BPMN文件内容粘贴到文本框中导入

---

**通过这个demo，您可以全面验证BPMN Export Plugin的所有核心功能！** 🎉 