<script>
import {AbstractListBox} from './commons';

export default AbstractListBox.extend({
    name: 'ClyChecklistbox',
    props: {
        value: {
            type: Array,
            default: function() {
                return [];
            }
        },
        sortable: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            sortMap: null
        };
    },
    watch: {
        options: {
            immediate: true,
            handler: function(options) {
                if (this.sortable && !this.sortMap) {
                    this.sortMap = Object.freeze(options.reduce(function(acc, opt, idx) {
                        acc[opt.value] = idx;
                        return acc;
                    }, {}));
                }
            }
        }
    },
    methods: {
        computeSortedOptions: function() {
            if (!this.sortable || !this.sortMap) {
                return this.options;
            }
            var sortMap = this.sortMap,
                wrapped = this.options.map(function(opt, idx) {
                    return { opt: opt, idx: idx, ord: sortMap[opt.value] || 0 };
                });

            wrapped.sort(function(a, b) {
                return (a.ord - b.ord) || (a.idx - b.idx);
            });

            return wrapped.map(function(item) {
                return item.opt;
            });
        },
        commitValue: function(val) {
            this.$emit("input", val);
            this.$emit("change", val);
        }
    },
    computed: {
        innerValue: {
            get: function() {
                return this.value;
            },
            set: function(newVal) {
                if (this.disabled) {
                    return;
                }
                if (this.sortable && this.sortMap) {
                    var sortMap = this.sortMap,
                        wrapped = newVal.map(function(value, idx) {
                            return { value: value, idx: idx, ord: sortMap[value] || 0 };
                        });

                    wrapped.sort(function(a, b) {
                        return (a.ord - b.ord) || (a.idx - b.idx);
                    });

                    var sorted = wrapped.map(function(item) {
                        return item.value;
                    });
                    this.commitValue(sorted);
                }
                else {
                    this.commitValue(newVal);
                }
            }
        },
        sortedOptions: {
            get: function() {
                return this.computeSortedOptions();
            },
            set: function(sorted) {
                if (!this.sortable) {
                    return;
                }
                this.sortMap = Object.freeze(sorted.reduce(function(acc, opt, idx) {
                    acc[opt.value] = idx;
                    return acc;
                }, {}));
                this.innerValue = this.value; // triggers innerValue.set
                this.$emit('update:options', this.computeSortedOptions());
            }
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
        <vue-scroll
            :style="vueScrollStyle"
            v-if="options.length > 0"
            :ops="scrollCfg">
            <div :style="wrapperStyle" class="cly-vue-listbox__items-wrapper">
                <el-checkbox-group
                    v-model="innerValue">
                    <draggable
                        handle=".drag-handler"
                        v-model="sortedOptions"
                        :disabled="!sortable">
                    <div
                        class="text-medium cly-vue-listbox__item"
                        :key="option.value"
                        v-for="option in sortedOptions">
                        <div v-if="sortable" class="drag-handler"><img src="images/drill/drag-icon.svg" /></div>
                        <el-checkbox :label="option.value" v-tooltip="option.label" :key="option.value">{{option.label}}</el-checkbox>
                    </div>
                    </draggable>
                </el-checkbox-group>
            </div>
        </vue-scroll>
        <div v-else class="cly-vue-listbox__no-data">
            {{noMatchFoundPlaceholder}}
        </div>
    </div>
</template>