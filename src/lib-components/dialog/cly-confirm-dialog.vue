<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    name: "ClyConfirmDialog",
    props: {
        title: {type: String, required: true},
        saveButtonLabel: {type: String, required: false, default: countlyVue.i18n("common.save")},
        cancelButtonLabel: {type: String, required: false, default: countlyVue.i18n("common.cancel")},
        dialogType: {type: String, required: false, default: "success"}
    },
    computed: {
        forwardedSlots: function() {
            var self = this;
            return Object.keys(this.$scopedSlots).reduce(function(slots, slotKey) {
                slots[slotKey] = self.$scopedSlots[slotKey];
                return slots;
            }, {});
        },
        saveLabel: function() {
            return this.$attrs.saveButtonLabel || this.saveButtonLabel;
        },
        cancelLabel: function() {
            return this.$attrs.cancelButtonLabel || this.cancelButtonLabel;
        },
        confirmStyle: function() {
            if (this.dialogType === "success" || this.dialogType === "danger") {
                return this.dialogType;
            }
            return "success";
        }
    },
    methods: {
        confirmClicked: function() {
            this.$emit("confirm");
        },
        cancelClicked: function() {
            this.$emit("cancel");
        }
    }
});
</script>
<template>
    <el-dialog destroyOnClose class="cly-vue-confirm-dialog" v-on="$listeners" v-bind="$attrs" :title="title">
        <template v-slot:title><h3 class="color-cool-gray-100">{{title}}</h3></template>
        <template v-for="(_, name) in forwardedSlots" v-slot:[name]>
            <slot :name="name"/>
        </template>
        <template v-slot:footer><div class="cly-vue-formdialog__buttons is-single-step bu-is-justify-content-flex-end bu-is-flex">
            <el-button size="small" @click="cancelClicked"  type="secondary" >{{cancelLabel}}</el-button>
            <el-button size="small" @click="confirmClicked" type="success" v-if="confirmStyle=='success'">{{saveLabel}}</el-button>
            <el-button size="small" @click="confirmClicked" type="danger" v-else >{{saveLabel}}</el-button>
        </div></template>
    </el-dialog>
</template>