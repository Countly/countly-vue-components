<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    mixins: [
        countlyVue.mixins.i18n
    ],
    props: {
        diff: {
            type: Array
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        },
        emitSaveWhenDisabled: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        hasDiff: function() {
            return this.diff.length > 0;
        },
        madeChanges: function() {
            return this.i18n("common.diff-helper.changes", this.diff.length);
        }
    },
    methods: {
        save: function() {
            if (this.disabled && !this.emitSaveWhenDisabled) {
                return;
            }
            this.$emit("save");
        },
        discard: function() {
            this.$emit("discard");
        }
    }
});
</script>
<template>
<div class="cly-vue-diff-helper" v-if="hasDiff">
    <slot name="main">
        <div class="message">
            <span class="text-dark">{{madeChanges}}</span>
            <span class="text-dark">{{ i18n("common.diff-helper.keep") }}</span>
        </div>
        <div class="buttons">
            <el-button skin="light" class="discard-btn" @click="discard" type="secondary">{{i18n('common.discard-changes')}}</el-button>
            <el-button skin="green" class="save-btn" :disabled="disabled" @click="save" type="success">{{i18n('common.save-changes')}}</el-button>
        </div>
    </slot>
</div>
</template>