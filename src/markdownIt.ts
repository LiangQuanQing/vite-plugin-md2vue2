import MarkdownIt from 'markdown-it'
import type MarkdownItType from 'markdown-it'
import type { Options as MarkdownItOptions } from 'markdown-it'
import type { Alias } from './index'
import path from 'path'

const RE = /^\s*---([\s\S]+?)---/

export type MarkdownPlugin<T = any> =
  | MarkdownItType.PluginSimple
  | MarkdownItType.PluginWithOptions<T>
  | MarkdownItType.PluginWithParams

export interface MarkdownCompileResult {
  vueTemplate: string
  imports: Imports
  components: string[]
  datas: object
}

export type Imports = Array<{ name: string; path: string }>

export type Datas = { [key: string]: string }

export function getMarkdownRender(
  options: MarkdownItOptions,
  plugins: MarkdownPlugin[]
) {
  const renderer = MarkdownIt({
    ...options,
    html: true
  })
  for (const plugin of plugins) {
    renderer.use(plugin)
  }
  return renderer
}

function _handleConfig(
  code: string,
  id: string,
  alias: Alias
): { imports: Imports; datas: Datas; components: string[] } {
  let configText = ''
  let obj: any = {}
  if (RE.test(code)) {
    const execResult = RE.exec(code)
    configText = execResult?.[1] || ''
  }
  if (configText) {
    try {
      obj = JSON.parse(configText)
    } catch (error) {
      console.error('There is a problem with the format of the json data you configured.(你md文件中定义的json配置格式不正确)')
    }
  }
  const componentsConfig =
    typeof obj.components === 'object' && obj.components !== null
      ? obj.components
      : {}
  const { imports, components } = _handleImports(componentsConfig, id, alias)
  const datas: Datas = typeof obj.data === 'object' && obj.data !== null ? obj.data : {}
  return { imports, datas, components }
}

function _handleImports(
  componentsConfig: { [name: string]: string },
  id: string,
  alias: Alias
): {
  imports: Imports
  components: string[]
} {
  const imports: Imports = []
  const components: string[] = []
  for (let [name, url] of Object.entries(componentsConfig)) {
    let complete = false
    if (url.startsWith('/') || url.startsWith('\\')) {
      url = path.join(process.cwd(), url)
      complete = true
    } else {
      for (const [aliasKey, aliasPath] of Object.entries(alias)) {
        const reg = new RegExp(`^${aliasKey}/`)
        if (reg.test(url)) {
          url = path.resolve(aliasPath, url.replace(reg, ''))
          complete = true
          break
        }
      }
    }
    if (!complete) {
      imports.push({ name, path: path.resolve(path.dirname(id), url).replace(/\\/g, '/') })
    } else {
      imports.push({ name, path: url.replace(/\\/g, '/') })
    }
    components.push(name)
  }
  return { imports, components }
}

export function createMarkdownToVueRenderer(
  options: MarkdownItOptions,
  plugins: MarkdownPlugin[],
  id: string,
  alias: Alias
) {
  const renderer = getMarkdownRender(options, plugins)
  return (code: string): MarkdownCompileResult => {
    const { imports, components, datas } = _handleConfig(code, id, alias)
    const resultCode = code.replace(RE, '')
    const html = renderer.render(resultCode)
    const vueTemplate = `<template><div>${html}</div></template>`
    return {
      vueTemplate,
      imports,
      components,
      datas
    }
  }
}
