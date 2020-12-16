import { build, OnResolveArgs, OnResolveResult, Plugin } from 'esbuild'
import path from 'path'
import resolve from 'resolve'
import fs from 'fs'

build({
    bundle: true,
    outdir: 'bundle',
    splitting: true,
    format: 'esm',
    target: 'es2017',
    entryPoints: [require.resolve('react'), require.resolve('react-dom')],
    plugins: [Resolver()],
}).catch(console.error)

function Resolver(): Plugin {
    const namespace = 'resolver'

    return {
        name: namespace,
        setup({ onLoad, onResolve }) {
            const resolver = async (args: OnResolveArgs) => {
                let resolved = resolve.sync(args.path, {
                    basedir: args.resolveDir,
                })
                // resolved = path.relative(process.cwd(), resolved)
                // console.log({ resolved })
                return {
                    path: resolved,
                    namespace,
                } as OnResolveResult
            }
            onResolve({ filter: /.*/ }, resolver)
            onResolve({ filter: /.*/, namespace }, resolver)
            onLoad({ filter: /.*/, namespace }, async (args) => {
                try {
                    const contents = await (
                        await fs.promises.readFile(args.path)
                    ).toString()
                    let resolveDir = path.dirname(args.path)
                    return {
                        loader: 'default',
                        contents,
                        resolveDir,
                    }
                } catch (e) {
                    throw new Error(`Cannot load ${args.path}, ${e}`)
                }
            })
        },
    }
}
