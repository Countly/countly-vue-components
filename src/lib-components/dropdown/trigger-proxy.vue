<script>
import countlyVue from '../../compat/vue-core';

export default countlyVue.components.BaseComponent.extend({
    "name": 'TriggerProxy'
});
</script>
<template>
    <div style="width:100%"><slot v-slot></slot></div>
</template>