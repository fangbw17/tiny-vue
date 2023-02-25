import commonjs from 'rollup-plugin-commonjs'
import typescript from "rollup-plugin-typescript2"
export default {
    input: 'src/index.ts',
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
        commonjs()
    ]
}