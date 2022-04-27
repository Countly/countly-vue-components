<script>
import FormCommons from '../form/commons';
import countlyVue from '../../compat/vue-core';

export default countlyVue.components.BaseComponent.extend({
    mixins: [FormCommons.MultiStepForm]
});
</script>
<template>
    <div class="cly-vue-form">
        <slot name="default" v-bind="passedScope"></slot>
    </div>
</template>