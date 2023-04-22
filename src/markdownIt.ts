import MarkdownIt from 'markdown-it'
import path from 'path'
import { errorLog } from './utils/log'
import type { Options as MarkdownItOptions } from 'markdown-it'
import type { Alias } from './index'
import type MarkdownItType from 'markdown-it'

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
      errorLog('There is a problem with the format of the json data you configured.(你md文件中定义的json配置格式不正确)')
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
  const getAliasKeyReg = (aliasKey: string | RegExp): RegExp => {
    const key = typeof aliasKey === "string" && /[\\/]$/.test(aliasKey) ? aliasKey.slice(0, aliasKey.length - 1) : aliasKey
    return typeof key === "string" ? new RegExp(`^${key}/`) : key;
  }

  for (let [name, url] of Object.entries(componentsConfig)) {
    let complete = false;
    let isAbsolutePath = false

    if (/^[\\/]/.test(url)) {
      let isMap = false
      for (const [aliasKey] of alias) {
        const reg = getAliasKeyReg(aliasKey);
        if (reg.test(url)) {
          isMap = true
          break;
        }
      }
      if (!isMap) {
        isAbsolutePath = true
        url = path.join(process.cwd(), url);
        complete = true;
      }
    }

    if (!isAbsolutePath) {
      for (const [aliasKey, aliasPath] of alias) {
        const reg = getAliasKeyReg(aliasKey);
        if (reg.test(url)) {
          url = path.join(aliasPath, url.replace(reg, ""));
          complete = true;
          break;
        }
      }
    }

    if (!complete) {
      imports.push({ name, path: path.resolve(path.dirname(id), url).replace(/\\/g, "/") });
    } else {
      imports.push({ name, path: url.replace(/\\/g, "/") });
    }
    components.push(name);
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
