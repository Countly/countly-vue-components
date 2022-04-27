<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    mixins: [
        countlyVue.mixins.i18n
    ],
    props: {
        title: {type: String, required: false},
        link: {type: String, required: false}
    },
    methods: {
        back: function() {
            if (this.link) {
                app.navigate(this.link, true);
            }
            else {
                app.back();
            }
        }
    },
    computed: {
        innerTitle: function() {
            if (this.title) {
                return this.title;
            }
            return this.i18n("common.back");
        }
    }
});
</script>
<template>
    <a @click="back" class="cly-vue-back-link">
        <span class="text-medium bu-is-capitalized"><i class="fas fa-arrow-left bu-pr-3"></i>{{innerTitle}}</span>
    </a>
</template>