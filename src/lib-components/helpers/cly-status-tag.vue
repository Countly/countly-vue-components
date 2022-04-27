<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    mixins: [countlyVue.mixins.i18n],
    props: {
        text: { required: true, type: String },
        color: { default: "green", type: String},
        size: { default: "unset", type: String},
    },
    computed: {
        dynamicClasses: function() {
            if (this.size === "small") {
                return ["cly-vue-status-tag--small", "cly-vue-status-tag--" + this.color];
            }
            return "cly-vue-status-tag--" + this.color;
        }
    }
});
</script>
<template>
    <div class="cly-vue-status-tag" :class="dynamicClasses">
        <div class="cly-vue-status-tag__blink"></div>
        {{text}}
    </div>
</template>