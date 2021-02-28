
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */
require('./bootstrap');

window.Vue = require('vue');

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueDragDrop from 'vue-drag-drop';
import VueTour from 'vue-tour';
require('vue-tour/dist/vue-tour.css');

/**
 * Sentry
 */
import {SENTRY_DSN} from './env.js';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
if (SENTRY_DSN.length) {
    Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [new Integrations.Vue({attachProps: true, logErrors: true})]
    });
}

window.Vue.use(VueDragDrop);
window.Vue.use(ElementUI);
window.Vue.use(VueTour);

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// const files = require.context('./', true, /\.vue$/i)
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

window.Vue.component('create', require('./views/topics/create.vue').default);
window.Vue.component('cards', require('./views/topics/cards.vue').default);
window.Vue.component('review', require('./views/topics/review.vue').default);
window.Vue.component('practice', require('./views/topics/practice.vue').default);
window.Vue.component('match', require('./views/topics/match.vue').default);
window.Vue.component('last-visit', require('./views/components/LastVisit.vue').default);
window.Vue.component('vocab', require('./views/vocab/index.vue').default);

new window.Vue({
    el: '#app'
});

