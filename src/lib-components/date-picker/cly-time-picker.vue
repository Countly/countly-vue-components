<script>
export default {
    name: 'ClyTimePicker',
    props: {
        width: {
            type: Number,
            default: 100,
            required: false
        },
        format: {
            type: String,
            default: 'HH:mm',
            required: false
        },
        clearable: {
            type: Boolean,
            default: false,
            required: false
        },
        appendToBody: {
            type: Boolean,
            default: true,
            required: false
        }
    }
};
</script>
<template>
    <el-time-picker :append-to-body="appendToBody" :style="{'width': width + 'px'}" class="cly-vue-time-picker" v-bind="$attrs" v-on="$listeners" :format="format" :clearable="clearable"></el-time-picker>
</template>