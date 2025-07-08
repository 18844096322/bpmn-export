# BPMN Moddle 重构指南

本指南详细说明如何将插件从自定义XML解析和生成迁移到使用 `bpmn-moddle` 库。

## 重构概述

### 当前状态
您的插件已经开始使用 bpmn-moddle 重构，主要架构已经正确：

✅ **已完成部分**
- 安装了 `bpmn-moddle@9.0.2` 依赖
- 安装了 `@types/bpmn-moddle` 类型定义
- 在 `converter.ts` 中设计了基于 bpmn-moddle 的架构
- 修复了 BpmnModdle 的正确导入

⚠️ **需要完善部分**
- 移除 `utils.ts` 中不再需要的自定义XML处理函数
- 优化错误处理和类型安全
- 添加扩展属性支持 (Flowable/Camunda)

## 详细重构建议

### 1. 移除不再需要的工具函数

由于使用了 bpmn-moddle，以下自定义XML处理函数可以移除或简化：

```typescript
// src/utils.ts 中可以移除的函数：
- formatXML()          // bpmn-moddle 内置格式化
- escapeXML()          // bpmn-moddle 自动处理转义
- unescapeXML()        // bpmn-moddle 自动处理转义
```

保留的工具函数：
```typescript
// 仍然有用的函数：
- generateId()         // 生成唯一ID
- sanitizeXMLId()      // 确保ID符合XML规范
- parseConditionExpression()  // 处理条件表达式
- validateProcessStructure()  // 验证流程结构
- calculateBounds()    // 计算图形边界
```

### 2. 增强 bpmn-moddle 初始化

为了支持引擎特定的扩展属性（如Flowable、Camunda），需要使用扩展包：

```typescript
// src/converter.ts
import BpmnModdle from 'bpmn-moddle';
import flowableDescriptor from 'flowable-bpmn-moddle/resources/flowable.json';
import camundaDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';

export class BpmnConverter {
    private moddle: BpmnModdle;

    constructor(options: Partial<BpmnExportOptions> = {}) {
        this.options = { ...defaultOptions, ...options };
        
        // 根据引擎类型加载相应的扩展
        const extensions: any = {};
        
        if (this.options.namespace === 'flowable') {
            extensions.flowable = flowableDescriptor;
        } else if (this.options.namespace === 'camunda') {
            extensions.camunda = camundaDescriptor;
        }

        this.moddle = new BpmnModdle(extensions);
    }
}
```

### 3. 完善错误处理

```typescript
// src/converter.ts
async convertToBpmn(graphData: X6GraphData): Promise<ConversionResult> {
    try {
        const definitions = this.buildBpmnDefinitions(graphData);
        
        const { xml } = await this.moddle.toXML(definitions, {
            format: this.options.format,
            preamble: true
        });

        return {
            data: xml,
            warnings: []
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to convert X6 data to BPMN: ${errorMessage}`);
    }
}

