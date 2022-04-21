<script>
import inViewport from 'vue-in-viewport-mixin';
export default {
    props: {
        dateMeta: Object,
    },
    data() {
        return {
            visible: false,
        };
    },
    mixins: [inViewport],
    watch: {
        'inViewport.now': function(visible) {
            this.visible = visible;
        },
    }
};
</script>
<template>
    <div class="cly-vue-daterp__date-table-wrapper" :class="dateMeta.anchorClass">
        <span class="text-medium">{{ dateMeta.title }}</span>
        <table-component v-if="visible" v-bind="$attrs" v-on="$listeners">
        </table-component>
        <div v-if="!visible" style="height:180px"></div>
    </div>
</template>