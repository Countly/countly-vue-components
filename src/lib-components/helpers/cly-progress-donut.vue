<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.mixins.BaseContent.extend({
    props: {
        percentage: {default: 42},
        color: {type: [String, Function, Array], default: '#00C3CA'},
        mode: {
            type: String,
            default: 'simple',
            validator: function(val) {
                return val === 'simple' || val === 'advanced-tile';
            }
        },
        label: {type: String, required: false, default: ''}
    },
    computed: {
        topClasses: function() {
            if (this.mode === 'advanced-tile') {
                return 'bu-p-5 bu-is-flex';
            }
            return '';
        }
    }
});
</script>
<template>
    <div :class="topClasses">
        <el-progress :color="color" :percentage="percentage" type="circle" :width="56" stroke-linecap="butt" :stroke-width="9" :show-text="false"></el-progress>
        <div v-if="mode === 'advanced-tile'" class="bu-pl-5 bu-is-flex bu-is-flex-direction-column bu-is-justify-content-space-between">
            <span class="text-medium"><slot>{{label}}</slot></span>
            <h2>{{percentage}} %</h2>
        </div>
    </div>
</template>