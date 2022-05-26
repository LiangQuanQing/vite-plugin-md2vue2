export const hotReloadFileId = '\0/vite/mdVueHotReload'

export const hotRelaodImportCode = `
  import __MD_VUE_HMR_RUNTIME__ from ${JSON.stringify(hotReloadFileId)};
  import Vue from "vue";
  __MD_VUE_HMR_RUNTIME__.install(Vue);
`

export const hotReloadCode = `
  var Vue;
  var version;
  var map = Object.create(null);
  var installed = false;
  var __MD_VUE_HMR_RUNTIME__ = Object.create(null);

  if (typeof window !== 'undefined') {
    window.__MD_VUE_HMR_RUNTIME__ = __MD_VUE_HMR_RUNTIME__;
  }

  __MD_VUE_HMR_RUNTIME__.install = function (vue, browserify) {
    if (installed) return;
    installed = true;
  }

  __MD_VUE_HMR_RUNTIME__.createRecord = function (id, vm) {
    if (!map[id]) {
      map[id] = [];
    }
    vm && map[id].push(vm);
  }

  __MD_VUE_HMR_RUNTIME__.isRecorded = function (id) {
    return typeof map[id] !== 'undefined';
  }

  __MD_VUE_HMR_RUNTIME__.rerender = tryWrap(function (id, options) {
    const instances = map[id];
    if (instances && instances.length) {
      instances.forEach(instance => {
        instance._staticTrees = [];
        instance.$options.render = options.render;
        instance.$options.staticRenderFns = options.staticRenderFns;
        instance.$forceUpdate();
      })
    }
  })

  __MD_VUE_HMR_RUNTIME__.getInstance = function (id) {
    return map[id] || null;
  }

  function tryWrap(fn) {
    return function () {
      try {
        fn.apply(null, arguments);
      } catch (e) {
        console.error(e);
        console.warn(
          'Something went wrong during Vue component hot-reload. Full reload required.'
        );
      }
    };
  }

  export default __MD_VUE_HMR_RUNTIME__;
`
