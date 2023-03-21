import { createMarkdownToVueRenderer, Imports, MarkdownPlugin } from "../markdownIt"
import { hotRelaodImportCode } from "../hmr"
import { Options as MarkdownItOptions } from 'markdown-it'
import { Alias } from "../index"
import ContentManager from "./contentManager"
import toFunction from "./toFunction"
import transpile from 'vue-template-es2015-compiler'

export default async function (params: {
  code: string;
  id: string;
  markdownItOptions: MarkdownItOptions;
  markdownItPlugins: MarkdownPlugin[];
  alias: Alias
}): Promise<string> {
  const { code, id, markdownItOptions, markdownItPlugins, alias } = params
  const renderer = createMarkdownToVueRenderer(markdownItOptions, markdownItPlugins, id, alias)
  const contentManager = new ContentManager()
  const isProduction = process.env.NODE_ENV === 'production'
  const { vueTemplate, imports, components } = renderer(code)

  _insertComponentsImportsCode(contentManager, imports)
  _insertHmrCode(contentManager, id, isProduction)
  await _insertCompileCode(contentManager, vueTemplate, isProduction, id)
  _insertExportCode(contentManager, components)

  return contentManager.export()
}

function _insertHmrCode(contentManager: ContentManager, id: string, isProduction: boolean) {
  if (!isProduction) {
    contentManager.addContext(hotRelaodImportCode)
    contentManager.addContext(`import.meta.hot.accept((update) => {
      __MD_VUE2_HMR_RUNTIME__.rerender("${id}", update);
    });`)
  }
}

function _insertComponentsImportsCode(contentManager: ContentManager, imports: Imports) {
  for (const { name, path } of imports) {
    contentManager.addContext(`import ${name} from "${path}";`)
  }
}

async function _insertCompileCode(contentManager: ContentManager, vueTemplate: string, isProduction: boolean, id: string) {
  let renderCode = ''
  let staticRenderCode = ''
  await import('vue-template-compiler')
      .then((res) => {
        const { render, staticRenderFns } = res.default.compile(vueTemplate)
        renderCode = render
        staticRenderCode = `var staticRenderFns = [${staticRenderFns.map(toFunction)}];`
      })
      .catch(async() => (await import('@vue/compiler-sfc')))
      .then((res) => {
        if (res?.default) {
          const source = vueTemplate.match(/<template>([\s\S]*)<\/template>/)?.[1] || ''
          const { code } = res.default.compileTemplate({ source, filename: id })
          renderCode = code.match(/var render\s*=\s*function render\s*\(\)\s*\{([^}]*)\}/)?.[1] || ''
          staticRenderCode = code.match(/var staticRenderFns\s*=\s*\[[\s\S\]]*\]/)?.[0] || `var staticRenderFns = [];`
        }
      })
      .catch((err) => {
        console.log(err)
        process.exit(1)
      })
  const compiledVueCode = transpile(
    [
      staticRenderCode,
      !isProduction
        ? `var render = ${toFunction(`
          __MD_VUE2_HMR_RUNTIME__.createRecord("${id}", this);
          ${renderCode}
        `)};`
        : `var render = ${toFunction(renderCode)}`,
      !isProduction ? `render._withStripped = true;` : ''
    ].join('\n'),
    {}
  )
  contentManager.addContext(compiledVueCode)
}

function _insertExportCode(contentManager: ContentManager, components: string[]) {
  contentManager.addExport('render')
  contentManager.addExport('staticRenderFns')
  contentManager.addDefaultExport(`{ render, staticRenderFns, components: {${components.join(',')}} }`)
}