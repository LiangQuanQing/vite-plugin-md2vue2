import { Plugin } from 'vite'
import { hotReloadFileId, hotReloadCode } from './hmr'
import transformCode from './utils/transform'
import { Options as MarkdownItOptions } from 'markdown-it'
import { MarkdownPlugin } from './markdownIt'

export interface PluginOptions {
  markdownItOptions?: MarkdownItOptions
  markdownItPlugins?: MarkdownPlugin[]
}

export default function (options: PluginOptions = {}): Plugin {
  return {
    name: 'vite-plugin-md2vue2',

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
            markdownItPlugins: options.markdownItPlugins || []
          })
        }
      return { code }
    }
  }
}
