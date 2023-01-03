import { createMarkdownToVueRenderer, Imports, MarkdownPlugin } from "../markdownIt"
import { hotRelaodImportCode } from "../hmr"
import { Options as MarkdownItOptions } from 'markdown-it'
import { Alias } from "../index"
import ContentManager from "./contentManager"
import toFunction from "./toFunction"
import transpile from 'vue-template-es2015-compiler'
import * as compiler from 'vue-template-compiler'

export default function (params: {
  code: string;
  id: string;
  markdownItOptions: MarkdownItOptions;
  markdownItPlugins: MarkdownPlugin[];
  alias: Alias
}): string {
  const { code, id, markdownItOptions, markdownItPlugins, alias } = params
  const renderer = createMarkdownToVueRenderer(markdownItOptions, markdownItPlugins, id, alias)
  const contentManager = new ContentManager()
  const isProduction = process.env.NODE_ENV === 'production'
  const { vueTemplate, imports, components } = renderer(code)

  _insertComponentsImportsCode(contentManager, imports)
  _insertHmrCode(contentManager, id, isProduction)
  _insertCompileCode(contentManager, vueTemplate, isProduction, id)
  _insertExportCode(contentManager, components)

  return contentManager.export()
}

function _insertHmrCode(contentManager: ContentManager, id: string, isProduction: boolean) {
  if (!isProduction) {
    contentManager.addContext(hotRelaodImportCode)
    contentManager.addContext(`import.meta.hot.accept((update) => {
      __MD_VUE_HMR_RUNTIME__.rerender("${id}", update);
    });`)
  }
}

function _insertComponentsImportsCode(contentManager: ContentManager, imports: Imports) {
  for (const { name, path } of imports) {
    contentManager.addContext(`import ${name} from "${path}";`)
  }
}

function _insertCompileCode(contentManager: ContentManager, vueTemplate: string, isProduction: boolean, id: string) {
  const { render, staticRenderFns } = compiler.compile(vueTemplate)
  const compiledVueCode =
    transpile(
      [
        `var staticRenderFns = [${staticRenderFns.map(toFunction)}];`,
        !isProduction ? `var render = ${toFunction(`
          !__MD_VUE_HMR_RUNTIME__.createRecord("${id}") && __MD_VUE_HMR_RUNTIME__.createRecord("${id}", this);
          ${render}
        `)};` : `var render = ${toFunction(render)}`,
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