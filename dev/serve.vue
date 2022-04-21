<script>
import Vue from 'vue';
// Uncomment import and local "components" registration if library is not registered globally.
// import { ClyComponentsSample } from '@/entry.esm';
import 'element-ui/lib/theme-chalk/index.css';
import '../src/styles/main.scss';

export default Vue.extend({
    name: 'ServeDev',
    // components: {
    //  ClyComponentsSample,
    // }
    watch: {
        selectXModeBuffer: function(newVal) {
            this.selectX = {
                mode: newVal,
                currentVal: newVal === 'single-list' ? null : []
            };
        }
    },
    methods: {
        remoteMethod: function(rawQuery) {
            var self = this;
            var filtered = this.selectXOptions.map(function(group) {
                return {
                    label: group.label,
                    name: group.name,
                    options: group.options.filter(function(option) {
                        return option.label && option.label.includes(rawQuery);
                    })
                };
            }).filter(function(group) {
                return group.options.length > 0;
            });
            return new Promise(function(resolve) {
                setTimeout(function() {
                    self.selectXRemoteOptions = filtered;
                    resolve(filtered);
                }, 400);
            });
        }
    },
    data: function() {
        var manyItems = [];

        for (var i = 0;i <= 50;i++) {
            if (i > 0 && i % 10 === 0) {
                manyItems.push({name: (i - i % 10) + "s"});
            }
            manyItems.push({name: "Type " + i, value: i});
        }
        return {
            selectedDate: '',
            dropdownsDisabled: false,
            autoCommitDisabled: false,
            allOptionsTabHidden: false,
            selectXRemoteOptions: [],
            selectXOptions: [{
                "label": "A Items",
                "name": "type-1",
                "options": [
                    {"label": "windows 10", "value": 0, "image": "I"},
                    {"label": "hello how", "value": 1, "image": "I"},
                    {"label": "hello2", "value": 2, "image": "I"},
                    {"label": "hello3", "value": 3, "image": "I"},
                    {"label": "hello4", "value": 4, "image": "I"},
                    {"label": "hello5", "value": 5, "image": "I"},
                    {"label": "hello6", "value": 6, "image": "I"},
                    {"label": "hello7", "value": 7, "image": "I"},
                    {"label": "hello8", "value": 8, "image": "I"},
                    {"label": "hello9", "value": 9, "image": "I"},
                    {"label": "hello10", "value": 10, "image": "I"},
                    {"label": "hello11", "value": 11, "image": "I"},
                ]
            },
            {
                "label": "B Items",
                "name": "type-2",
                "options": [
                    {"label": "user0", "value": 12},
                    {"label": "user1", "value": 13},
                ]
            }],
            selectXModeBuffer: 'single-list',
            selectX: {
                currentVal: null,
                remoteVal: null,
                mode: 'single-list',
            },

            selectedLB: 0,
            selectedCLB: [],
            activeTab: null,
            typedText: 'Type sth...',
            selectedRadio: 2,
            availableRadio: [
                {label: "Type 1", value: 1},
                {label: "Type 2", value: 2},
                {label: "Type 3", value: 3, description: "Some description..."},
            ],
            selectedGenericRadio: 2,
            availableGenericRadio: [
                {label: "Type 1", value: 1, cmp: {'template': '<div>Template</div>'}},
                {label: "Type 2", value: 2},
                {label: "Type 3", value: 3},
            ],
            selectedCheckFlag: true,
            selectedCheck: [1, 2],
            availableCheck: [
                {label: "Type 1", value: 1},
                {label: "Type 2", value: 2},
                {label: "Type 3", value: 3},
            ],
            selectWModel: 1, // it would automatically find the record {"name": "Type 1", "value": 1}
            selectWItems: manyItems,
            selectDWModel: null,
            selectDWItems: manyItems
        };
    }
});
</script>

<template>
  <div id="app">
    <cly-date-picker v-model="selectedDate" timestampFormat="ms" type="date"></cly-date-picker>
    <div class="example-cell">
        <cly-select-x
            search-placeholder="Search in Properties"
            placeholder="Select Property"
            v-model="selectX.currentVal"
            :auto-commit="!autoCommitDisabled"
            :mode="selectX.mode"
            :disabled="dropdownsDisabled"
            :hide-all-options-tab="allOptionsTabHidden"
            :options="selectXOptions[0].options">
            <template v-slot:option-prefix="option">
                <div style="border: 2px solid #F96300; width: 15px; text-align: center">{{option.image}}</div>
            </template>
        </cly-select-x>
    </div>
    <div class="example-cell">
        {{selectX.currentVal}}
    </div>
  </div>
</template>