async convertFromBpmn(xml: string): Promise<ConversionResult> {
    try {
        const parseResult = await this.moddle.fromXML(xml);
        const { rootElement: definitions, warnings = [] } = parseResult;

        if (!definitions) {
            throw new Error('Invalid BPMN XML: No root element found');
        }

        const graphData = this.extractX6GraphData(definitions);

        return {
            data: graphData,
            warnings: warnings.map((w: any) => w.message || String(w)),
            elementsById: parseResult.elementsById
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to parse BPMN XML: ${errorMessage}`);
    }
}
```

### 4. 增强类型安全

```typescript
// src/types.ts - 添加 bpmn-moddle 相关类型
import type { Element, ModdleElement } from 'bpmn-moddle';

export interface BpmnModdleElement extends ModdleElement {
    id?: string;
    name?: string;
    $type: string;
}

export interface BpmnDefinitions extends BpmnModdleElement {
    rootElements?: BpmnModdleElement[];
    diagrams?: BpmnModdleElement[];
}

export interface BpmnProcess extends BpmnModdleElement {
    flowElements?: BpmnModdleElement[];
}
```

### 5. 优化扩展属性处理

```typescript
// src/converter.ts
private addEngineSpecificAttributes(element: any, data: any): void {
    const namespace = this.options.namespace;

    if (!data[namespace]) return;

    // 使用 moddle 创建扩展属性
    Object.keys(data[namespace]).forEach(key => {
        const value = data[namespace][key];
        if (value !== undefined) {
            // 使用正确的命名空间前缀
            const attributeName = `${namespace}:${key}`;
            element.set(attributeName, value);
        }
    });
}

private extractEngineSpecificData(element: any): any {
    const data: any = {};
    const namespace = this.options.namespace;

    // 获取所有属性
    const attributes = element.$attrs || {};
    
    Object.keys(attributes).forEach(key => {
        if (key.startsWith(`${namespace}:`)) {
            if (!data[namespace]) data[namespace] = {};
            const propName = key.substring(namespace.length + 1);
            data[namespace][propName] = attributes[key];
        }
    });

    return data;
}
```

### 6. 添加验证和诊断

```typescript
// src/converter.ts
private validateBpmnDefinitions(definitions: any): string[] {
    const warnings: string[] = [];

    // 验证必要元素
    if (!definitions.targetNamespace) {
        warnings.push('Missing targetNamespace in definitions');
    }

    if (!definitions.rootElements || definitions.rootElements.length === 0) {
        warnings.push('No process elements found in definitions');
    }

    // 验证流程结构
    definitions.rootElements?.forEach((element: any) => {
        if (element.$type === 'bpmn:Process') {
            const validation = this.validateProcess(element);
            warnings.push(...validation);
        }
    });

    return warnings;
}

private validateProcess(process: any): string[] {
    const warnings: string[] = [];
    const flowElements = process.flowElements || [];

    // 检查开始事件
    const startEvents = flowElements.filter((el: any) => 
        el.$type === 'bpmn:StartEvent'
    );
    if (startEvents.length === 0) {
        warnings.push(`Process ${process.id} has no start event`);
    }

    // 检查结束事件
    const endEvents = flowElements.filter((el: any) => 
        el.$type === 'bpmn:EndEvent'
    );
    if (endEvents.length === 0) {
        warnings.push(`Process ${process.id} has no end event`);
    }

    return warnings;
}
```

## 安装额外依赖

如果需要支持引擎特定扩展，安装相应的模块：

```bash
# Flowable 支持
npm install flowable-bpmn-moddle

# Camunda 支持  
npm install camunda-bpmn-moddle

# Activiti 支持
npm install activiti-bpmn-moddle
```

## 使用示例

重构后的使用方式：

```typescript
import { BpmnExportPlugin } from '@x6-plugin/bpmn-export';

// 创建插件实例（支持引擎扩展）
const plugin = new BpmnExportPlugin({
    namespace: 'flowable',  // 或 'camunda', 'activiti'
    processId: 'myProcess',
    processName: 'My Business Process',
    includeDI: true
});

// 导出到 BPMN
const result = await plugin.exportToBpmn();
if (result.data) {
    console.log('Generated BPMN XML:', result.data);
}

// 从 BPMN 导入
const importResult = await plugin.importFromBpmn(bpmnXml);
if (importResult.warnings.length > 0) {
    console.warn('Import warnings:', importResult.warnings);
}
```

## 主要优势

使用 bpmn-moddle 后的优势：

1. **标准兼容性**: 完全符合 BPMN 2.0 规范
2. **类型安全**: 完整的 TypeScript 类型支持
3. **自动验证**: 内置 BPMN 模型验证
4. **扩展支持**: 支持 Flowable、Camunda 等引擎扩展
5. **性能优化**: 高效的解析和序列化
6. **维护性**: 减少自定义代码，依赖标准库

## 注意事项

1. **破坏性变更**: 此重构可能涉及API变更，建议升级主版本号
2. **测试覆盖**: 确保所有现有功能通过测试
3. **文档更新**: 更新API文档和使用示例
4. **兼容性**: 考虑为旧版本提供迁移指南

这个重构将使您的插件更加健壮、标准化和易于维护！