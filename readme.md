## Description

- 🌟 [`vite-plugin-md2vue2`](https://www.npmjs.com/package/vite-plugin-md2vue2) is a vite plugin for converting markdown files into vue2 render functions.
- ✅ Support hmr in development environment.
- ✅ You can use vue components inside markdown files.
- ✅ You can also use markdown files as components in vue files.
- ❗ You must install [vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2) before using `vite-plugin-md2vue2`.

## Install

```bash
yarn add vite-plugin-md2vue2 markdown-it vue-template-compiler
```

```js
import { createVuePlugin } from 'vite-plugin-vue2'
import { defineConfig } from 'vite'
import md2Vue2Plugin from 'vite-plugin-md2vue2'

export default defineConfig({
  plugins: [md2Vue2Plugin(), createVuePlugin()]
})
```

## Warnning

- You must write the file suffix when importing markdown files.
- ❌ *wrong*：`import Test from '@/markdown-files/test'`
- ✅ *correct*：`import Test from '@/markdown-files/test.md'`

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