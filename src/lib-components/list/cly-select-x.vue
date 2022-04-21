<script>
import countlyVue from '../../compat/vue-core';
import {SearchableOptionsMixin, TabbedOptionsMixin} from './commons';

export default {
    name: 'ClySelectX',
    mixins: [TabbedOptionsMixin, SearchableOptionsMixin, countlyVue.mixins.i18n],
    props: {
        title: {type: String, default: ''},
        placeholder: {type: String, default: 'Select'},
        noMatchFoundPlaceholder: {default: countlyVue.i18n('common.search.no-match-found'), required: false },
        value: { type: [String, Number, Array] },
        mode: {type: String, default: 'single-list'}, // multi-check,
        autoCommit: {type: Boolean, default: true},
        disabled: { type: Boolean, default: false},
        width: { type: [Number, Object], default: 400},
        size: {type: String, default: ''},
        adaptiveLength: {type: Boolean, default: false},
        minInputWidth: {
            type: Number,
            default: -1,
            required: false
        },
        maxInputWidth: {
            type: Number,
            default: -1,
            required: false
        },
        showSelectedCount: {type: Boolean, default: false},
        arrow: {type: Boolean, default: true},
        singleOptionSettings: {
            type: Object,
            default: function() {
                return {
                    hideList: false,
                    autoPick: false
                };
            },
            required: false
        },
        popClass: {
            type: String,
            required: false
        },
        minItems: {
            type: Number,
            default: 0,
            required: false
        },
        maxItems: {
            type: Number,
            default: Number.MAX_SAFE_INTEGER,
            required: false
        },
        hasRemovableOptions: {
            type: Boolean,
            default: false,
            required: false
        },
        //
        collapseTags: {
            type: Boolean,
            default: true,
            required: false
        },
        //
        remote: {type: Boolean, default: false},
        remoteMethod: {type: Function, required: false}
    },
    data: function() {
        return {
            uncommittedValue: null
        };
    },
    computed: {
        isMultiple: function() {
            return (this.mode + "").startsWith("multi");
        },
        popClasses: function() {
            return {
                "cly-vue-select-x__pop--hidden-tabs": this.hideDefaultTabs || !this.showTabs,
                "cly-vue-select-x__pop--has-single-option": this.hasSingleOption,
                "cly-vue-select-x__pop--has-slim-header": !this.searchable && !this.showTabs
            };
        },
        currentTab: function() {
            var self = this;
            var filtered = this.publicTabs.filter(function(tab) {
                return self.activeTabId === tab.name;
            });
            if (filtered.length > 0) {
                return filtered[0];
            }
            return {};
        },
        hasSingleOption: function() {
            return (this.activeTabId !== '__root' &&
                        this.currentTab.options &&
                        this.currentTab.options.length === 1 &&
                        this.singleOptionSettings.hideList);
        },
        showList: function() {
            return !this.hasSingleOption;
        },
        innerValue: {
            get: function() {
                if (this.uncommittedValue && this.uncommittedValue !== this.value) {
                    return this.uncommittedValue;
                }
                return this.value;
            },
            set: function(newVal) {
                if (this.autoCommit && this.isItemCountValid) {
                    this.commitValue(newVal);
                }
                else {
                    this.uncommittedValue = newVal;
                }
            }
        },
        selectedCountText: function() {
            if (this.uncommittedValue) {
                return countlyVue.i18n('export.export-columns-selected-count', this.uncommittedValue.length, (this.options ? this.options.length : 0));
            }
            else {
                return countlyVue.i18n('export.export-columns-selected-count', (this.value ? this.value.length : 0), (this.options ? this.options.length : 0));
            }
        },
        isItemCountValid: function() {
            if (this.mode === "single-list" || this.autoCommit) {
                return true;
            }
            return Array.isArray(this.innerValue) && this.innerValue.length >= this.minItems && this.innerValue.length <= this.maxItems;
        }
    },
    mounted: function() {
        this.determineActiveTabId();
    },
    methods: {
        handleValueChange: function() {
            if (this.mode === 'single-list' && this.autoCommit) {
                this.doClose();
            }
        },
        doClose: function() {
            this.determineActiveTabId();
            this.$refs.dropdown.handleClose();
        },
        updateDropdown: function() {
            this.$refs.dropdown.updateDropdown();
        },
        handleDropdownShow: function() {
            this.$forceUpdate();
            this.focusOnSearch();
        },
        focusOnSearch: function() {
            var self = this;
            this.$nextTick(function() {
                if (self.$refs.searchBox) {
                    self.$refs.searchBox.focus();
                }
            });
        },
        focusOnTrigger: function() {
            var self = this;
            if (this.$refs.trigger && this.$refs.trigger.focus()) {
                this.$nextTick(function() {
                    self.$refs.trigger.focus();
                });
            }
        },
        doCommit: function() {
            if (!this.isItemCountValid) {
                return;
            }
            if (this.uncommittedValue) {
                this.commitValue(this.uncommittedValue);
                this.uncommittedValue = null;
            }
            this.doClose();
        },
        doDiscard: function() {
            this.uncommittedValue = null;
            this.doClose();
        },
        commitValue: function(val) {
            this.$emit("input", val);
            this.$emit("change", val);
        },
        removeOption: function(options) {
            this.$emit("remove-option", options);
        }
    },
    watch: {
        searchQuery: function() {
            this.updateDropdown();
        },
        activeTabId: function() {
            this.updateDropdown();
            if (this.hasSingleOption && this.singleOptionSettings.autoPick) {
                this.innerValue = this.currentTab.options[0].value;
                this.doCommit();
            }
        },
        value: function(newVal) {
            if (!this.onlySelectedOptionsTab && this.isMultiple && this.remote && newVal && newVal.length === 0 && this.activeTabId === "__selected") {
                this.navigateToFirstRegularTab();
            }
            this.uncommittedValue = null;
        }
    }
};
</script>
<template>
    <cly-dropdown
        class="cly-vue-select-x"
        ref="dropdown"
        :width="width"
        :placeholder="placeholder"
        :disabled="disabled"
        :pop-class="popClass"
        v-bind="$attrs"
        v-on="$listeners"
        @show="handleDropdownShow"
        @hide="focusOnTrigger">
        <template v-slot:trigger="dropdown">
            <slot name="trigger" v-bind:dropdown="dropdown">
                <el-select-head
                    v-if="isMultiple"
                    multiple
                    ref="trigger"
                    class="el-select-head"
                    :disabled="disabled"
                    :opened="dropdown.visible"
                    :placeholder="placeholder"
                    :arrow="arrow"
                    :value="value"
                    :collapse-tags="collapseTags"
                    @change="commitValue"
                    :options-lookup="selectedOptions">
                </el-select-head>
                <cly-input-dropdown-trigger
                    v-else
                    ref="trigger"
                    :size="size"
                    :disabled="disabled"
                    :adaptive-length="adaptiveLength"
                    :min-width="minInputWidth"
                    :max-width="maxInputWidth"
                    :focused="dropdown.focused"
                    :opened="dropdown.visible"
                    :placeholder="placeholder"
                    :arrow="arrow"
                    :selected-options="selectedOptions">
                </cly-input-dropdown-trigger>
            </slot>
        </template>
        <div class="cly-vue-select-x__pop" :class="popClasses">
            <div class="cly-vue-select-x__header">
                <div class="bu-level">
                    <div class="cly-vue-select-x__title" v-if="title">{{title}}</div>
                    <div class='bu-level-right text-small color-cool-gray-50' v-if="showSelectedCount">{{selectedCountText}}</div>
                </div>
                <div class="cly-vue-select-x__header-slot" v-if="!!$scopedSlots.header">
                    <slot name="header" :active-tab-id="activeTabId" :tabs="publicTabs" :update-tab="updateTabFn"></slot>
                </div>
                <div class="bu-level">
                    <div class="bu-level-item" v-if="searchable">
                        <el-input
                            v-show="showList"
                            ref="searchBox"
                            autocomplete="off"
                            :disabled="disabled"
                            v-model="searchQuery"
                            @keydown.native.esc.stop.prevent="doClose"
                            :placeholder="searchPlaceholder">
                            <i slot="prefix" class="el-input__icon el-icon-search"></i>
                        </el-input>
                    </div>
                    <slot name="action"></slot>
                </div>
            </div>
            <el-tabs
                v-loading="isQueryPending"
                v-model="activeTabId"
                @keydown.native.esc.stop.prevent="doClose">
                <el-tab-pane :name="tab.name" :key="tab.name" v-for="tab in publicTabs">
                    <span slot="label">
                        {{tab.label}}
                    </span>
                    <cly-listbox
                        :noMatchFoundPlaceholder="noMatchFoundPlaceholder"
                        v-show="showList"
                        v-if="mode === 'single-list'"
                        :bordered="false"
                        :options="getMatching(tab.options)"
                        @change="handleValueChange"
                        :hasRemovableOptions="hasRemovableOptions"
                        @remove-option="removeOption"
                        v-model="innerValue">
                        <template v-slot:option-prefix="scope">
                            <slot name="option-prefix" v-bind="scope"></slot>
                        </template>
                        <template v-slot:option-suffix="scope">
                            <slot name="option-suffix" v-bind="scope"></slot>
                        </template>
                    </cly-listbox>
                    <cly-checklistbox
                        :noMatchFoundPlaceholder="noMatchFoundPlaceholder"
                        v-show="showList"
                        v-else-if="mode === 'multi-check'"
                        :bordered="false"
                        :options="getMatching(tab.options)"
                        @change="handleValueChange"
                        v-model="innerValue">
                    </cly-checklistbox>
                    <cly-checklistbox
                        :noMatchFoundPlaceholder="noMatchFoundPlaceholder"
                        v-show="showList"
                        v-else-if="mode === 'multi-check-sortable'"
                        :sortable="true"
                        :bordered="false"
                        :options="getMatching(tab.options)"
                        @change="handleValueChange"
                        v-model="innerValue">
                    </cly-checklistbox>
                </el-tab-pane>
            </el-tabs>
            <div class="cly-vue-select-x__footer" v-if="!autoCommit">
                <div class="cly-vue-select-x__commit-section">
                    <el-button @click="doDiscard" type="secondary" size="small">{{ i18n("common.cancel") }}</el-button>
                    <el-button @click="doCommit" :disabled="disabled || !isItemCountValid" type="success" size="small">{{ i18n("common.confirm") }}</el-button>
                </div>
            </div>
        </div>
    </cly-dropdown>
