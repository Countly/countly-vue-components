<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    mixins: [countlyVue.mixins.i18n],
    props: {
        id: {default: "", type: [String, Number], required: false},
        text: { default: "" },
        color: { default: "light-warning", type: String},
        size: {default: "full", type: String},
        visible: {default: true, type: Boolean},
        closable: {default: true, type: Boolean},
        autoHide: {default: false, type: Boolean},
    },
    data: function() {
        return {
            autoHideTimeout: null,
            DEFAULT_STAY_TIME_IN_MS: 7000, // 7 seconds
            isModalVisible: true,
        };
    },
    watch: {
        visible: {
            immediate: true,
            handler: function(newVisible) {
                this.isModalVisible = newVisible;
            }
        },
        isModalVisible: function(newVisible) {
            this.$emit("update:visible", newVisible);
        }
    },
    computed: {
        dynamicClasses: function() {
            return ["cly-vue-notification__alert-box__alert-text--" + this.color, "cly-vue-notification__alert-box--" + this.size];
        },
        image: function() {
            if (this.color === "dark-informational" || this.color === "light-informational") {
                return "images/icons/notification-toast-informational.svg";
            }
            else if (this.color === "light-successful" || this.color === "dark-successful") {
                return "images/icons/notification-toast-successful.svg";
            }
            else if (this.color === "light-destructive" || this.color === "dark-destructive") {
                return "images/icons/notification-toast-destructive.svg";
            }
            else if (this.color === "light-warning" || this.color === "dark-warning") {
                return "images/icons/notification-toast-warning.svg";
            }
        },
        innerText: function() {
            if (this.text) {
                return this.text;
            }
            return "";
        }
    },
    methods: {
        closeModal: function() {
            this.isModalVisible = false;
            this.$emit('close', this.id);
        },
    },
    mounted: function() {
        if (this.autoHide) {
            this.autoHideTimeout = setTimeout(this.closeModal, this.DEFAULT_STAY_TIME_IN_MS);
        }
    },
    beforeDestroy: function() {
        if (this.autoHide && this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
            this.autoHideTimeout = null;
        }
    }
});
</script>
<template>
    <div v-if="isModalVisible===true" :class="dynamicClasses" class="cly-vue-notification__alert-box">
        <div class="bu-is-flex bu-is-justify-content-space-between">
            <div class="bu-is-flex">
                <img :src="image" class="alert-image bu-mr-4 bu-my-2 bu-ml-2">
                <slot><span class="alert-text" style="margin-block:auto" v-html="innerText">{{text}}</span></slot>
            </div>
            <div v-if="closable"  class="bu-mt-2">
                <div v-if="size=='full'" @click="closeModal" class="bu-mr-2 bu-ml-2" >
                    <slot name="close"><i class="el-icon-close"></i></slot>
                </div>
                <div v-else @click="closeModal" class="bu-mr-2 bu-ml-6">
                    <slot name="close"><i class="el-icon-close"></i></slot>
                </div>
            </div>
            <div v-else class="bu-ml-5">
            </div>
        </div>
    </div>
</template>