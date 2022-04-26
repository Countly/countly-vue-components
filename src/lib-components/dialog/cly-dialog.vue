<script>
import Vue from 'vue';
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    name: "ClyDialog",
    props: {
        title: {
            type: String,
            required: false,
            default: ''
        },
        autoCentered: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    computed: {
        forwardedSlots: function() {
            var self = this;
            return Object.keys(this.$scopedSlots).reduce(function(slots, slotKey) {
                slots[slotKey] = self.$scopedSlots[slotKey];
                return slots;
            }, {});
        },
        topClasses: function() {
            if (this.autoCentered) {
                return "is-auto-centered";
            }
            return "";
        }
    }
});
</script>
<template>
    <el-dialog :destroy-on-close="true" class="cly-vue-dialog" :class="topClasses" v-on="$listeners" v-bind="$attrs" :title="title" :append-to-body="true">
        <template v-slot:title><h3 class="color-cool-gray-100">{{title}}</h3></template>
        <template v-for="(_, name) in forwardedSlots" v-slot:[name]>
            <slot :name="name"/>
        </template>
    </el-dialog>
</template>