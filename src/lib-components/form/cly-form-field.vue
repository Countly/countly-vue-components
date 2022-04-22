<script>
import countlyVue from '../../compat/vue-core';

export default {
    props: {
        subheading: {required: false},
        label: {required: false},
        optional: {
            type: Boolean,
            default: false
        },
        disableFormWrapping: {
            type: Boolean,
            default: false
        },
        inline: {
            type: Boolean,
            default: false,
            required: false
        },
        tooltip: {type: String, default: null}
    },
    computed: {
        wrapperElement: function() {
            if (this.disableFormWrapping) {
                return "div";
            }
            return "form";
        },
        topClasses: function() {
            if (this.inline) {
                return null;
            }
            return "cly-vue-form-step__section";
        }
    },
    mixins: [countlyVue.mixins.i18n]
};
</script>
<template>
    <div class="cly-vue-form-field" :class="topClasses">
        <div class="bu-is-flex bu-is-justify-content-space-between" v-if="!inline || tooltip || label || optional">
            <div class="text-smallish font-weight-bold bu-mb-1" v-if="label">{{label}}</div>
            <cly-tooltip-icon v-if="tooltip" class="bu-is-flex-grow-1 bu-ml-2" :tooltip="tooltip"></cly-tooltip-icon>
            <div v-show="optional" class="text-small text-heading color-cool-gray-40">{{i18n("common.optional")}}</div>
        </div>
        <div v-if="subheading" class="color-cool-gray-50 text-small bu-mb-1">
            {{subheading}}
        </div>
        <component :is="wrapperElement" @submit.prevent>
            <validation-provider v-if="$attrs.rules" v-bind="$attrs" v-on="$listeners" v-slot="validation">
                <div class="cly-vue-form-field__inner el-form-item" :class="{'is-error': validation.errors.length > 0}">
                    <slot v-bind="validation"/>
                </div>
            </validation-provider>
            <div v-else class="cly-vue-form-field__inner el-form-item">
                <slot/>
            </div>
        </component>
    </div>
</template>