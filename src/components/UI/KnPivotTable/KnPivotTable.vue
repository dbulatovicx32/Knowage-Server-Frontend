<template>
    <table class="pivot-table" :style="descriptor.pivotStyles.table">
        <thead>
            <th class="pivot-header" v-for="(column, index) of columns.slice(1)" :key="index" :style="descriptor.pivotStyles.header">
                {{ column.field }}
                <i v-if="column.isEditable && column.type !== 'merge' && column.columnInfo.type !== 'boolean'" class="pi pi-pencil edit-icon p-ml-2" />
            </th>
            <th class="pivot-header" :style="descriptor.pivotStyles.iconColumn" />
        </thead>

        <tr v-for="(row, index) of mappedRows" :key="index">
            <template v-for="(column, i) of columns.slice(1)" :key="i">
                <td class="pivot-data" v-if="row[column.field].rowSpan > 0" :rowspan="row[column.field].rowSpan" :style="descriptor.pivotStyles.row">
                    <KnPivotTableEditableField
                        v-if="column.isEditable && column.type !== 'merge'"
                        :column="column"
                        :propRow="row"
                        :comboColumnOptions="columnOptions"
                        @rowChanged="setRowEdited(row)"
                        @dropdownChanged="onDropdownChange"
                        @dropdownOpened="$emit('dropdownOpened', $event)"
                    ></KnPivotTableEditableField>
                    <Checkbox v-else-if="column.editorType === 'TEXT' && column.columnInfo.type === 'boolean'" v-model="row[column.field].data" :binary="true" :disabled="!column.isEditable || column.type === 'merge'" @change="setRowEdited(row)"></Checkbox>
                    <span v-else-if="!column.isEditable && column.columnInfo.type === 'date'">{{ getFormatedDate(row[column.field].data, column.columnInfo.dateFormat) }} </span>
                    <span v-else-if="!column.isEditable && row[column.field].data && (column.columnInfo.type === 'int' || column.columnInfo.type === 'float')">{{ getFormatedNumber(row[column.field].data) }}</span>
                    <span v-else>{{ row[column.field].data }}</span>
                </td>
            </template>
            <td class="pivot-data"><i v-if="row.edited" class="pi pi-flag" :style="descriptor.pivotStyles.iconColumn"></i></td>
        </tr>
    </table>

    <Paginator
        v-model:first="first"
        :rows="numberOfRows"
        :totalRecords="lazyParams.size"
        :currentPageReportTemplate="
            $t('common.table.footer.paginated', {
                first: '{first}',
                last: '{last}',
                totalRecords: '{totalRecords}'
            })
        "
        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        @page="onPage($event)"
    ></Paginator>
    <RegistryDatatableWarningDialog :visible="warningVisible" :columns="dependentColumns" @close="onWarningDialogClose"></RegistryDatatableWarningDialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatDateWithLocale, formatNumberWithLocale } from '@/helpers/commons/localeHelper'
import Checkbox from 'primevue/checkbox'
import KnPivotTableEditableField from './KnPivotTableEditableField.vue'
import Paginator from 'primevue/paginator'
import RegistryDatatableWarningDialog from '@/modules/documentExecution/registry/tables/RegistryDatatableWarningDialog.vue'
import descriptor from '@/modules/documentExecution/registry/tables/RegistryDatatableDescriptor.json'

