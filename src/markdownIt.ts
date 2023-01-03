import MarkdownIt from 'markdown-it'
import type MarkdownItType from 'markdown-it'
import type { Options as MarkdownItOptions } from 'markdown-it'
import path from 'path'
import get from 'lodash.get'

const RE = /^\s*---\n([\s\S]*)\n---/

export type MarkdownPlugin<T = any> =
  | MarkdownItType.PluginSimple
  | MarkdownItType.PluginWithOptions<T>
  | MarkdownItType.PluginWithParams

export interface MarkdownCompileResult {
  vueTemplate: string
  imports: Imports
  components: string[]
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

function _handleChangeTemplateVariable(
  code: string,
  datas: Datas,
  values: Datas,
  paths: string[]
): string {
  let resultCode = code
  for (const [key, value] of Object.entries(values)) {
    paths.push(key)
    if (typeof value === 'object' && value !== null) {
      resultCode = _handleChangeTemplateVariable(resultCode, datas, value, [
        ...paths
      ])
    } else {
      const reg = new RegExp(`\\$\\{\\s*${paths.join('\\.')}\\s*\\}`, 'gm')
      resultCode = resultCode.replace(reg, get(datas, paths.join('.'), ''))
    }
    paths.pop()
  }
  return resultCode
}

function _handleConfig(
  code: string,
  id: string
): { imports: Imports; datas: Datas; components: string[] } {
  let configText = ''
  let obj: any = {}
  if (RE.test(code)) {
    const execResult = RE.exec(code)
    configText = execResult?.[1] || ''
  }
  try {
    obj = JSON.parse(configText)
  } catch (error) {
    // nothing to do
  }
  const componentsConfig =
    typeof obj.components === 'object' && obj.components !== null
      ? obj.components
      : {}
  const { imports, components } = _handleImports(componentsConfig, id)
  const datas: Datas = typeof obj.data === 'object' && obj.data !== null ? obj.data : {}
  return { imports, datas, components }
}

function _handleImports(
  componentsConfig: { [name: string]: string },
  id: string
): {
  imports: Imports
  components: string[]
} {
  const imports: Imports = []
  const components: string[] = []
  for (const [name, url] of Object.entries(componentsConfig)) {
    imports.push({ name, path: path.resolve(path.dirname(id), url) })
    components.push(name)
  }
  return { imports, components }
}

export function createMarkdownToVueRenderer(
  options: MarkdownItOptions,
  plugins: MarkdownPlugin[],
  id: string
) {
  const renderer = getMarkdownRender(options, plugins)
  return (code: string): MarkdownCompileResult => {
    const { imports, components, datas } = _handleConfig(code, id)
    const resultCode = _handleChangeTemplateVariable(
      code,
      datas,
      datas,
      []
    ).replace(RE, '')
    const html = renderer.render(resultCode)
    const vueTemplate = `<template><div>${html}</div></template>`
    return {
      vueTemplate,
      imports,
      components
    }
  }
}
