<script>
import countlyVue from '../../compat/vue-core'; 
export default countlyVue.mixins.BaseContent.extend({
    props: {
        image: {default: 'images/icons/empty-view-icon.svg', type: String},
        title: { default: countlyVue.i18n('common.emtpy-view-title'), type: String },
        subTitle: { default: countlyVue.i18n('common.emtpy-view-subtitle'), type: String },
        height: {default: 0, type: Number},
        classes: {
            type: Object,
            default: function() {
                return {
                    'bu-py-6': true
                };
            }
        }
    },
    data: function() {
        return {};
    },
    computed: {
        topStyle: function() {
            if (this.height) {
                return {height: this.height + "px"};
            }
        }
    },
});
</script>
<template>
    <div :style="topStyle" 
        :class="['bu-is-flex bu-is-flex-direction-column bu-is-align-items-center bu-is-justify-content-center', classes]" 
        style="height: 100%;opacity: 0.6">
        <slot name="icon">
            <div>
                <img :src="image"/>
            </div>
        </slot>
        <div class="bu-mt-2">
            <slot name="title">
                <h4 class="color-cool-gray-100 bu-has-text-centered">{{title}}</h4>
            </slot>
            <slot name="subTitle">
                <div class="bu-mt-1 text-small color-cool-gray-50 bu-has-text-centered">{{subTitle}}</div>
            </slot>
        </div>
    </div>
</template>