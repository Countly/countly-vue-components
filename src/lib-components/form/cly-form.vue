<script>
import FormCommons from '../form/commons';

export default {
    mixins: [FormCommons.MultiStepFormMixin]
};
</script>
<template>
    <div class="cly-vue-form">
        <slot name="default" v-bind="passedScope"></slot>
    </div>
</template>