[中文](./readme_cn.md)
[English](./readme.md)

# vite-plugin-md2vue2

- 🌟 [`vite-plugin-md2vue2`](https://www.npmjs.com/package/vite-plugin-md2vue2) 是一个将markdown文件转换成vue2 render函数的vite插件
- ✅ 开发环境下支持热更新
- ✅ 支持设置 `markdown-it` 配置
- ✅ 可以将markdown文件当作vue组件来使用
- ✅ 可以在markdown文件中使用vue组件（支持全局组件和局部注册组件使用）
- ❗ 如果你使用的是 `vite-plugin-md2vue2@1.0.0` 并且将markdown文件当作vue组件来使用，你必须下载 [vite-plugin-vue2](https://github.com/underfin/vite-plugin-vue2) 
- ❗ 只支持vue2

## 下载方式

```bash
yarn add vite-plugin-md2vue2
```

### Warning

如果你使用的vue版本比 vue@2.7.0 更小，并且本地没有安装 @vue/compiler-sfc@2.x.x，**那么你必须安装和当前本地项目中vue版本一样的 vue-template-compiler**，否则会报错

```bash
yarn add vue-template-compiler # 此包的版本必须和你项目中vue版本号一致，否则有可能会报错
```

## 一些特殊的报错

- **全局组件热更新失效**
  - 有可能你在业务代码中，在注册了全局组件后，你使用了 `Vue.mixin` 全局混入了一些代码
  - 这有可能是Vue2的bug，以上操作会让 `Vue.options.components` 清空
  - 你应该尝试一下在使用 `Vue.mixin` 之后再注册全局组件


## 示例
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
      // 可选选项
      markdownItOptions: {
        linkify: true,
        typographer: true
      },
      // 可选选项
      markdownItPlugins: [emoji]
    }) as PluginOption,
    createVuePlugin()
  ]
})
```

## 插件参数
### `markdownItOptions`
  - Type: `Object`
  - Default: `{ html: true }`
### `markdownItPlugins`
  - Type: `Array`
  - Default: `[]`


## 将markdown文件当作vue组件来使用

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

## 在markdown文件中使用vue组件-全局组件

```m
### I can use vue component in markdown

<CustomGlobalComponent data="hello world" />

perfect!!!
```

## 在markdown文件中使用vue组件-局部注册组件

```md
---
{
  "components": {
    "Test": "./src/Test.vue"
  }
}
---

你要像这样，在md文件顶部设置这些配置

<Test />
```

## 在markdown文件中使用vue组件-支持vite的"resolve.alias"配置

```md
---
{
  "components": {
    "Test": "@/Test.vue"
  }
}
---

你要像这样，在md文件顶部设置这些配置

<Test />
```

## 支持模版变量替换

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

你要像这样，在md文件顶部设置这些配置

// 2.0.4 - 2.0.7
The count is ${count}  // The count is 3
Value: ${info.value}   // Value: 6

// >= 2.0.8
The count is {{ count }}  // The count is 3
Value: {{ info.value }}   // Value: 6
```

## 在Vue-Router中使用

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
