## Description

- 🌟 [`vite-plugin-md2vue2`](https://www.npmjs.com/package/vite-plugin-md2vue2) is a vite plugin for converting markdown files into vue2 render functions.
- ✅ Support hmr in development environment.
- ✅ Support custom markdown-it configurations.
- ✅ You can use vue-components in markdown files.
- ✅ You can also use markdown files as vue-components in vue files.
- ❗ If you use `vite-plugin-md2vue2@1.0.0` or use markdown files as vue-components in vue files, you must install [vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2) before using `vite-plugin-md2vue2`.

## Install

```bash
yarn add vite-plugin-md2vue2 vue-template-compiler vue-template-es2015-compiler markdown-it
```

```js
import { createVuePlugin } from 'vite-plugin-vue2'
import { defineConfig } from 'vite'
import md2Vue2Plugin from 'vite-plugin-md2vue2'

export default defineConfig({
  plugins: [md2Vue2Plugin(), createVuePlugin()]
})
```

```js
// You can also set some markdown-it configurations.
import { createVuePlugin } from 'vite-plugin-vue2'
import { defineConfig } from 'vite'
import md2Vue2Plugin from 'vite-plugin-md2vue2'
import emoji from 'markdown-it-emoji'

export default defineConfig({
  plugins: [
    md2Vue2Plugin({
      // https://markdown-it.docschina.org/
      markdownItOptions: {
        linkify: true,
        typographer: true
      },
      markdownItPlugins: [emoji]
    }),
    createVuePlugin()
  ]
})
```

## Params
### `markdownItOptions`
  - Type: `Object`
  - Default: `{ html: true }`
### `markdownItPlugins`
  - Type: `Array`
  - Default: `[]`


## Usage in Vue

```html
<!-- Convert markdown files into vue2 render functions -->
<template>
  <Test />
</template>

<script>
import Test from '@/markdown-files/test.md'
export default {
  components: {
    Test
  }
}
</script>
```

## Usage in Markdown

```md
### I can use vue component in markdown

<CustomGlobalComponent :data="hello world">

perfect!!!
```

## Usage in Vue-Router

```js
import VueRouter from 'vue-router'
import Vue from 'vue'
import Test from '@/markdown-files/test.md'

Vue.use(VueRouter)

export default new VueRouter({
  routes: {
    path: '/',
    component: Test
  }
})
```