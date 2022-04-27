<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    mixins: [
        countlyVue.mixins.i18n
    ],
    props: {
        crumbs: {
            type: Array,
            default: function() {
                return [];
            }
        },
    }
});
</script>
<template>
    <div class='bu-level cly-breadcrumbs bu-mb-5'>
        <div v-for='(crumb, index) in crumbs'
            :class='["bu-level-item text-medium bu-mr-0",
                    {"bu-ml-2": (index !== 0)},
                    {"color-cool-gray-40": (index === (crumbs.length - 1))}]'>
            <a :href='crumb.url'>{{crumb.label}}</a>
            <span class='bu-ml-2' v-if='index !== (crumbs.length - 1)'>></span>
        </div>
    </div>
</template>