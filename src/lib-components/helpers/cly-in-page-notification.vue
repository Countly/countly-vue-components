<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    props: {
        text: {type: String, required: false}
    },
    computed: {
        innerText: function() {
            if (this.text) {
                return this.text;
            }
            return "";
        }
    }
});
</script>
<template>
    <div class="cly-in-page-notification color-cool-gray-100 bg-red-10 text-medium bu-p-2 center">
        <slot><span v-html="innerText"></span></slot>
    </div>
</template>