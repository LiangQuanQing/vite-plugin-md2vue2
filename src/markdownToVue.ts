import MarkdownIt from 'markdown-it'

interface MarkdownCompileResult {
  vueTemplate: string
}

export const createMarkdownRenderer = () => {
  const md = MarkdownIt({
    html: true
  })

  const render = md.render
  const wrappedRender: (src: string, env?: any) => { html: string; data: any } = (src) => {
    ;(md as any).__data = {}
    const html = render.call(md, src)
    return {
      html,
      data: (md as any).__data
    }
  }
  ;(md as any).render = wrappedRender

  return md as any
}

export function createMarkdownToVueRenderFn() {
  const md = createMarkdownRenderer()

  return (code: string, filePath: string): MarkdownCompileResult => {
    md.urlPath = filePath
    const { html } = md.render(code)
    const vueTemplate = `<template><div>${html}</div></template>`

    return {
      vueTemplate
    }
  }
}
