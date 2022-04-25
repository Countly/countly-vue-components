import Vue from 'vue';
import ELEMENT from 'element-ui';
import VTooltip from 'v-tooltip';
import vuescroll from 'vuescroll';

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

//export { default as ClyDataTable } from './datatable/cly-datatable.vue';
//
export { default as ClyDatePicker } from './date-picker/cly-date-picker.vue';
export { default as ClyTimePicker } from './date-picker/cly-time-picker.vue';
//
export { default as ClyDropdown } from './dropdown/cly-dropdown.vue';
export { default as ClyMoreOptions } from './dropdown/cly-more-options.vue';
export { default as ClyMultiSelect } from './dropdown/cly-multi-select.vue';
export { default as ClyInputDropdownTrigger } from './dropdown/cly-input-dropdown-trigger.vue';
//
export { default as ClySelectX } from './list/cly-select-x.vue';
export { default as ClyListbox } from './list/cly-listbox.vue';
export { default as ClyChecklistbox } from './list/cly-checklistbox.vue';
//
export { default as ClyTabs } from './tabs/cly-tabs.vue';