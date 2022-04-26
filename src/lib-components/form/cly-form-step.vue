<script>
import countlyVue from '../../compat/vue-core';
export default countlyVue.components.BaseComponent.extend({
    props: {
        validatorFn: {type: Function},
        id: { type: String, required: true },
        screen: {
            type: String,
            default: "half",
            validator: function(value) {
                return ['half', 'full'].indexOf(value) !== -1;
            }
        }
    },
    data: function() {
        return {
            watchHandle: null
        };
    },
    mounted: function() {
        var self = this;
        this.watchHandle = this.$watch(function() {
            return self.$refs.observer.flags.valid;
        },
        function(newVal) {
            self.isValid = newVal;
        });
    },
    methods: {
        reset: function() {
            this.$refs.observer.reset();
        },
        touch: function() {
            this.$refs.observer.validate();
        }
    },
    computed: {
        isParentReady: function() {
            if (this.$parent.isToggleable) {
                return this.$parent.isOpened;
            }
            return true;
        }
    },
    beforeDestroy: function() {
        this.watchHandle(); // unwatch
    }
});
</script>
<template>
    <div class="cly-vue-content" :id="elementId" v-if="isActive || alwaysMounted">
        <validation-observer ref="observer">
            <div v-show="isActive" v-if="isParentReady">
                <slot/>
            </div>
        </validation-observer>
    </div>
</template>