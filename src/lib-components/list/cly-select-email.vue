<script>

import countlyVue from '../../compat/vue-core';

const REGEX_EMAIL = '([a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)',
    SIMPLE_EMAIL = new RegExp('^' + REGEX_EMAIL + '$', 'i'),
    NAMED_EMAIL = new RegExp('^([^<]*)\<' + REGEX_EMAIL + '\>$', 'i');

export default {
    mixins: [
        countlyVue.mixins.i18n
    ],
    props: {
        value: {
            type: Array
        },
        placeholder: {
            type: String,
            default: countlyVue.i18n('common.enter-email-addresses'),
            required: false
        }
    },
    data: function() {
        return {
            currentInput: '',
        };
    },
    computed: {
        options: function() {
            return this.value.map(function(val) {
                return {value: val, label: val};
            });
        },
        parsedValue: function() {
            var input = this.currentInput;
            if (!input) {
                return false;
            }
            else if (SIMPLE_EMAIL.test(input)) {
                return {value: input, label: input};
            }
            else {
                var match = input.match(NAMED_EMAIL);
                if (match) {
                    // Current implementation ignores name field
                    return {value: match[2], label: match[2]};
                }
            }
            return false;
        },
        hasError: function() {
            return !this.parsedValue && this.currentInput;
        }
    },
    methods: {
        handleInput: function(value) {
            this.$emit("input", value);
        },
        pushAddress: function(address) {
            if (!this.value.includes(address.value)) {
                this.handleInput(this.value.concat([address.value]));
            }
        },
        tryPush: function() {
            if (this.parsedValue) {
                this.pushAddress(this.parsedValue);
                this.currentInput = "";
            }
        },
        updateDropdown: function() {
            this.$refs && this.$refs.selectx && this.$refs.selectx.updateDropdown();
        }
    },
    watch: {
        value: function() {
            this.updateDropdown();
        },
        hasError: function() {
            this.updateDropdown();
        }
    }
};
</script>
<template>
    <cly-select-x
        v-on="$listeners"
        v-bind="$attrs"
        :options="options"
        :placeholder="placeholder"
        :value="value"
        :searchable="false"
        hideAllOptionsTab
        mode="multi-check"
        ref="selectx"
        :noMatchFoundPlaceholder="i18n('common.no-email-addresses')"
        class="cly-vue-select-email"
        @input="handleInput">
        <template v-slot:header>
            <el-input
                v-model="currentInput"
                :class="{'is-error': hasError}"
                :placeholder="i18n('common.email-example')"
                @keyup.enter.native="tryPush">
            </el-input>
            <div class="bu-mt-2 color-red-100 text-small" v-show="hasError">
                {{i18n("common.invalid-email-address", currentInput)}}
            </div>
        </template>
    </cly-select-x>
</template>
