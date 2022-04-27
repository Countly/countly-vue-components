<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        remove: function() {
            if (!this.disabled) {
                this.$emit("remove");
            }
        }
    }
});
</script>
<template>
    <div class="cly-vue-remover"
        v-if="!disabled"
        @click="remove">
        <slot>
            <i class="el-icon-delete"></i>
        </slot>
    </div>
</template>