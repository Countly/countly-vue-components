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

export { default as ClyDatatable } from './datatable/cly-datatable.vue';
export { default as ClyDatatableUndoRow } from './datatable/cly-datatable-undo-row.vue';
//
export { default as ClyDatePicker } from './date-picker/cly-date-picker.vue';
export { default as ClyTimePicker } from './date-picker/cly-time-picker.vue';
//
export { default as ClyConfirmDialog } from './dialog/cly-confirm-dialog.vue';
export { default as ClyDialog } from './dialog/cly-dialog.vue';
export { default as ClyFormDialog } from './dialog/cly-form-dialog.vue';
export { default as ClyMessageDialog } from './dialog/cly-message-dialog.vue';
export { default as useGlobalDialogsStore } from './dialog/store';
export { default as ClyDialogCommons } from './dialog/commons';
//
export { default as ClyDrawer } from './drawer/cly-drawer.vue';
export { default as ClyDrawerCommons } from './drawer/commons';
//
export { default as ClyDropdown } from './dropdown/cly-dropdown.vue';
export { default as ClyMoreOptions } from './dropdown/cly-more-options.vue';
export { default as ClyMultiSelect } from './dropdown/cly-multi-select.vue';
export { default as ClyInputDropdownTrigger } from './dropdown/cly-input-dropdown-trigger.vue';
//
export { default as ClyFormFieldGroup } from './form/cly-form-field-group.vue';
export { default as ClyFormField } from './form/cly-form-field.vue';
export { default as ClyFormStep } from './form/cly-form-step.vue';
export { default as ClyForm } from './form/cly-form.vue';
export { default as ClyInlineFormField } from './form/cly-inline-form-field.vue';
//
export { default as ClyDiffHelper } from './helpers/cly-diff-helper';
export { default as ClyBlank } from './helpers/cly-blank';
export { default as ClyEmptyChart } from './helpers/cly-blank';
export { default as ClyEmptyDatatable } from './helpers/cly-blank';
export { default as ClyBackLink } from './helpers/cly-back-link';
export { default as ClyBreadcrumbs} from './helpers/cly-breadcrumbs';
export { default as ClyColorTag} from './helpers/cly-color-tag';
export { default as ClyEmptyView} from './helpers/cly-empty-view';
export { default as ClyInPageNotification} from './helpers/cly-in-page-notification';
export { default as ClyNotification} from './helpers/cly-notification';
export { default as ClyPaginate} from './helpers/cly-paginate';
export { default as ClyPopover} from './helpers/cly-popover';
export { default as ClyProgressBar} from './helpers/cly-progress-bar';
export { default as ClyProgressDonut} from './helpers/cly-progress-donut';
export { default as ClyRemove} from './helpers/cly-remover';
export { default as ClyStatusTag} from './helpers/cly-status-tag';
export { default as ClyTooltipIcon} from './helpers/cly-tooltip-icon';
//
export { default as ClySelectX } from './list/cly-select-x.vue';
export { default as ClyListbox } from './list/cly-listbox.vue';
export { default as ClyChecklistbox } from './list/cly-checklistbox.vue';
//
export { default as ClyTabs } from './tabs/cly-tabs.vue';
//
export { default as ClyMetricBreakdown} from './widgets/cly-metric-breakdown';
export { default as ClyMetricCard} from './widgets/cly-metric-card';
export { default as ClyMetricCards} from './widgets/cly-metric-cards';