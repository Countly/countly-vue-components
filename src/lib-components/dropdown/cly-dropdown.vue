<script>
    import ELEMENT from 'element-ui';
    import countlyVue from '../../compat/vue-core';
    import triggerProxy from './trigger-proxy.vue';

    export default countlyVue.components.BaseComponent.extend({
        name: 'ClyDropdown',
        components: {
            'trigger-proxy': triggerProxy,
            'el-select-dropdown': ELEMENT.SelectDropdown
        },
        mixins: [ELEMENT.utils.Emitter],
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            popperAppendToBody: {
                type: Boolean,
                default: true
            },
            width: {
                type: [Number, Object],
                default: null
            },
            placement: {
                type: String,
                default: 'bottom-start'
            },
            popClass: {
                type: String
            }
        },
        inject: {
            popperAncestors: {
                default: function() {
                    return {};
                }
            }
        },
        computed: {
            popperUid: function() {
                return "popper-" + this.componentId;
            },
            popperClass: function() {
                return "cly-vue-dropdown__pop" + (this.popClass ? " " + this.popClass : "");
            }
        },
        provide: function() {
            var history = Object.assign({}, this.popperAncestors);
            history[this.popperUid] = true;
            return {
                'popperAncestors': history
            };
        },
        data: function() {
            return {
                visible: false,
                focused: false
            };
        },
        beforeDestroy: function() {
            this.broadcast('ElSelectDropdown', 'destroyPopper');
            this.$refs.popper && this.$refs.popper.doDestroy();
        },
        methods: {
            doClose: function(aborted) {
                if (this.visible) {
                    this.visible = false;
                    this.$emit("hide", aborted);
                }
            },
            handleOutsideClick: function() {
                this.doClose(true);
                this.focused = false;
            },
            handleClose: function(aborted) {
                this.doClose(aborted);
            },
            handleOpen: function() {
                if (!this.disabled && !this.visible) {
                    this.visible = true;
                }
            },
            handleToggle: function() {
                if (this.disabled && !this.visible) {
                    return;
                }
                this.visible = !this.visible;
                if (!this.visible) {
                    this.$emit("hide", true);
                }
            },
            updateDropdown: function() {
                var self = this;
                this.$nextTick(function() {
                    self.broadcast('ElSelectDropdown', 'updatePopper');
                });
            }
        },
        watch: {
            visible: function(newValue) {
                if (newValue) {
                    this.$emit("show");
                    this.focused = true;
                }
            }
        }
    });
</script>
<template>
    <div class="cly-vue-dropdown el-select"
        v-click-outside="handleOutsideClick">
        <trigger-proxy
            ref="reference"
            @click.native.stop="handleToggle"
            @keydown.native.esc.stop.prevent="handleClose(true)"
            @keydown.native.down.enter.prevent="handleOpen"
            @keydown.native.down.stop.prevent="handleOpen"
            @keydown.native.up.stop.prevent="handleOpen">
            <slot name="trigger" :visible="visible" :focused="focused">
            </slot>
        </trigger-proxy>
        <el-select-dropdown
            ref="popper"
            :width="width"
            :append-to-body="popperAppendToBody"
            :placement="placement"
            :visible-arrow="false"
            v-model="visible"
            v-show="visible">
            <div ref="popContent" class="cly-vue-dropdown__pop-container">
                <slot>
                </slot>
            </div>
        </el-select-dropdown>
    </div>
</template>
<style lang="scss">
    .cly-vue-dropdown {
        &__pop {
            padding: 0px;
            width: fit-content;
        }

        &__pop-container {
            word-break: initial;
        }
    }
</style>