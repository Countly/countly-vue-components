<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    template: '',
    mixins: [
        countlyVue.mixins.i18n
    ],
    props: {
        title: { default: countlyVue.i18n('common.emtpy-view-title'), type: String },
        subTitle: { default: countlyVue.i18n('common.emtpy-view-subtitle'), type: String },
        actionTitle: { default: "Create", type: String },
        actionFunc: { default: null, type: Function },
        hasAction: {default: false, type: Boolean},
        hasCreateRight: { default: true, type: Boolean }
    }
});
</script>
<template>
    <div class="bu-mt-5 bu-pt-4 bu-is-flex bu-is-flex-direction-column bu-is-align-items-center cly-vue-empty-view">
        <slot name="icon">
            <div class="bu-mt-6">
                <img class="cly-vue-empty-view__img" src="images/icons/empty-plugin.svg"/>
            </div>
        </slot>
        <div class="bu-mt-2 bu-is-flex bu-is-flex-direction-column 	bu-is-align-items-center">
            <slot name="title">
                <h3 class="color-cool-gray-100 bu-mt-4">{{title}}</h3>
            </slot>
            <slot name="subTitle">
                <div class="bu-mt-4 bu-mb-5 text-medium color-cool-gray-50 bu-has-text-centered cly-vue-empty-view__subtitle"><span v-html="subTitle"></span></div>
            </slot>
            <slot name="action" v-if="hasCreateRight && hasAction">
                <div @click="actionFunc" class="bu-is-clickable button bu-has-text-centered color-blue-100 pointer">{{actionTitle}}</div>
            </slot>
        </div>
    </div>
</template>