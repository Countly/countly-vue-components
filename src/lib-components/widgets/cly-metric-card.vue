<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    mixins: [
        countlyVue.mixins.commonFormatters
    ],
    props: {
        label: {type: String, default: ''},
        number: {type: Number, default: 0},
        description: {type: String, default: ''},
        formatting: {type: String, default: 'auto'},
        isPercentage: {type: Boolean, default: false},
        columnWidth: {type: [Number, String], default: -1},
        isVertical: {type: Boolean, default: false},
        color: {type: [String, Function, Array], default: ''},
        numberClasses: {type: String, default: 'bu-is-flex bu-is-align-items-baseline'},
        boxType: {type: Number, default: -1},
        tooltip: {type: String, default: ''}
    },
    computed: {
        formattedNumber: function() {
            if (this.isNumberSlotUsed) {
                // Avoid extra processing, it won't be shown anyway.
                return '';
            }

            if (this.formatting === 'auto') {
                if (this.isPercentage) {
                    return this.number + " %";
                }
                else if (Math.abs(this.number) >= 10000) {
                    return this.getShortNumber(this.number);
                }
                else {
                    return this.formatNumber(this.number);
                }
            }
            else if (this.formatting === 'short') {
                return this.getShortNumber(this.number);
            }
            else if (this.formatting === 'long') {
                return this.formatNumber(this.number);
            }

            return this.number;
        },
        isDescriptionSlotUsed: function() {
            return !!this.$slots.description;
        },
        isNumberSlotUsed: function() {
            return !!this.$slots.number;
        },
        topClasses: function() {
            if (this.isVertical || this.columnWidth === -1) {
                return "";
            }

            return "bu-is-" + this.columnWidth;
        },
        metricStyles: function() {
            var classes = "";
            if (this.boxType === 3) {
                classes = "min-width: 33%";
            }
            else if (this.boxType === 4) {
                classes = "min-width: 25%";
            }
            else if (this.boxType === 5) {
                classes = "min-width: 20%";
            }
            return classes;
        }
    }
});
</script>
<template>
    <div class="cly-vue-metric-card bu-column bu-is-flex" :class="topClasses" :style="metricStyles">
        <div class="cly-vue-metric-card__wrapper bu-p-5 bu-is-flex bu-is-justify-content-space-between has-ellipsis">
            <cly-progress-donut class="bu-pr-4 bu-is-flex" v-if="isPercentage" :color="color" :percentage="number"></cly-progress-donut>
            <div class="bu-is-flex bu-is-flex-direction-column bu-is-justify-content-space-between has-ellipsis">
                <div class="bu-is-flex bu-is-align-items-center">
                    <span class="text-medium has-ellipsis" v-tooltip="label"><slot>{{label}}</slot></span>
                    <cly-tooltip-icon v-if="tooltip.length > 0" class="bu-is-flex-grow-1 bu-ml-1" :tooltip="tooltip"></cly-tooltip-icon>
                </div>
                <div :class=numberClasses>
                    <h2><slot name="number">{{formattedNumber}}</slot></h2>
                    <div class="bu-pl-2 bu-is-flex-grow-1"><slot name="description"><span class="text-medium">{{description}}</span></slot></div>
                </div>
            </div>
        </div>
    </div>
</template>