export default defineComponent({
    name: 'kn-pivot-table',
    components: { Checkbox, KnPivotTableEditableField, Paginator, RegistryDatatableWarningDialog },
    props: {
        columns: [] as any,
        rows: [] as any,
        propConfiguration: { type: Object },
        entity: { type: String },
        id: { type: String },
        pagination: { type: Object },
        comboColumnOptions: { type: Array },
        numberOfRows: { type: Number }
    },
    emits: ['rowChanged', 'pageChanged', 'dropdownOpened'],
    created() {
        this.mapRows()
        this.checkForRowSpan(0, this.mappedRows.length - 1, this.mappedRows, this.columns, 1)
        this.loadPagination()
        this.loadColumnOptions()
    },
    watch: {
        rows: {
            handler() {
                this.mapRows()
                this.checkForRowSpan(0, this.mappedRows.length - 1, this.mappedRows, this.columns, 1)
            },
            deep: true
        },
        pagination: {
            handler() {
                this.loadPagination()
                this.first = this.pagination?.start
            },
            deep: true
        },
        comboColumnOptions: {
            handler() {
                this.loadColumnOptions()
            },
            deep: true
        }
    },
    data() {
        return {
            descriptor,
            mappedRows: [] as any,
            configuration: {} as any,
            columnOptions: [] as any[],
            dependentColumns: [] as any[],
            selectedRow: null as any,
            warningVisible: false,
            stopWarnings: [] as any[],
            lazyParams: {} as any,
            first: 0
        }
    },
    computed: {},
    methods: {
        mapRows() {
            this.mappedRows = this.rows.map((row) => {
                let newRow = { id: row.id }
                this.columns.forEach((column) => {
                    newRow[column.field] = { data: row[column.field], rowSpan: 1 }
                })
                return newRow
            })
        },
        checkForRowSpan(fromIndex, toIndex, rows, columns, columnIndex) {
            const column = columns[columnIndex]

            if (column.type !== 'merge') {
                return
            }

            let groupCount = 1
            let startIndex = fromIndex
            for (let i = fromIndex + 1; i <= toIndex; i++) {
                if (rows[i - 1][column.field].data === rows[i][column.field].data) {
                    rows[i][column.field].rowSpan = 0
                    groupCount++
                }
                if (rows[i - 1][column.field].data !== rows[i][column.field].data || i === toIndex) {
                    rows[startIndex][column.field].rowSpan = groupCount
                    if (i - 1 > startIndex && columnIndex < columns.length - 1) {
                        this.checkForRowSpan(startIndex, i === toIndex ? i : i - 1, rows, columns, columnIndex + 1)
                    }
                    startIndex = i
                    groupCount = 1
                }
            }
        },
        loadPagination() {
            this.lazyParams = { ...this.pagination } as any
        },
        onPage(event: any) {
            this.lazyParams = {
                paginationStart: event.first,
                paginationLimit: event.rows,
                paginationEnd: event.first + event.rows,
                size: this.lazyParams.size
            }
            this.$emit('pageChanged', this.lazyParams)
        },
        getFormatedDate(date: any, format: any) {
            return formatDateWithLocale(date, format)
        },
        getFormatedNumber(number: number, precision?: number, format?: any) {
            return formatNumberWithLocale(number, precision, format)
        },
        setRowEdited(row: any) {
            row.edited = true
            this.$emit('rowChanged', row)
        },
        onDropdownChange(payload: any) {
            const column = payload.column
            const row = payload.row

            row[column.field] = { data: row[column.field].data['column_1'], rowSpan: 1 }
            this.selectedRow = row

            if (column.hasDependencies) {
                this.dependentColumns = [] as any[]
                this.setDependentColumns(column)

                if (!this.stopWarnings[column.field]) {
                    this.dependentColumns.forEach((el: any) => {
                        if (this.selectedRow[el.field]) {
                            this.warningVisible = true
                        }
                    })
                } else {
                    this.clearDependentColumnsValues()
                }
            }

            row.edited = true
            this.$emit('rowChanged', row)
        },
        setDependentColumns(column: any) {
            let tempColumn = column

            if (!tempColumn.hasDependencies) {
                return
            }

            tempColumn.hasDependencies.forEach((el: any) => {
                this.dependentColumns.push(el)
                this.setDependentColumns(el)
            })
        },
        onWarningDialogClose(payload: any) {
            if (payload.stopWarnings) {
                this.stopWarnings[payload.columnField] = true
            }

            this.clearDependentColumnsValues()
            this.warningVisible = false
        },
        clearDependentColumnsValues() {
            this.dependentColumns.forEach((el: any) => (this.selectedRow[el.field] = { data: '', rowSpan: 1 }))
            this.selectedRow.edited = true
            this.$emit('rowChanged', this.selectedRow)
        },
        loadColumnOptions() {
            this.columnOptions = this.comboColumnOptions as any[]
        }
    }
})
</script>

<style lang="scss">
.pivot-table .pivot-header,
.pivot-table .pivot-data {
    border: 3px solid #5d8dbb93;
}
</style>