<script>
import countlyVue from '../../compat/vue-core';

var popoverSizes = {
    "small": true,
    "medium": true,
    "auto": true,
    "small-chart": true,
    "medium-chart": true,
    "auto-chart": true
};

export default countlyVue.components.BaseComponent.extend({
    props: {
        size: {
            type: String,
            default: 'medium',
            validator: function(val) {
                return val in popoverSizes;
            }
        }
    },
    computed: {
        contentClasses: function() {
            return "cly-vue-popover__content cly-vue-popover__content--" + this.size;
        }
    }
});
</script>
<template>
    <v-popover :popoverInnerClass="contentClasses" class="cly-vue-popover"
        v-bind="$attrs"
        v-on="$listeners">
        <slot></slot>
        <template v-slot:popover><slot name='content'></slot></template>
    </v-popover>
</template>