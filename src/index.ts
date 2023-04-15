import { PluginOption } from 'vite'
import { hotReloadFileId, hotReloadCode } from './hmr'
import { Options as MarkdownItOptions } from 'markdown-it'
import { MarkdownPlugin } from './markdownIt'
import transformCode from './utils/transform'

export interface Options {
  markdownItOptions?: MarkdownItOptions
  markdownItPlugins?: MarkdownPlugin[]
}

export interface Alias {
  [alias: string]: string
}

export default function (options?: Options): PluginOption {
  const alias: Alias = {}

  return {
    name: 'vite-plugin-md2vue2',

    configResolved(resolvedConfig) {
      const aliasConfig = resolvedConfig.resolve.alias
      if (Array.isArray(aliasConfig)) {
        for (const aliasItem of aliasConfig) {
          const { find, replacement } = aliasItem
          if (typeof find === 'string') {
            alias[find as string] = replacement
          }
        }
      }
    },

    resolveId(id) {
      if (id === hotReloadFileId) return id
    },

    load(id) {
      if (id === hotReloadFileId) return hotReloadCode
    },

    async transform(code, id) {
      if (id.endsWith('.md')) {
        const resultCode = await transformCode({
          code,
          id,
          markdownItOptions: (options && options.markdownItOptions) || {},
          markdownItPlugins: (options && options.markdownItPlugins) || [],
          alias
        })
        return {
          code: resultCode
        }
      }
      return { code }
    }
  }
}
