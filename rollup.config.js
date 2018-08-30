import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    output: [
        {
            file: 'lib/index.js',
            format: 'cjs'
        },
        {
            file: '../react-enhanced-cli/boilerplates/app/src/api-manage.js',
            format: 'cjs'
        }
    ],
    external: ['axios'],
    plugins: [
        resolve({
            jsnext: true
        }),
        commonjs({
            include: 'node_modules/**'
        }),
        babel({
            exclude: ['node_modules/**']
        })
    ]
};
