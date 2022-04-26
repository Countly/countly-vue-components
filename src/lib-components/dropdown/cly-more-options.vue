<script>
import ELEMENT from 'element-ui';
import countlyVue from '../../compat/vue-core';

export default countlyVue.components.BaseComponent.extend({
    componentName: 'ElDropdown',
    mixins: [ELEMENT.utils.Emitter],
    props: {
        size: {
            type: String,
            default: 'small'
        },
        icon: {
            type: String,
            default: 'el-icon-more'
        },
        text: {
            type: String,
            default: null
        },
        type: {
            type: String,
            default: 'default'
        },
        disabled: {
            type: Boolean,
            default: false
        },
        placement: {
            type: String,
            default: 'bottom-end'
        },
    },
    mounted: function() {
        this.$on('menu-item-click', this.handleMenuItemClick);
    },
    methods: {
        handleMenuItemClick: function(command, instance) {
            if (!this.disabled) {
                this.$emit('command', command, instance);
                this.$refs.dropdown.handleClose();
            }
        }
    },
    beforeDestroy: function() {
        this.$off();
    }
});
</script>
<template>
<cly-dropdown class="cly-vue-more-options" ref="dropdown" :placement="placement" :disabled="disabled" v-on="$listeners">
    <template v-slot:trigger>
        <slot name="trigger">
            <el-button :size="size" :icon="icon" :type="type">
            <span v-if="text">{{text}}</span>
            </el-button>
        </slot>
    </template>
    <template v-slot>
        <slot>
        </slot>
    </template>
</cly-dropdown>
</template>