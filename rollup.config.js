
import typescript from "rollup-plugin-typescript2"
import sourceMaps from 'rollup-plugin-sourcemaps'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from '@rollup/plugin-replace'

export default {
    input: 'src/reactivity/src/index.ts',
    output: [
        {
            format: "cjs",
            file: 'lib/tiny-vue.cjs.js',
            sourcemap: true,
        },
        {
            name: "vue",
            format: "es",
            file: 'lib/tiny-vue.esm.js',
            sourcemap: true,
        },
    ],
    plugins: [
        typescript({
            outDir: 'lib',
            declaration: true,
            declarationDir: 'lib'
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.VUE_ENV': JSON.stringify('browser'),
            'process.env.LANGUAGE': JSON.stringify(process.env.LANGUAGE)
        }),
        resolve(),
        commonjs(),
        sourceMaps()
    ]
}