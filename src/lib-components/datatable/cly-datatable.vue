<script>
import countlyVue from '../../compat/vue-core';
import countlyCommon from '../../compat/countly.common.js';
import ClyDropdown from '../dropdown/cly-dropdown.vue';
import _ from 'underscore';
import lodash from 'lodash';
import Vue from 'vue';
import moment from 'moment';

var TableExtensionsMixin = {
    props: {
        persistKey: {
            type: String,
            default: null
        },
        dataSource: {
            type: Object,
            default: function() {
                return null;
            }
        },
        rows: {
            type: Array,
            default: function() {
                return [];
            }
        },
        availableDynamicCols: {
            type: Array,
            default: function() {
                return [];
            }
        },
        paused: {
            type: Boolean,
            default: false
        },
        displaySearch: {
            type: Boolean,
            default: true
        },
        defaultSort: {
            type: Object,
            default: function() {
                return { prop: '_id', order: 'asc' };
            },
            required: false
        }
    },
    computed: {
        hasDynamicCols: function() {
            return this.availableDynamicCols.length > 0;
        },
        availableDynamicColsLookup: function() {
            return this.availableDynamicCols.reduce(function(acc, col) {
                acc[col.value] = col;
                return acc;
            }, {});
        },
        publicDynamicCols: function() {
            var self = this;
            var cols = this.controlParams.selectedDynamicCols.map(function(val) {
                return self.availableDynamicColsLookup[val];
            }).filter(function(val) {
                return !!val;
            });
            return cols;
        },
        localSearchedRows: function() {
            var currentArray = this.rows.slice();
            if (this.displaySearch && this.controlParams.searchQuery) {
                var queryLc = (this.controlParams.searchQuery + "").toLowerCase();
                currentArray = currentArray.filter(function(item) {
                    return Object.keys(item).some(function(fieldKey) {
                        if (item[fieldKey] === null || item[fieldKey] === undefined) {
                            return false;
                        }
                        return (item[fieldKey] + "").toLowerCase().indexOf(queryLc) > -1;
                    });
                });
            }
            return currentArray;
        },
        localDataView: function() {
            var currentArray = this.localSearchedRows;
            if (this.controlParams.sort.length > 0) {
                var sorting = this.controlParams.sort[0],
                    dir = sorting.type === "asc" ? 1 : -1;

                currentArray = currentArray.slice();
                currentArray.sort(function(a, b) {
                    var priA = a[sorting.field],
                        priB = b[sorting.field];

                    if (typeof priA === 'object' && priA !== null && priA.sortBy) {
                        priA = priA.sortBy;
                        priB = priB.sortBy;
                    }

                    if (priA < priB) {
                        return -dir;
                    }
                    if (priA > priB) {
                        return dir;
                    }
                    return 0;
                });
            }
            var filteredTotal = currentArray.length;
            if (this.controlParams.perPage < currentArray.length) {
                var startIndex = (this.controlParams.page - 1) * this.controlParams.perPage,
                    endIndex = startIndex + this.controlParams.perPage;
                currentArray = currentArray.slice(startIndex, endIndex);
            }
            return {
                rows: currentArray,
                totalRows: filteredTotal,
                notFilteredTotalRows: this.rows.length
            };
        },
        dataView: function() {
            if (this.dataSource) {
                return this.externalData;
            }
            else {
                return this.localDataView;
            }
        },
        totalPages: function() {
            return Math.ceil(this.dataView.totalRows / this.controlParams.perPage);
        },
        lastPage: function() {
            return this.totalPages;
        },
        prevAvailable: function() {
            return this.controlParams.page > this.firstPage;
        },
        nextAvailable: function() {
            return this.controlParams.page < this.lastPage;
        },
        paginationInfo: function() {
            var page = this.controlParams.page,
                perPage = this.controlParams.perPage,
                searchQuery = this.controlParams.searchQuery,
                grandTotal = this.dataView.notFilteredTotalRows,
                filteredTotal = this.dataView.totalRows,
                startEntries = (page - 1) * perPage + 1,
                endEntries = Math.min(startEntries + perPage - 1, filteredTotal),
                info = this.i18n("common.table.no-data");

            if (filteredTotal > 0) {
                info = this.i18n("common.showing")
                    .replace("_START_", countlyCommon.formatNumber(startEntries))
                    .replace("_END_", countlyCommon.formatNumber(endEntries))
                    .replace("_TOTAL_", countlyCommon.formatNumber(filteredTotal));
            }

            if (this.displaySearch && searchQuery) {
                info += " " + this.i18n("common.filtered").replace("_MAX_", grandTotal);
            }
            return info;
        },
        externalData: function() {
            if (!this.dataSource) {
                return [];
            }
            var addr = this.dataSource.dataAddress;
            return addr.store.getters[addr.path];
        },
        externalStatus: function() {
            if (!this.dataSource) {
                return undefined;
            }
            var addr = this.dataSource.statusAddress;
            return addr.store.getters[addr.path];
        },
        externalParams: function() {
            if (!this.dataSource) {
                return undefined;
            }
            var addr = this.dataSource.paramsAddress;
            return addr.store.getters[addr.path];
        },
        availablePages: function() {
            var pages = [];
            for (var i = this.firstPage, I = Math.min(this.lastPage, 10000); i <= I; i++) {
                pages.push(i);
            }
            return pages;
        }
    },
    watch: {
        controlParams: {
            deep: true,
            handler: _.debounce(function() {
                this.triggerExternalSource();
                this.setControlParams();
            }, 500)
        },
        'controlParams.page': function() {
            this.checkPageBoundaries();
        },
        'controlParams.selectedDynamicCols': function() {
            this.$refs.elTable.store.updateColumns(); // TODO: Hacky, check for memory leaks.
        },
        'controlParams.searchQuery': function(newVal) {
            this.$emit('search-query-changed', newVal);
        },
        lastPage: function() {
            this.checkPageBoundaries();
        },
        paused: function(newVal) {
            if (newVal) {
                this.dataSource.updateParams({
                    ready: false
                });
            }
            else {
                this.triggerExternalSource();
            }
        }
    },
    data: function() {
        var controlParams = this.getControlParams();

        if (!controlParams.selectedDynamicCols || !Array.isArray(controlParams.selectedDynamicCols)) {
            controlParams.selectedDynamicCols = this.availableDynamicCols.reduce(function(acc, option) {
                if (option.default || option.required) {
                    acc.push(option.value);
                }
                return acc;
            }, []);
        }

        return {
            controlParams: controlParams,
            firstPage: 1
        };
    },
    mounted: function() {
        this.triggerExternalSource();
    },
    beforeDestroy: function() {
        this.setControlParams();
    },
    methods: {
        checkPageBoundaries: function() {
            if (this.lastPage > 0 && this.controlParams.page > this.lastPage) {
                this.controlParams.page = this.lastPage;
            }
            if (this.controlParams.page < 1) {
                this.controlParams.page = 1;
            }
        },
        goToFirstPage: function() {
            this.controlParams.page = this.firstPage;
        },
        goToLastPage: function() {
            this.controlParams.page = this.lastPage;
        },
        goToPrevPage: function() {
            if (this.prevAvailable) {
                this.controlParams.page--;
            }
        },
        goToNextPage: function() {
            if (this.nextAvailable) {
                this.controlParams.page++;
            }
        },
        onSortChange: function(elTableSorting) {
            if (elTableSorting.order) {
                this.updateControlParams({
                    sort: [{
                        field: elTableSorting.prop,
                        type: elTableSorting.order === "ascending" ? "asc" : "desc"
                    }]
                });
            }
            else {
                this.updateControlParams({
                    sort: []
                });
            }
        },
        triggerExternalSource: function() {
            if (!this.dataSource || this.paused) {
                return;
            }
            if (this.dataSource.fetch) {
                this.dataSource.fetch(this.controlParams);
            }
            this.$emit("params-change", this.controlParams);
        },
        updateControlParams: function(newParams) {
            _.extend(this.controlParams, newParams);
        },
        getControlParams: function() {
            var defaultState = {
                page: 1,
                perPage: 10,
                searchQuery: '',
                sort: [],
                selectedDynamicCols: false
            };

            if (this.defaultSort) {
                defaultState.sort = [{
                    field: this.defaultSort.prop,
                    type: this.defaultSort.order === "ascending" ? "asc" : "desc"
                }];
            }

            if (!this.persistKey) {
                return defaultState;
            }
            var loadedState = localStorage.getItem(this.persistKey);
            try {
                if (loadedState) {
                    var parsed = JSON.parse(loadedState);
                    // disable loading of persisted searchQuery
                    parsed.searchQuery = ""; // but we still need the field to be present for reactivity
                    return parsed;
                }
                return defaultState;
            }
            catch (ex) {
                return defaultState;
            }
        },
        setControlParams: function() {
            if (this.persistKey) {
                localStorage.setItem(this.persistKey, JSON.stringify(this.controlParams));
            }
        }
    }
};

