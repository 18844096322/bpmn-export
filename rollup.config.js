import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default [
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
                declarationMap: false
            })
        ]
    }
]; 