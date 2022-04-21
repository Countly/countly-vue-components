<script>
export default {
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
                    {"label": "windows 10", "value": 0},
                    {"label": "hello how", "value": 1},
                    {"label": "hello2", "value": 2},
                    {"label": "hello3", "value": 3},
                    {"label": "hello4", "value": 4},
                    {"label": "hello5", "value": 5},
                    {"label": "hello6", "value": 6},
                    {"label": "hello7", "value": 7},
                    {"label": "hello8", "value": 8},
                    {"label": "hello9", "value": 9},
                    {"label": "hello10", "value": 10},
                    {"label": "hello11", "value": 11},
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
};
</script>
<template>
<div>
<el-card class="box-card options-box" style="position:fixed; bottom:25px; right: 25px">
            <div slot="header" class="clearfix">
                <span>Options</span>
            </div>
            <div class="item">
                <el-switch
                    active-text="Disable dropdowns"
                    v-model="dropdownsDisabled"
                    active-color="#2FA732">
                </el-switch>
            </div>
            <div class="item">
                <el-switch
                    active-text="Disable auto-commit"
                    v-model="autoCommitDisabled"
                    active-color="#2FA732">
                </el-switch>
            </div>
            <div class="item">
                <el-switch
                    active-text="Hide all options tab"
                    v-model="allOptionsTabHidden"
                    active-color="#2FA732">
                </el-switch>
            </div>
            <div class="item">
                <el-radio-group v-model="selectXModeBuffer" size="small">
                    <el-radio-button label="single-list">Single</el-radio-button>
                    <el-radio-button label="multi-check">Multi</el-radio-button>
                    <el-radio-button label="multi-check-sortable">Multi w/ sorting</el-radio-button>
                </el-radio-group>
            </div>
        </el-card>
        <div title="el-select">
            <div class="example-cell">
                <el-select v-model="selectedRadio" :disabled="dropdownsDisabled">
                    <el-option :key="item.value" :value="item.value" :label="item.name"
                        v-for="item in selectWItems"></el-option>
                </el-select>
            </div>
            <div class="example-cell">

            </div>
        </div>
        <div title="cly-dropdown (Nested)">
            <div class="example-cell">
                <cly-dropdown>
                    <template v-slot:trigger>Click</template>
                    <div>
                        <cly-dropdown>
                            <template v-slot:trigger>Click</template>
                            <div>
                                <cly-dropdown>
                                    <template v-slot:trigger>Click</template>
                                    <div>
                                        <cly-dropdown>
                                            <template v-slot:trigger>Click</template>
                                            <div>
                                                <cly-dropdown>
                                                    <template v-slot:trigger>Click</template>
                                                    <div>
                                                        <cly-dropdown>
                                                            <template v-slot:trigger>Click</template>
                                                            Hello
                                                        </cly-dropdown>
                                                    </div>
                                                </cly-dropdown>
                                            </div>
                                        </cly-dropdown>
                                    </div>
                                </cly-dropdown>
                            </div>
                        </cly-dropdown>
                    </div>
                </cly-dropdown>
            </div>
            <div class="example-cell">
            </div>
        </div>
        <div title="cly-select-x (Simple)">
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
        <div title="cly-select-x (Tabs)">
            <div class="example-cell">
                <cly-select-x
                    all-placeholder="All Properties"
                    search-placeholder="Search in Properties"
                    placeholder="Select Property"
                    v-model="selectX.currentVal"
                    :auto-commit="!autoCommitDisabled"
                    :mode="selectX.mode"
                    :disabled="dropdownsDisabled"
                    :hide-all-options-tab="allOptionsTabHidden"
                    :options="selectXOptions">
                </cly-select-x>
            </div>
            <div class="example-cell">
                {{selectX.currentVal}}
            </div>
        </div>
        <div title="cly-select-x (Remote)">
            <div class="example-cell">
                <cly-select-x
                    remote
                    :remote-method="remoteMethod"
                    all-placeholder="All Properties"
                    search-placeholder="Search in Properties"
                    placeholder="Select Property"
                    v-model="selectX.remoteVal"
                    :auto-commit="!autoCommitDisabled"
                    :mode="selectX.mode"
                    :disabled="dropdownsDisabled"
                    :hide-all-options-tab="allOptionsTabHidden"
                    :options="selectXRemoteOptions">
                </cly-select-x>
            </div>
            <div class="example-cell">
                {{selectX.remoteVal}}
            </div>
        </div>
        <div title="cly-select-x (Tabs, custom header)">
            <div class="example-cell">
                <cly-select-x
                    all-placeholder="All Properties"
                    search-placeholder="Search in Properties"
                    placeholder="Select Property"
                    title="Custom header & title"
                    :auto-commit="!autoCommitDisabled"
                    :disabled="dropdownsDisabled"
                    :hide-default-tabs="true"
                    :options="selectXOptions"
                    :mode="selectX.mode"
                    :hide-all-options-tab="allOptionsTabHidden"
                    v-model="selectX.currentVal">
                    <template v-slot:header="selectScope">
                        <el-radio-group
                            :value="selectScope.activeTabId"
                            @input="selectScope.updateTab"
                            size="medium">
                            <el-radio-button v-for="tab in selectScope.tabs" :key="tab.name" :label="tab.name">{{tab.label}}</el-radio-button>
                        </el-radio-group>
                    </template>
                </cly-select-x>
            </div>
            <div class="example-cell">
                {{selectX.currentVal}}
            </div>
        </div>
        <div title=" cly-select-x (Tabs, custom header #2)">
            <div class="example-cell">
                <cly-select-x
                    all-placeholder="All Properties"
                    search-placeholder="Search in Properties"
                    placeholder="Select Property"
                    title="Custom header & title"
                    :auto-commit="!autoCommitDisabled"
                    :mode="selectX.mode"
                    :disabled="dropdownsDisabled"
                    :hide-default-tabs="true"
                    :options="selectXOptions"
                    :hide-all-options-tab="allOptionsTabHidden"
                    :width="400"
                    v-model="selectX.currentVal">
                    <template v-slot:header="selectScope">
                        <div style="font-size: 12px; padding-bottom: 7px;">Property type</div>
                        <el-select
                            :popper-append-to-body="false"
                            :value="selectScope.activeTabId"
                            @input="selectScope.updateTab">
                            <el-option v-for="tab in selectScope.tabs" :key="tab.name" :value="tab.name" :label="tab.label"></el-option>
                        </el-select>
                    </template>
                </cly-select-x>
            </div>
            <div class="example-cell">
                {{selectX.currentVal}}
            </div>
        </div>
        </div>
</template>