<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    name: "ClyMessageDialog",
    props: {
        title: {type: String, required: true},
        confirmButtonLabel: {type: String, required: false, default: countlyVue.i18n("common.confirm")},
        dialogType: {type: String, required: false, default: "secondary"}
    },
    computed: {
        forwardedSlots: function() {
            var self = this;
            return Object.keys(this.$scopedSlots).reduce(function(slots, slotKey) {
                slots[slotKey] = self.$scopedSlots[slotKey];
                return slots;
            }, {});
        },
        buttonStyle: function() {
            if (this.dialogType === "success" || this.dialogType === "secondary") {
                return this.dialogType;
            }
            return "success";
        }
    },
    methods: {
        confirmClicked: function() {
            this.$emit("confirm");
        }
    }
});
</script>
<template>
    <el-dialog destroyOnClose class="cly-vue-message-dialog" v-on="$listeners" v-bind="$attrs" :title="title">
        <template v-slot:title>
            <h3 class="color-cool-gray-100">{{title}}</h3>
        </template>
        <template v-for="(_, name) in forwardedSlots" v-slot:[name]>
            <slot :name="name"/>
        </template>
        <template v-slot:footer>
            <div class="cly-vue-formdialog__buttons is-single-step bu-is-justify-content-flex-end bu-is-flex">
                <el-button size="small" @click="confirmClicked" :type="buttonStyle">{{confirmButtonLabel}}</el-button>
            </div>
        </template>
    </el-dialog>
</template>