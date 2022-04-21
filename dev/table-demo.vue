<script>
export default {
    computed: {
        tableRows: function() {
            return [];
        }
    },
    data: function() {
        return {
            tableDynamicCols: [{
                value: "name",
                label: "Name",
                required: true
            },
            {
                value: "description",
                label: "Description",
                default: true
            }],
            localTableTrackedFields: ['status'],
            tablePersistKey: "vueExample_localTable"
        };
    }
};
</script>

<template>
    <cly-datatable
        :available-dynamic-cols="tableDynamicCols"
        :tracked-fields="localTableTrackedFields"
        :rows="tableRows"
        :resizable="false"
        :persist-key="tablePersistKey">
        <template v-slot="scope">
            <el-table-column fixed type="expand">
                <template v-slot>
                    Data in expanded row
                </template>
            </el-table-column>
            <el-table-column fixed type="selection">
            </el-table-column>
            <el-table-column fixed type="switch" label="Status">
                <template v-slot="rowScope">
                    <el-switch :value="rowScope.row.status"
                        @input="scope.patch(rowScope.row, {status: !rowScope.row.status})">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column fixed width="200" sortable="custom" type="clickable" prop="_id" label="ID">
            </el-table-column>
            <template v-for="(col,idx) in scope.dynamicCols">
                <el-table-column v-if="col.value === 'description'" width="540" sortable="custom" :key="idx"
                    prop="description" label="Description">
                    Some custom template for description which is very long so that we can see the action button
                </el-table-column>
                <el-table-column v-else width="280" :key="idx" sortable="custom" :prop="col.value" :label="col.label">
                </el-table-column>
            </template>
            <el-table-column align="center" type="options">
                <template v-slot="rowScope">
                    <cly-more-options v-if="rowScope.row.hover" @command="handleCommand($event, scope, rowScope.row)">
                        <el-dropdown-item command="edit">{{i18n('common.edit')}}</el-dropdown-item>
                        <el-dropdown-item command="remove">{{i18n('common.delete')}}</el-dropdown-item>
                    </cly-more-options>
                </template>
            </el-table-column>
        </template>
        <template v-slot:bottomline="scope">
            <cly-diff-helper :diff="scope.diff" @discard="scope.unpatch()">
            </cly-diff-helper>
        </template>
    </cly-datatable>
</template>