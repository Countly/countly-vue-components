<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    props: {
        icon: {
            type: String,
            default: 'ion ion-help-circled'
        },
        tooltip: {
            type: String,
            default: ''
        },
        placement: {
            type: String,
            default: 'auto'
        }
    },
    computed: {
        tooltipConf: function() {
            return {
                content: this.tooltip,
                placement: this.placement
            };
        }
    }
});
</script>
<template>
    <i v-if="tooltip" :class="'cly-vue-tooltip-icon' + icon" v-tooltip="tooltipConf"></i>
</template>
