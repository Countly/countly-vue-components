/* eslint-disable import/prefer-default-export */
import Vue from 'vue'
import ELEMENT from 'element-ui';
import VTooltip from 'v-tooltip';
import vuescroll from 'vuescroll';
import 'element-ui/lib/theme-chalk/index.css';
import '../styles/fonts.scss';
import '../styles/clyvue.scss';
import '../styles/manifest.scss';

Vue.use(VTooltip);
VTooltip.options.defaultClass = 'cly-vue-tooltip';
VTooltip.options.defaultBoundariesElement = 'body';
VTooltip.options.popover.defaultTrigger = 'hover';
VTooltip.options.popover.defaultOffset = 14;
VTooltip.options.popover.defaultBoundariesElement = 'window';
VTooltip.options.popover.defaultClass = 'cly-vue-popover';
VTooltip.options.popover.defaultInnerClass = 'cly-vue-popover__content';

Vue.use(ELEMENT);
Vue.directive("click-outside", ELEMENT.utils.Clickoutside);

Vue.use(vuescroll);

export { default as ClyDatePicker } from './date-picker/cly-date-picker.vue';
export { default as ClyDropdown } from './dropdown/cly-dropdown.vue';
export { default as ClyInputDropdownTrigger } from './dropdown/cly-input-dropdown-trigger.vue';