var MutationTrackerMixin = {
    data: function() {
        return {
            patches: {},
            hasSelection: false
        };
    },
    props: {
        trackedFields: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },
    watch: {
        sourceRows: function(newSourceRows) {
            if (Object.keys(this.patches).length === 0) {
                return [];
            }
            var self = this;

            newSourceRows.forEach(function(row) {
                var rowKey = self.keyOf(row);
                if (!self.patches[rowKey]) {
                    return;
                }
                var sourceChanges = Object.keys(self.patches[rowKey]).reduce(function(acc, fieldKey) {
                    var currentPatch = self.patches[rowKey][fieldKey];
                    if (currentPatch.originalValue !== row[fieldKey]) {
                        acc[fieldKey] = { originalValue: row[fieldKey], newValue: currentPatch.newValue };
                    }
                    else if (currentPatch.newValue !== row[fieldKey]) {
                        acc[fieldKey] = currentPatch;
                    }
                    return acc;
                }, {});
                Vue.set(self.patches, rowKey, sourceChanges);
            });
        }
    },
    methods: {
        keyOf: function(row, dontStringify) {
            if (dontStringify) {
                return this.keyFn(row);
            }
            return JSON.stringify(this.keyFn(row));
        },
        patch: function(row, fields) {
            var rowKey = this.keyOf(row),
                self = this;
            var newPatch = Object.keys(fields).reduce(function(acc, fieldKey) {
                if (self.patches[rowKey] && Object.prototype.hasOwnProperty.call(self.patches[rowKey], fieldKey)) {
                    var newValue = self.patches[rowKey][fieldKey].newValue;
                    var originalValue = self.patches[rowKey][fieldKey].originalValue;
                    if (newValue !== fields[fieldKey]) {
                        acc[fieldKey] = { originalValue: originalValue, newValue: fields[fieldKey] };
                    }
                }
                else if (row[fieldKey] !== fields[fieldKey]) {
                    acc[fieldKey] = { originalValue: row[fieldKey], newValue: fields[fieldKey] };
                }
                return acc;
            }, {});

            newPatch = lodash.merge({}, self.patches[rowKey] || {}, newPatch);

            Vue.set(this.patches, rowKey, newPatch);
        },
        unpatch: function(row, fields) {
            var self = this;

            var rowKeys = null;
            if (!row) {
                rowKeys = Object.keys(this.patches);
            }
            else {
                rowKeys = [this.keyOf(row)];
            }

            rowKeys.forEach(function(rowKey) {
                if (!self.patches[rowKey]) {
                    return;
                }

                if (!fields) {
                    Vue.delete(self.patches, rowKey);
                }
                else {
                    fields.forEach(function(fieldName) {
                        Vue.delete(self.patches[rowKey], fieldName);
                    });
                    if (Object.keys(self.patches[rowKey]).length === 0) {
                        Vue.delete(self.patches, rowKey);
                    }
                }
            });

        }
    },
    computed: {
        diff: function() {
            if (this.trackedFields.length === 0 || Object.keys(this.patches).length === 0) {
                return [];
            }
            var diff = [],
                self = this;
            Object.keys(this.patches).forEach(function(rowKey) {
                self.trackedFields.forEach(function(fieldName) {
                    if (self.patches[rowKey] && Object.prototype.hasOwnProperty.call(self.patches[rowKey], fieldName)) {
                        var patch = self.patches[rowKey][fieldName];
                        if (patch.originalValue !== patch.newValue) {
                            diff.push({
                                key: JSON.parse(rowKey),
                                field: fieldName,
                                newValue: patch.newValue,
                                originalValue: patch.originalValue
                            });
                        }
                    }
                });
            });
            return diff;
        },
        mutatedRows: function() {
            if (Object.keys(this.patches).length === 0) {
                return this.sourceRows;
            }
            var self = this;
            return self.sourceRows.map(function(row) {
                var rowKey = self.keyOf(row);
                if (self.patches[rowKey]) {
                    var newValues = Object.keys(self.patches[rowKey]).reduce(function(acc, fieldKey) {
                        acc[fieldKey] = self.patches[rowKey][fieldKey].newValue;
                        return acc;
                    }, {});
                    return Object.assign({}, row, newValues);
                }
                return row;
            });
        }
    }
};

