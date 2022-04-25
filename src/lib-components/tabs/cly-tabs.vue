<script>
export default {
    props: {
        value: String,
        routePattern: String,
        routeKey: String,
        noHistory: {
            type: Boolean,
            default: true
        }
    }
};
</script>
<template>
    <div class="cly-vue-tabs">
        <el-tabs type="button" v-on="$listeners" v-bind="$attrs">
            <template v-slot>
                <slot></slot>
            </template>
        </el-tabs>
    </div>
</template>