import { messages } from './locales.js';
import Home from './pages/Home.js';
import Sponsor from './pages/Sponsor.js';
import LangTranslate from './pages/LangTranslate.js';
import BytecodeTranslate from './pages/BytecodeTranslate.js';
import Stats from './pages/Stats.js';
import NotFound from './pages/NotFound.js';

const { createApp } = window.Vue;
const { createRouter, createWebHashHistory } = window.VueRouter;
const i18next = window.i18next;
const I18NextVue = window.I18NextVue;

if (!window.Vue || !window.VueRouter || !window.i18next || !window.I18NextVue) {
    console.error("Failed to load dependencies.");
    // Check which one failed
    if (!window.Vue) console.error("Vue failed to load");
    if (!window.VueRouter) console.error("VueRouter failed to load");
    if (!window.i18next) console.error("i18next failed to load");
    if (!window.I18NextVue) console.error("I18NextVue failed to load");
    
    alert("Error: Could not load required libraries. Please check console for details.");
}

// Router
const routes = [
    { path: '/', component: Home },
    { path: '/sponsor', component: Sponsor },
    { path: '/lang-translate', component: LangTranslate },
    { path: '/bytecode-translate', component: BytecodeTranslate },
    { path: '/stats', component: Stats },
    { path: '/:pathMatch(.*)*', component: NotFound },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

// i18n
const i18n = i18next.createInstance();
i18n.init({
    lng: navigator.language.split('-')[0] || 'en', // Default to browser lang
    fallbackLng: 'en',
    resources: {
        en: { translation: messages.en },
        zh: { translation: messages.zh },
        de: { translation: messages.de },
        es: { translation: messages.es },
        ru: { translation: messages.ru },
        pt: { translation: messages.pt },
    }
});

// App
const app = createApp({
    data() {
        return {
            currentLang: i18n.language
        }
    },
    methods: {
        changeLang() {
            i18n.changeLanguage(this.currentLang);
            this.$forceUpdate(); // Force re-render to update translations
        }
    }
});

app.use(router);
app.use(I18NextVue, { i18next: i18n }); // Use the plugin
app.mount('#app');