var DEFAULT_ROW = {
    rowspan: 1,
    colspan: 1
};

var NO_COL_ROW = {
    rowspan: 1,
    colspan: 0
};

var OverlayRowMixin = {
    props: {
        isOverlayActiveFn: {
            type: Function,
            default: null
        },
    },
    methods: {
        tableSpanMethod: function(obj) {
            if (this.isOverlayActiveFn && this.isOverlayActiveFn(obj)) {
                if (obj.column.type !== "overlay") {
                    return NO_COL_ROW;
                }
                else {
                    return {
                        rowspan: 1,
                        colspan: this.$refs.elTable.columns.length
                    };
                }
            }

            return DEFAULT_ROW;
        },
        onCellMouseEnter: function(row) {
            if (this.hasSelection) {
                //If the table is in a selection mode, donot patch
                //Because if we patch to show action buttons the selection will be lost
                return;
            }

            var thisRowKey = this.keyOf(row);
            var hovered = this.mutatedRows.filter(function(r) {
                return r.hover;
            });

            for (var i = 0; i < hovered.length; i++) {
                var rowKey = this.keyOf(hovered[i]);

                if (thisRowKey !== rowKey) {
                    this.unpatch(hovered[i], ["hover"]);
                }
            }

            if (!row.hover) {
                this.patch(row, {hover: true});
            }
        },
        onSelectionChange: function(selected) {
            this.hasSelection = selected.length ? true : false;
            if (!this.hasSelection) {
                this.removeHovered();
            }
        },
        onNoCellMouseEnter: function() {
            if (this.hasSelection) {
                //If the table is in a selection mode, donot unpatch
                //Because if we unpatch to hide action buttons selection will be lost on unpatch
                return;
            }

            this.removeHovered();
        },
        removeHovered: function() {
            var hovered = this.mutatedRows.filter(function(r) {
                return r.hover;
            });

            for (var i = 0; i < hovered.length; i++) {
                this.unpatch(hovered[i], ["hover"]);
            }
        }
    }
};

