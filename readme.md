[中文](https://github.com/LiangQuanQing/vite-plugin-md2vue2/blob/main/readme_cn.md)
[English](https://github.com/LiangQuanQing/vite-plugin-md2vue2/blob/main/readme.md)

# vite-plugin-md2vue2

- 🌟 [`vite-plugin-md2vue2`](https://www.npmjs.com/package/vite-plugin-md2vue2) is a vite plugin for transforming markdown files to vue2 render functions.
- ✅ Support hmr in development environment.
- ✅ Support custom markdown-it configurations.
- ✅ You can use vue-components in markdown files.
- ✅ You can also use markdown files as vue-components in vue files.
- ❗ If you use `vite-plugin-md2vue2@1.0.0` and use markdown files as vue-components in vue files, you must install [vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2) before using `vite-plugin-md2vue2`.
- ❗ Only vue2 is supported. 

## Install

```bash
yarn add vite-plugin-md2vue2
```

### Warning

If you are using an earlier version of vue@2.7.0 and do not have @vue/compiler-sfc@2.x.x installed, **you must install vue-template-compiler, which is the same version as the current vue.**

```bash
yarn add vue-template-compiler # version of current vue
```

## Example
```js
import { createVuePlugin } from 'vite-plugin-vue2'
import { defineConfig, PluginOption } from 'vite'
import md2Vue2Plugin from 'vite-plugin-md2vue2'

export default defineConfig({
  plugins: [md2Vue2Plugin() as PluginOption, createVuePlugin()]
})
```

```js
// You can also set some markdown-it configurations.
import { createVuePlugin } from 'vite-plugin-vue2'
import { defineConfig, PluginOption } from 'vite'
import md2Vue2Plugin from 'vite-plugin-md2vue2'
import emoji from 'markdown-it-emoji'

export default defineConfig({
  plugins: [
    md2Vue2Plugin({
      // https://markdown-it.docschina.org/
      // optional
      markdownItOptions: {
        linkify: true,
        typographer: true
      },
      // optional
      markdownItPlugins: [emoji]
    }) as PluginOption,
    createVuePlugin()
  ]
})
```

## Plugin Options
### `markdownItOptions`
  - Type: `Object`
  - Default: `{ html: true }`
### `markdownItPlugins`
  - Type: `Array`
  - Default: `[]`


## Import Markdown as Vue components

```html
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

## Use Vue Components inside your Markdown (global component)

```md
### I can use vue component in markdown

<CustomGlobalComponent data="hello world" />

perfect!!!
```

## Use Vue Components inside your Markdown (local registration)

```md
---
{
  "components": {
    "Test": "./src/Test.vue"
  }
}
---

You must set the component or data configuration at the very top of the md file.

<Test />
```

## Use Vue Components inside your Markdown (support vite-config "resolve.alias")

```md
---
{
  "components": {
    "Test": "@/Test.vue"
  }
}
---

You must set the component or data configuration at the very top of the md file.

<Test />
```

## Template variable conversion

```md
---
{
  "components": {
    "Test": "./src/Test.vue"
  },
  "data": {
    "count": 3,
    "info": {
      "value": 6,
      "other": {
        "is": false,
        "no": "nothing"
      }
    }
  }
}
---

You must set the component or data configuration at the very top of the md file.

// 2.0.4 - 2.0.7
The count is ${count}  // The count is 3
Value: ${info.value}   // Value: 6

// >= 2.0.8
The count is {{ count }}  // The count is 3
Value: {{ info.value }}   // Value: 6
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
