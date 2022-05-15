import { createMarkdownToVueRenderer, MarkdownPlugin } from "../markdownIt"
import { hotRelaodImportCode } from "../hmr"
import { Options as MarkdownItOptions } from 'markdown-it'
import ContentManager from "./contentManager"
import toFunction from "./toFunction"
import transpile from 'vue-template-es2015-compiler'
import * as compiler from 'vue-template-compiler'

export default function (params: {
  code: string;
  id: string;
  markdownItOptions: MarkdownItOptions;
  markdownItPlugins: MarkdownPlugin[];
}): string {
  const { code, id, markdownItOptions, markdownItPlugins } = params
  const transformMarkdownToVue = createMarkdownToVueRenderer(markdownItOptions, markdownItPlugins)
  const contentManager = new ContentManager()
  const { vueTemplate } = transformMarkdownToVue(code)
  const { render, staticRenderFns } = compiler.compile(vueTemplate)
  const isProduction = process.env.NODE_ENV === 'production'

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

  !isProduction && contentManager.addContext(hotRelaodImportCode)
  contentManager.addContext(compiledVueCode)
  !isProduction && contentManager.addContext(`import.meta.hot.accept((update) => {
    __MD_VUE_HMR_RUNTIME__.rerender("${id}", update);
  });`)

  contentManager.addExporting('render')
  contentManager.addExporting('staticRenderFns')

  contentManager.addDefaultExport(`{ render, staticRenderFns }`)

  return contentManager.export()
}