var ExportHandlerMixin = {
    props: {
        exportQuery: {
            type: Function,
            default: null,
            required: false
        },
        exportApi: {
            type: Function,
            default: null,
            required: false
        },
        exportFormat: {
            type: Function,
            default: null,
            required: false
        },
        exportColumnSelection: {
            type: Boolean,
            default: false,
            required: false
        },
        hasExport: {
            type: Boolean,
            default: true,
            required: false
        }
    },
    data: function() {
        return {
            selectedExportColumns: null,
            selectedExportType: 'csv',
            availableExportTypes: [
                {'name': '.CSV', value: 'csv'},
                {'name': '.JSON', value: 'json'},
                {'name': '.XLSX', value: 'xlsx'}
            ],
            searchQuery: ''
        };
    },
    methods: {
        onExportClick: function() {
            this.initiateExport({
                type: this.selectedExportType
            });
        },
        getDefaultFileName: function(params) {
            var name = "countly";
            if (params.title) {
                name = params.title.replace(/[\r\n]+/g, "");
            }
            if (params.timeDependent) {
                //include export range
                name += "_for_"; // TODO: Fix+ countlyCommon.getDateRange();
            }
            else {
                //include export date
                name += "_on_" + moment().format("DD-MMM-YYYY");
            }
            return (name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
        },
        getLocalExportContent: function() {
            if (this.exportFormat) {
                return this.exportFormat(this.rows);
            }
            return this.rows;
        },
        initiateExport: function() {
            // TODO: implement export
        },
        getMatching: function(options) {
            if (!this.searchQuery) {
                return options;
            }
            var self = this;
            var query = (self.searchQuery + "").toLowerCase();
            return options.filter(function(option) {
                if (!option) {
                    return false;
                }
                var compareTo = option.label || option.value || "";
                return compareTo.toLowerCase().indexOf(query) > -1;
            });
        }
    },
    computed: {
        exportColumns: {
            get: function() {
                return this.selectedExportColumns || this.controlParams.selectedDynamicCols;
            },
            set: function(val) {
                this.selectedExportColumns = val;
            }
        },
        exportAllColumns: {
            get: function() {
                return this.exportColumns.length === this.availableDynamicCols.length;
            },
            set: function(val) {
                if (val) {
                    this.exportColumns = this.availableDynamicCols.map(function(c) {
                        return c.value;
                    });
                }
                else {
                    this.exportColumns = [];
                }
            }
        }
    }
};

export default countlyVue.components.BaseComponent.extend({
    name: 'ClyDatatable',
    components: {
        'cly-dropdown': ClyDropdown,
    },
    mixins: [
        countlyVue.commonFormatters,
        countlyVue.mixins.i18n,
        TableExtensionsMixin,
        MutationTrackerMixin,
        OverlayRowMixin,
        ExportHandlerMixin
    ],
    props: {
        keyFn: {
            type: Function,
            default: function(row) {
                return row._id;
            }
        },
        availablePageSizes: {
            type: Array,
            default: function() {
                return [5, 10, 20, 50, 100, 200, 1000];
            }
        },
        searchPlaceholder: {
            type: String,
            default: 'Search'
        },
        border: {
            type: Boolean,
            default: false
        },
        hideTop: {
            type: Boolean,
            default: false
        },
        forceLoading: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data: function() {
        return {
            slotMapping: {
                'header-left': 'header-left',
                'header-right': 'header-right',
                'footer-left': 'footer-left',
                'footer-right': 'footer-right',
                'bottomline': 'bottomline'
            }
        };
    },
    computed: {
        searchQueryProxy: {
            get: function() {
                if (this.displaySearch) {
                    return this.controlParams.searchQuery;
                }
                return '';
            },
            set: function(query) {
                if (this.displaySearch) {
                    _.extend(this.controlParams, { searchQuery: query, page: 1});
                }
            }
        },
        forwardedSlots: function() {
            var self = this;
            return Object.keys(this.$scopedSlots).reduce(function(slots, slotKey) {
                if (!self.slotMapping[slotKey]) {
                    slots[slotKey] = self.$scopedSlots[slotKey];
                }
                return slots;
            }, {});
        },
        isLoading: function() {
            if (this.forceLoading === true) {
                return true;
            }
            if (!this.dataSource) {
                return false;
            }
            return this.externalStatus !== 'ready' || (this.externalParams && !this.externalParams.ready);
        },
        classes: function() {
            var classes = [];
            if (!this.forceLoading && this.dataSource && this.externalStatus === 'silent-pending') {
                classes.push("silent-loading");
            }

            return classes;
        },
        sourceRows: function() {
            return this.dataView.rows;
        },
        commonScope: function() {
            return {
                diff: this.diff,
                patch: this.patch,
                unpatch: this.unpatch,
                dynamicCols: this.publicDynamicCols
            };
        }
    }
});
</script>
<template>
    <div class="cly-vue-eldatatable" :class="classes">
        <div v-loading="isLoading" element-loading-background="rgb(255,255,255,0.3)">
            <div v-if="!hideTop" class="bu-level cly-vue-eldatatable__header cly-vue-eldatatable__header--white" @mouseenter="onNoCellMouseEnter">
                <div class="bu-level-left">
                    <slot v-bind="commonScope" name="header-left"></slot>
                </div>
                <slot v-bind="commonScope" name="header-full"></slot>
                <div class="bu-level-right">
                    <slot v-bind="commonScope" name="header-right"></slot>
                    <div class="bu-level-item">
                        <cly-select-x
                            v-if="hasDynamicCols"
                            search-placeholder="Search in Columns"
                            placeholder="Edit columns"
                            title="Edit columns"
                            mode="multi-check-sortable"
                            placement="bottom-end"
                            :width="300"
                            :auto-commit="false"
                            :hide-default-tabs="true"
                            :hide-all-options-tab="true"
                            :options="availableDynamicCols"
                            v-model="controlParams.selectedDynamicCols">
                            <template v-slot:trigger>
                                <el-button size="small" icon="ion-navicon-round"></el-button>
                            </template>
                        </cly-select-x>
                    </div>
                    <div class="bu-level-item" v-if="hasExport">
                        <cly-dropdown :width="332" placement="bottom-end" ref="exportDropdown">
                            <template v-slot:trigger>
                                <el-button size="small" icon="cly-icon-btn cly-icon-download"></el-button>
                            </template>
                            <template>
                                <div class="bu-mx-4 bu-mt-4">
                                    <p class="bu-mb-4 color-cool-gray-100">{{i18n('export.export-as')}}</p>
                                    <el-radio-group
                                        class="bu-mb-5"
                                        v-model="selectedExportType">
                                        <el-radio-button v-for="exportType in availableExportTypes" :key="exportType.value" :label="exportType.value" style="width: 99px; display: inline-grid;">{{exportType.name}}</el-radio-button>
                                    </el-radio-group>
                                </div>
                                <div v-if="exportColumnSelection" class="cly-vue-eldatatable__export--extended">
                                    <div class="bu-mx-4 bu-mb-3">
                                        <div class="bu-level bu-mb-3">
                                            <div class="bu-level-left">
                                                <el-checkbox v-model="exportAllColumns">
                                                    <span class="text-medium">
                                                        {{i18n('export.export-all-columns')}}
                                                    </span>
                                                </el-checkbox>
                                            </div>
                                            <div class='bu-level-right text-small color-cool-gray-50' >
                                                {{i18n('export.export-columns-selected-count',(exportColumns.length || 0 ),availableDynamicCols.length)}}
                                            </div>
                                        </div>
                                        <div class="bu-level">
                                            <div class="bu-level-item cly-vue-eldatatable__export--search">
                                                <el-input
                                                    ref="searchBox"
                                                    autocomplete="off"
                                                    v-model="searchQuery"
                                                    placeholder="Search Columns">
                                                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                                                </el-input>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="bu-mx-2">
                                        <cly-checklistbox
                                        v-model="exportColumns"
                                        :sortable="false"
                                        :bordered="false"
                                        :options="getMatching(availableDynamicCols)">
                                        </cly-checklistbox>
                                    </div>
                                    <slot name="export-config"></slot>
                                </div>
                                <div class="bu-mx-4 bu-mb-4">
                                    <el-button size="medium" @click="onExportClick" type="success" style="width: 100%">{{i18n('export.export')}}</el-button>
                                </div>
                            </template>
                        </cly-dropdown>
                    </div>
                    <div class="bu-level-item" v-if="displaySearch">
                        <form>
                            <el-input autocomplete="off" size="small" class="cly-vue-eldatatable__search--grey" style="width:200px" prefix-icon="ion-ios-search-strong" :placeholder="searchPlaceholder" v-model="searchQueryProxy"></el-input>
                        </form>
                    </div>
                </div>
            </div>
            <el-table
                :border="border"
                :row-key="keyFn"
                :data="mutatedRows"
                :span-method="tableSpanMethod"
                :default-sort="defaultSort"
                v-bind="$attrs"
                v-on="$listeners"
                @sort-change="onSortChange"
                @selection-change="onSelectionChange"
                @cell-mouse-enter="onCellMouseEnter"
                ref="elTable">
                    <template slot="empty" v-if="!isLoading">
                        <cly-empty-datatable></cly-empty-datatable>
                    </template>
                    <template slot="empty" v-if="isLoading">
                        <div class="cly-vue-eldatatable__empty-slot"></div>
                    </template>
                    <template v-for="(_, name) in forwardedSlots" v-slot:[name]>
                        <slot :name="name" v-bind="commonScope"/>
                    </template>
            </el-table>
            <div class="bu-level cly-vue-eldatatable__footer cly-vue-eldatatable__footer--white" @mouseenter="onNoCellMouseEnter">
                <div class="bu-level-left">
                    <div class="bu-level-item text-smallish bu-mr-0">
                        {{ i18n("common.items-per-page") }}:
                    </div>
                    <div class="bu-level-item text-smallish">
                        <el-select :borderless="true" style="margin-top: 2px;" :adaptiveLength="true" v-model="controlParams.perPage" size="mini">
                            <el-option v-for="pageSize in availablePageSizes" :key="pageSize" :value="pageSize" :label="pageSize"></el-option>
                        </el-select>
                    </div>
                    <div class="bu-level-item" style="font-size: 11px">
                        {{ paginationInfo }}
                    </div>
                    <slot v-bind="commonScope" name="footer-left"></slot>
                </div>
                <div class="bu-level-right">
                    <slot v-bind="commonScope" name="footer-right"></slot>
                    <div class="bu-level-item text-smallish bu-mr-0">
                        <div class="cly-vue-eldatatable__table-page-selector" style="margin-top: 2px;" >
                            <el-select :borderless="true" :adaptiveLength="true" v-if="totalPages <= 200" v-model="controlParams.page" size="mini">
                                <el-option v-for="page in availablePages" :key="page" :value="page" :label="page"></el-option>
                            </el-select>
                            <el-input v-else type="number" :min="1" style="width: 160px" class="bu-mr-1" :max="totalPages" v-model="controlParams.page" size="mini"></el-input>
                        </div>
                    </div>
                    <div class="bu-level-item text-smallish">
                        of {{formatNumber(totalPages)}} pages
                    </div>
                    <div :class="{'bu-level-item': true, 'cursor-pointer': true, 'color-cool-gray-100': prevAvailable, 'cool-gray-30': !prevAvailable}">
                        <span :class="{disabled: !prevAvailable}" @click="goToFirstPage"><i class="ion-ios-arrow-back"></i><i class="ion-ios-arrow-back"></i></span>
                    </div>
                    <div :class="{'bu-level-item': true, 'cursor-pointer': true, 'color-cool-gray-100': prevAvailable, 'cool-gray-30': !prevAvailable}">
                        <span :class="{disabled: !prevAvailable}" @click="goToPrevPage"><i class="ion-ios-arrow-back"></i></span>
                    </div>
                    <div :class="{'bu-level-item': true, 'cursor-pointer': true, 'color-cool-gray-100': nextAvailable, 'cool-gray-30': !nextAvailable}">
                        <span :class="{disabled: !nextAvailable}" @click="goToNextPage"><i class="ion-ios-arrow-forward"></i></span>
                    </div>
                    <div :class="{'bu-level-item': true, 'cursor-pointer': true, 'color-cool-gray-100': nextAvailable, 'cool-gray-30': !nextAvailable}">
                        <span :class="{disabled: !nextAvailable}" @click="goToLastPage"><i class="ion-ios-arrow-forward"></i><i class="ion-ios-arrow-forward"></i></span>
                    </div>
                </div>
            </div>
            <div>
                <slot name="bottomline" v-bind="commonScope"></slot>
            </div>
        </div>
    </div>
</template>
<style lang="scss">
    @use "../../styles/base/colors" as c;
    @use "../../styles/base/typography-variables" as t;
    @use "../../styles/base/variables" as v;
    @use "sass:map";

    .cly-vue-eldatatable {

        &.silent-loading {
            .el-loading-spinner {
                visibility: hidden;
            }
            .el-loading-mask {
                display: none!important;
            }
        }

        &__header {
            height: 56px;
            border-left: none;
            border-right: none;
            box-sizing: border-box;
            padding: 12px;
            border-top: 1px solid map.get(c.$colors, "warm-gray-30");

            &--white {
                background-color: map.get(c.$colors, "white");
                color: c.$table-text-color;
                font-size: t.$text-smd-size;
            }
        }

        &__export {
            &--extended {
                &::after {
                    // shadow
                    content: "";
                    position: absolute;
                    width: 100%;
                    height: 12px;
                    background: linear-gradient(180deg, #333c48 0%, rgba(51, 60, 72, 0.0001) 100%);
                    top: 185px;
                    left: 0;
                    opacity: 0.12;
                }
            }
            &--search {
                input[type=text] {
                    background-color: #F6F6F6;
                }
            }
        }

        &__search {
            &--grey {
                input {
                    background-color: #FBFDFE;
                }
            }
        }

        &__footer {
            height: 40px;
            box-shadow: 0px 2px 0px #EEF2F5;
            border-left: none;
            border-right: none;
            box-sizing: border-box;
            padding: 0px 12px;

            &--white {
                background-color: map.get(c.$colors, "white");
                color: c.$table-footer-text-color;
                font-size: t.$text-smd-size;
            }
        }

        .undo-row {
            position: absolute;
            left: 0;
            padding: 9px 0px;
            background-color: #FFD7D6;
            color: #2b2b2b;
            width: 100%;
            height: 100%;
            top: 0;
            z-index: 999;
            vertical-align: middle;
            display: flex;
            align-items: center;
            justify-content: center;
            a {
                color: #017AFF;
                cursor: pointer;
            }
        }

        .el-table-column--options .cly-vue-more-options {
            position: absolute;
            top: calc(50% - 16px);
            right: calc(50% - 20px);
        }

        div.cell {
            padding-left:16px;
            padding-right: 8px;
        }

        &__empty-slot {
            height: 200px;
        }
    }
</style>