</template>
<style lang="scss">
    @use "../../styles/base/colors" as c;
    @use "../../styles/base/typography-variables" as t;
    @use "../../styles/base/variables" as v;
    @use "sass:map";

    .cly-vue-select-x {
        &__pop {
            .cly-vue-listbox {
                background-color: transparent !important;
            }
            .el-tabs {
                &__active-bar{
                    background-color: #0166d6;
                }
                &__nav-wrap::after {
                    background-color: transparent;
                }
                &__nav-scroll {
                    // padding: 0 14px;
                    margin: 0 14px;
                }
                &__header {
                    margin: 0 0 1px 0;
                    z-index: 2000;
                    &::after {
                        // shadow
                        content: "";
                        position: absolute;
                        width: 100%;
                        height: 12px;
                        background: linear-gradient(180deg, #333c48 0%, rgba(51, 60, 72, 0.0001) 100%);
                        top: 40px;
                        opacity: 0.12;
                    }
                }
                // &__active-bar {
                //     padding: 0 15px;
                //     left: -15px;
                // }
            }
            &--hidden-tabs {
                .el-tabs {
                    &__header {
                        &::after {
                            top: 0px;
                        }
                    }
                    &__nav-scroll {
                        display: none;
                    }
                }
            }
            // .cly-vue-listbox {
            //     padding: v.$select-dropdown-item-default-padding;
            // }
        }
        &__title {
            font-weight: 500;
            font-size: 16px;
            line-height: 24px;
            color: #333c48;
            padding-bottom: 16px;
        }
        &__header-slot {
            padding-bottom: 16px;
        }
        &__header {
            padding: 16px;
            input[type=text] {
                background-color: #F6F6F6;
            }
        }
        &__footer {
            border-top: 1px solid #ececec;
        }
        &__commit-section {
            float: right;
            margin: 16px;
        }

        &__pop--has-single-option, &__pop--has-slim-header {
            .cly-vue-select-x__header-slot {
                padding: 0;
            }
        }

        &__pop--has-single-option {
            .el-tabs__header::after {
                content: none;
            }
        }

        .el-select-head {
            width: 100%;
        }
    }
</style>