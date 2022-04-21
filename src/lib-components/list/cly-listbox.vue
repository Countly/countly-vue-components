<script>
import {AbstractListBox, SearchableOptionsMixin} from './commons';

export default AbstractListBox.extend({
    name: 'ClyListbox',
    mixins: [SearchableOptionsMixin],
    props: {
        searchable: {type: Boolean, default: false, required: false}, //override the mixin
        value: { type: [String, Number] }
    },
    computed: {
        searchedOptions: function() {
            return this.getMatching(this.options);
        }
    }
});
</script>
<template>
    <div
        style="height: 100%"
        class="cly-vue-listbox"
        tabindex="0"
        :class="topClasses"
        @mouseenter="handleHover"
        @mouseleave="handleBlur"
        @focus="handleHover"
        @blur="handleBlur">
        <div class="cly-vue-listbox__header bu-p-3" v-if="searchable">
            <form>
                <el-input
                    :disabled="disabled"
                    autocomplete="off"
                    v-model="searchQuery"
                    :placeholder="searchPlaceholder">
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
            </form>
        </div>
        <vue-scroll
            :style="vueScrollStyle"
            v-if="searchedOptions.length > 0"
            :ops="scrollCfg">
            <div :style="wrapperStyle" class="cly-vue-listbox__items-wrapper">
                <div
                    tabindex="0"
                    class="text-medium font-weight-bold"
                    :class="{'selected': value === option.value, 'hover': hovered === option.value, 'cly-vue-listbox__item': !option.group, 'cly-vue-listbox__group text-uppercase': option.group}"
                    :key="'i' + idx + '.' + option.value"
                    @focus="!option.group && handleItemHover(option)"
                    @mouseenter="!option.group && handleItemHover(option)"
                    @keyup.enter="!option.group && handleItemClick(option)"
                    @click.stop="!option.group && handleItemClick(option)"
                    v-for="(option, idx) in searchedOptions">
                    <div class="cly-vue-listbox__item-content">
                        <div class="bu-level">
                            <div class="bu-level-left">
                                <div v-if="!!$scopedSlots['option-prefix']" class="cly-vue-listbox__item-prefix bu-mr-1">
                                    <slot name="option-prefix" v-bind="option"></slot>
                                </div>
                                <slot name="option-label" v-bind="option">
                                    <div class="cly-vue-listbox__item-label" v-tooltip="option.label">{{option.label}}</div>
                                </slot>
                            </div>
                            <div class="bu-level-right" v-if="hasRemovableOptions || !!$scopedSlots['option-suffix']">
                                <slot class="cly-vue-listbox__item-suffix" name="option-suffix" v-bind="option"></slot>
                                <div class="cly-vue-listbox__remove-option" v-if="hasRemovableOptions" @click.stop="onRemoveOption(option)"><i class="el-icon-close"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </vue-scroll>
        <div v-else class="cly-vue-listbox__no-data">
            {{noMatchFoundPlaceholder}}
        </div>
    </div>
</template>