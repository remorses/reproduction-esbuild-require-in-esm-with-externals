import { build } from 'esbuild'

build({
    bundle: true,
    outdir: 'bundle',
    format: 'esm',
    target: 'es2017',
    entryPoints: ['./src/index.ts'],
    plugins: [externalCjsToEsmPlugin(['react', 'react-dom'])],
})

function externalCjsToEsmPlugin(external: string[]) {
    return {
        name: 'external',
        setup(build) {
            let escape = (text) =>
                `^${text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`
            let filter = new RegExp(external.map(escape).join('|'))
            build.onResolve(
                { filter: /.*/, namespace: 'external' },
                (args) => ({
                    path: args.path,
                    external: true,
                }),
            )
            build.onResolve({ filter }, (args) => ({
                path: args.path,
                namespace: 'external',
            }))
            build.onLoad({ filter: /.*/, namespace: 'external' }, (args) => ({
                contents: `export * from ${JSON.stringify(args.path)}`,
            }))
        },
    }
}
