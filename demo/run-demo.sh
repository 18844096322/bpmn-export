#!/bin/bash

echo "🚀 BPMN Export Plugin Demo Setup"
echo "=================================="

# 检查是否存在 package.json
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the demo directory."
    exit 1
fi

# 安装依赖
echo "📦 Installing dependencies..."
pnpm i

# 检查上级目录中的 BPMN export 插件
echo "🔍 Checking BPMN export plugin..."
if [ ! -f "../src/index.ts" ]; then
    echo "❌ Error: BPMN export plugin source not found at ../src/index.ts"
    exit 1
fi

# 编译 TypeScript（如果需要）
echo "🔧 Building project..."
if [ -f "tsconfig.json" ]; then
    npm run build 2>/dev/null || echo "⚠️  Build failed, but continuing..."
fi

# 启动开发服务器
echo "🌟 Starting development server..."
echo "📖 Demo will be available at: http://localhost:3000"
echo ""
echo "💡 Demo Features:"
echo "   - Interactive X6 graph with sample workflow"
echo "   - Export graph to BPMN XML"
echo "   - Import BPMN XML back to graph"
echo "   - Support for Flowable engine attributes"
echo "   - Download BPMN files"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

npm run dev 