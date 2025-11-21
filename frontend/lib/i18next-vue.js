(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // globals:vue
  var require_vue = __commonJS({
    "globals:vue"(exports, module) {
      module.exports = window.Vue;
    }
  });

  // node_modules/i18next-vue/dist/index.js
  var import_vue = __toESM(require_vue(), 1);
  var INJECTION_KEY = Symbol();
  function install(app, {
    i18next,
    rerenderOn = ["languageChanged", "loaded", "added", "removed"],
    slotStart = "{",
    slotEnd = "}"
  }) {
    const lastI18nChange = (0, import_vue.shallowRef)(/* @__PURE__ */ new Date());
    const invalidate = () => (0, import_vue.nextTick)(() => {
      lastI18nChange.value = /* @__PURE__ */ new Date();
    });
    const usingI18n = () => lastI18nChange.value;
    rerenderOn.forEach((event) => {
      var _a;
      switch (event) {
        case "added":
        case "removed":
          (_a = i18next.store) == null ? void 0 : _a.on(event, invalidate);
          break;
        default:
          i18next.on(event, invalidate);
          break;
      }
    });
    app.component("i18next", TranslationComponent);
    const i18nextReady = () => i18next.isInitialized;
    app.config.globalProperties.$t = withAccessRecording(
      i18next.t.bind(i18next),
      usingI18n,
      i18nextReady
    );
    const proxiedI18next = new Proxy(i18next, {
      get(target, prop) {
        usingI18n();
        return Reflect.get(target, prop);
      }
    });
    app.config.globalProperties.$i18next = proxiedI18next;
    app.provide(INJECTION_KEY, {
      i18next: proxiedI18next,
      slotPattern: slotNamePattern(slotStart, slotEnd),
      withAccessRecording(t, translationsReady) {
        return withAccessRecording(t, usingI18n, translationsReady);
      }
    });
  }
  function withAccessRecording(t, usingI18n, translationsReady) {
    return new Proxy(t, {
      apply: function(target, thisArgument, argumentsList) {
        usingI18n();
        if (!translationsReady()) {
          return "";
        }
        return Reflect.apply(target, thisArgument, argumentsList);
      }
    });
  }
  function getContext() {
    const i18nextContext = (0, import_vue.inject)(INJECTION_KEY);
    if (!i18nextContext) {
      throw new Error(
        "i18next-vue: Make sure to register the i18next-vue plugin using app.use(...)."
      );
    }
    return i18nextContext;
  }
  function slotNamePattern(start, end) {
    const pattern = `${start}\\s*([a-z0-9\\-]+)\\s*${end}`;
    return new RegExp(pattern, "gi");
  }
  var TranslationComponent = (0, import_vue.defineComponent)({
    props: {
      translation: {
        type: String,
        required: true
      }
    },
    setup(props, { slots }) {
      const { slotPattern } = getContext();
      return () => {
        const translation = props.translation;
        const result = [];
        let match;
        let lastIndex = 0;
        while ((match = slotPattern.exec(translation)) !== null) {
          result.push(translation.substring(lastIndex, match.index));
          const slot = slots[match[1]];
          if (slot) {
            result.push(...slot());
          } else {
            result.push(match[0]);
          }
          lastIndex = slotPattern.lastIndex;
        }
        result.push(translation.substring(lastIndex));
        return result;
      };
    }
  });

  // entry-i18next-vue.js
  window.I18NextVue = install;
})();
