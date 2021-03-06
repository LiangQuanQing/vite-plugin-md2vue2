import MarkdownIt from 'markdown-it'
import type MarkdownItType from 'markdown-it'
import type { Options as MarkdownItOptions } from 'markdown-it'

export type MarkdownPlugin<T = any> = MarkdownItType.PluginSimple | MarkdownItType.PluginWithOptions<T> | MarkdownItType.PluginWithParams

export interface MarkdownCompileResult {
  vueTemplate: string
}

export function getMarkdownRender(options: MarkdownItOptions, plugins: MarkdownPlugin[]) {
  const renderer = MarkdownIt({
    ...options,
    html: true
  })
  for (const plugin of plugins) {
    renderer.use(plugin)
  }
  return renderer
}

export function createMarkdownToVueRenderer(options: MarkdownItOptions, plugins: MarkdownPlugin[]) {
  const renderer = getMarkdownRender(options, plugins)
  return (code: string): MarkdownCompileResult => {
    const html = renderer.render(code)
    const vueTemplate = `<template><div>${html}</div></template>`
    return {
      vueTemplate
    }
  }
}
