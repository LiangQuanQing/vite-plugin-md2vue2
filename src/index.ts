import { Plugin } from 'vite'
import { hotReloadFileId, hotReloadCode } from './hmr'
import { Options as MarkdownItOptions } from 'markdown-it'
import { MarkdownPlugin } from './markdownIt'
import transformCode from './utils/transform'

export interface PluginOptions {
  markdownItOptions?: MarkdownItOptions
  markdownItPlugins?: MarkdownPlugin[]
}

export interface Alias {
  [alias: string]: string
}

export default function (options: PluginOptions = {}): Plugin {
  const alias: Alias = {}

  return {
    name: 'vite-plugin-md2vue2',

    configResolved(resolvedConfig) {
      const aliasConfig = resolvedConfig.resolve.alias
      const { find, replacement } = aliasConfig[0]
      if (typeof find === 'string') {
        alias[find as string] = replacement
      }
    },

    resolveId(id) {
      if (id === hotReloadFileId) return id
    },

    load(id) {
      if (id === hotReloadFileId) return hotReloadCode
    },

    transform(code, id) {
      if (id.endsWith('.md'))
        return {
          code: transformCode({
            code,
            id,
            markdownItOptions: options.markdownItOptions || {},
            markdownItPlugins: options.markdownItPlugins || [],
            alias
          })
        }
      return { code }
    }
  }
}
