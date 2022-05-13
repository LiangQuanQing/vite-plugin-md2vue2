import { ModuleNode, Plugin } from 'vite'
import { TransformResult } from 'rollup'
import { createMarkdownToVueRenderFn } from './markdownToVue'
import ContentManager from './contentManager'
import path from 'path'
import transpile from 'vue-template-es2015-compiler'
import * as compiler from 'vue-template-compiler'

const toFunction = (code: string): string => {
  return `function () {${code}}`
}

function tf(code: string, id: string): TransformResult {
  const markdownToVue = createMarkdownToVueRenderFn()
  const contentManager = new ContentManager()
  const { vueTemplate } = markdownToVue(code, id)
  const { render, staticRenderFns } = compiler.compile(vueTemplate)

  const compiledVueCode =
    transpile(
      [
        `var render = ${toFunction(render)};`,
        `var staticRenderFns = [${staticRenderFns.map(toFunction)}];`,
        `render._withStripped = true`
      ].join('\n'),
      {}
    ) + '\n'

  contentManager.addContext(compiledVueCode)
  contentManager.addContext(
    [
      `const VueComponent = { render, staticRenderFns };`,
      `const VueComponentWith = (components) => ({ components, render, staticRenderFns });`
    ].join('')
  )

  contentManager.addExporting('VueComponent')
  contentManager.addExporting('VueComponentWith')

  contentManager.addDefaultExport(`VueComponentWith()`)

  return contentManager.export()
}

export default function (): Plugin {
  const relationsMap: { [mdPath: string]: Set<string> } = {}
  const aliasMap: { [alias: string]: string } = {}

  return {
    name: 'vite-plugin-md2vue2',

    enforce: 'pre',

    configResolved(resolvedConfig) {
      const alias = resolvedConfig.resolve.alias
      const { find, replacement } = alias[0]
      if (typeof find === 'string') {
        aliasMap[find as string] = replacement
      }
    },

    transform(code, id) {
      if (id.endsWith('.md')) return tf(code, id)
      if (id.endsWith('.vue')) {
        const allImports = code?.match(/\.*(import\s+\w+\s+from\s+\'(.+\.md)\')/g)
        const allRelativePaths: string[] = allImports?.map((str) => /\.*(import\s+\w+\s+from\s+\'(.+\.md)\')/g.exec(str)?.[2] as string) || []
        const aliasKeys = Object.keys(aliasMap)
        const mdPaths = []
        for (const relativePath of allRelativePaths) {
          const currentAlias = aliasKeys.filter((alias) => relativePath.startsWith(alias))
          if (currentAlias.length) {
            const alias = currentAlias[0]
            const prev = aliasMap[alias]
            mdPaths.push(path.resolve(prev, relativePath.replace(new RegExp(`^${alias}\/?`), '')))
          } else {
            mdPaths.push(path.resolve(path.dirname(id), relativePath))
          }
        }
        for (const mdPath of mdPaths) {
          if (!relationsMap[mdPath]) {
            relationsMap[mdPath] = new Set()
          }
          relationsMap[mdPath].add(id)
        }
      }
      return code
    },

    handleHotUpdate(ctx) {
      const { file, server, modules } = ctx
      if (file.endsWith('.md')) {
        let vueModules:ModuleNode[] = []
        const vueAbsolutePaths = Array.from(relationsMap[file] || [])
        for (const vueAbsolutePath of vueAbsolutePaths) {
          vueModules = [
            ...vueModules,
            ...(Array.from(server.moduleGraph.getModulesByFile(vueAbsolutePath) as Set<ModuleNode>))
          ]
        }
        return [...modules, ...vueModules]
      }
    }
  }
}
