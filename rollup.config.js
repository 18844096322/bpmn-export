const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const terser = require('@rollup/plugin-terser');

module.exports = [
    // UMD build
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/x6-bpmn-export.js',
                format: 'umd',
                name: 'X6BpmnExport',
                globals: {
                    '@antv/x6': 'X6',
                    'bpmn-js/lib/Modeler': 'BpmnModeler'
                }
            },
            {
                file: 'dist/x6-bpmn-export.min.js',
                format: 'umd',
                name: 'X6BpmnExport',
                globals: {
                    '@antv/x6': 'X6',
                    'bpmn-js/lib/Modeler': 'BpmnModeler'
                },
                plugins: [terser()]
            }
        ],
        external: ['@antv/x6', 'bpmn-js/lib/Modeler'],
        plugins: [
            resolve({
                browser: true
            }),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false,
                declarationMap: false,
                module: 'esnext'
            })
        ]
    }
]; 