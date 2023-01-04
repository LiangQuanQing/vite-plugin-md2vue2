export const hotReloadFileId = '\0/vite/mdVueHotReload'

export const hotRelaodImportCode = `
import __MD_VUE2_HMR_RUNTIME__ from ${JSON.stringify(hotReloadFileId)};
import Vue from "vue";
__MD_VUE2_HMR_RUNTIME__.install(Vue);
`

export const hotReloadCode = `
var $MD_VUE2_MAP = Object.create(null);
var $MD_VUE2_INSTALLED = false;
var $MD_VUE2_VUE = null;
var __MD_VUE2_HMR_RUNTIME__ = Object.create(null);

if (typeof window !== 'undefined') {
  window.__MD_VUE2_HMR_RUNTIME__ = __MD_VUE2_HMR_RUNTIME__;
}

__MD_VUE2_HMR_RUNTIME__.install = function (vue) {
  if ($MD_VUE2_INSTALLED) return;
  $MD_VUE2_INSTALLED = true;
  if (!$MD_VUE2_VUE) {
    $MD_VUE2_VUE = vue;
  }
}

__MD_VUE2_HMR_RUNTIME__.createRecord = function (id, vm) {
  if (!$MD_VUE2_MAP[id]) {
    $MD_VUE2_MAP[id] = [];
  }
  vm && $MD_VUE2_MAP[id].push(vm);
}

__MD_VUE2_HMR_RUNTIME__.isRecorded = function (id) {
  return typeof $MD_VUE2_MAP[id] !== 'undefined';
}

__MD_VUE2_HMR_RUNTIME__.rerender = tryWrap(function (id, options) {
  var instances = $MD_VUE2_MAP[id];
  if (instances && instances.length) {
    instances.forEach(instance => {
      var globalComponents = $MD_VUE2_VUE ? $MD_VUE2_VUE.options.components : {};
      instance._staticTrees = [];
      instance.$options.components = { ...globalComponents, ...options.default.components }
      instance.$options.render = options.render;
      instance.$options.staticRenderFns = options.staticRenderFns;
      instance.$forceUpdate();
    })
  }
})

__MD_VUE2_HMR_RUNTIME__.getInstance = function (id) {
  return $MD_VUE2_MAP[id] || null;
}

function tryWrap(fn) {
  return function () {
    try {
      fn.apply(null, arguments);
    } catch (e) {
      console.error(e);
      console.warn(
        'Something went wrong during markdown-file hot-reload. Full reload required.'
      );
    }
  };
}

export default __MD_VUE2_HMR_RUNTIME__;
`
