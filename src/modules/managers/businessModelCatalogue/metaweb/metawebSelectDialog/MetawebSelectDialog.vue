<template>
    <Dialog id="metaweb-select-dialog" class="metaweb-dialog remove-padding p-fluid kn-dialog--toolbar--primary" :content-style="metawebSelectDialogDescriptor.dialog.style" :visible="visible" :modal="false" :closable="false" position="right" :base-z-index="1" :auto-z-index="true">
        <template #header>
            <Toolbar class="kn-toolbar kn-toolbar--primary p-p-0 p-m-0 p-col-12">
                <template #start>
                    {{ businessModel?.name }}
                </template>
                <template #end>
                    <Button class="metaweb-select-dialog-button kn-button p-button-text p-m-2" :label="$t('common.close')" @click="closeDialog"></Button>
                    <Button class="metaweb-select-dialog-button kn-button p-button-text" :label="$t('common.continue')" @click="onContinue"></Button>
                </template>
            </Toolbar>
        </template>
        <ProgressBar v-if="loading" mode="indeterminate" class="kn-progress-bar" />

        <DataTable v-else v-model:filters="filters" :value="rows" class="p-datatable-sm kn-table p-ml-1" :scrollable="true" scroll-height="100%" :global-filter-fields="metawebSelectDialogDescriptor.globalFilterFields" @filter="onRowsFiltered">
            <template #empty>
                {{ $t('common.info.noDataFound') }}
            </template>

            <template #header>
                <div class="table-header p-d-flex">
                    <span class="p-input-icon-left p-mr-3 p-col-12">
                        <i class="pi pi-search" />
                        <InputText v-model="filters['global'].value" class="kn-material-input" :placeholder="$t('common.search')" data-test="search-input" />
                    </span>
                </div>
            </template>

            <Column field="value" :header="$t('metaweb.selectDialog.tableName')" style="flex: 5"></Column>
            <Column :header="$t('metaweb.physicalModel.title')">
                <template #header>
                    <Checkbox v-model="allPhysicalSelected" class="p-mr-2" :binary="true" @change="setAllChecked('physical')" />
                </template>
                <template #body="slotProps">
                    <Checkbox v-model="selected[slotProps.data.value].physical" :binary="true" @change="setChecked(slotProps.data, 'physical')" />
                </template>
            </Column>
            <Column :header="$t('metaweb.businessModel.title')">
                <template #header>
                    <Checkbox v-model="allBusinessSelected" class="p-mr-2" :binary="true" @change="setAllChecked('business')" />
                </template>
                <template #body="slotProps">
                    <Checkbox v-model="selected[slotProps.data.value].business" :binary="true" @change="setChecked(slotProps.data, 'business')" />
                </template>
            </Column>
        </DataTable>
    </Dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AxiosResponse } from 'axios'
import { iBusinessModel } from '../../BusinessModelCatalogue'
import { filterDefault } from '@/helpers/commons/filterHelper'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import metawebSelectDialogDescriptor from '@/modules/managers/businessModelCatalogue/metaweb/metawebSelectDialog/MetawebSelectDialogDescriptor.json'
import mainStore from '../../../../../App.store'

export default defineComponent({
    name: 'metaweb-select-dialog',
    components: { Checkbox, Column, DataTable, Dialog },
    props: { visible: { type: Boolean }, selectedBusinessModel: { type: Object as PropType<iBusinessModel> } },
    emits: ['close', 'metaSelected'],
    setup() {
        const store = mainStore()
        return { store }
    },
    data() {
        return {
            metawebSelectDialogDescriptor,
            businessModel: null as iBusinessModel | null,
            datasourceStructure: null as any,
            rows: [] as { value: string }[],
            selected: {} as any,
            allPhysicalSelected: false,
            allBusinessSelected: false,
            filters: {
                global: [filterDefault]
            } as Object,
            filteredRows: [] as { value: string }[],
            loading: false
        }
    },
    watch: {
        async businessModel() {
            await this.loadData()
        },
        async visible(value: boolean) {
            if (value) {
                this.loading = true
                await this.loadDatasourceStructure()
                this.loadRows()
                this.loading = false
            }
        }
    },
    async created() {
        await this.loadData()
    },
    methods: {
        async loadData() {
            this.loading = true
            this.loadBusinessModel()
            await this.loadDatasourceStructure()
            this.loadRows()
            this.loading = false
        },
        loadBusinessModel() {
            this.businessModel = this.selectedBusinessModel as iBusinessModel
        },
        async loadDatasourceStructure() {
            if (this.businessModel?.dataSourceId) {
                const url = `/restful-services/2.0/datasources/structure/${this.businessModel.dataSourceId}?`
                const urlParams = {} as any
                if (this.businessModel.tablePrefixLike) urlParams.tablePrefixLike = this.businessModel.tablePrefixLike
                if (this.businessModel.tablePrefixNotLike) urlParams.tablePrefixNotLike = this.businessModel.tablePrefixNotLike
                await this.$http.get(import.meta.env.VITE_KNOWAGE_CONTEXT + url, { params: urlParams }).then((response: AxiosResponse<any>) => (this.datasourceStructure = response.data))
            }
        },
        loadRows() {
            this.rows = []
            if (this.datasourceStructure) {
                Object.keys(this.datasourceStructure).forEach((key: string) => {
                    this.rows.push({ value: key })
                    this.selected[key] = { physical: false, business: false }
                })
            }
        },
        setChecked(row: { value: string }, typeChecked: string) {
            if (typeChecked === 'business' && this.selected[row.value].business) {
                this.selected[row.value].physical = true
            } else if (typeChecked === 'physical' && !this.selected[row.value].physical) {
                this.selected[row.value].business = false
            }
        },
        setAllChecked(typeChecked: string) {
            Object.keys(this.selected).forEach((key: string) => {
                if (this.checkIfTheSelectedIsInFilteredRows(key)) {
                    if (typeChecked === 'business') {
                        this.selected[key].business = this.allBusinessSelected
                        if (this.allBusinessSelected) {
                            this.selected[key].physical = true
                            this.allPhysicalSelected = true
                        }
                    } else {
                        this.selected[key].physical = this.allPhysicalSelected
                        if (!this.allPhysicalSelected) {
                            this.selected[key].business = false
                            this.allBusinessSelected = false
                        }
                    }
                }
            })
        },
        checkIfTheSelectedIsInFilteredRows(key: string) {
            const index = this.filteredRows.findIndex((el: { value: string }) => el.value === key)
            return index !== -1
        },
        closeDialog() {
            this.$emit('close')
            this.filters['global'].value = ''
            this.selected = {}
            this.allPhysicalSelected = false
            this.allBusinessSelected = false
        },
        async onContinue() {
            if (!this.checkIfPhysicalModelIsSelected()) {
                this.store.setError({
                    title: this.$t('common.error.generic'),
                    msg: this.$t('metaweb.selectDialog.noPhysicalModelsSelectedError')
                })
                return
            }

            await this.sendCheckedMetaweb()
        },
        async sendCheckedMetaweb() {
            this.loading = true
            const physicalModels = [] as string[]
            const businessModels = [] as string[]

            this.prepareDataForPost(physicalModels, businessModels)

            await this.$http
                .post(import.meta.env.VITE_KNOWAGEMETA_CONTEXT + `/restful-services/1.0/metaWeb/create`, { datasourceId: '' + this.businessModel?.dataSourceId, physicalModels: physicalModels, businessModels: businessModels, modelName: this.businessModel?.name })
                .then((response: AxiosResponse<any>) => {
                    this.$emit('metaSelected', response.data)
                })
                .catch(() => {})

            this.loading = false
        },
        prepareDataForPost(physicalModels, businessModels) {
            Object.keys(this.selected).forEach((key: string) => {
                if (this.selected[key].physical) physicalModels.push(key)
                if (this.selected[key].business) businessModels.push(key)
            })
        },
        checkIfPhysicalModelIsSelected() {
            let isSelected = false
            const keys = Object.keys(this.selected)

            for (let i = 0; i < keys.length; i++) {
                if (this.selected[keys[i]].physical) {
                    isSelected = true
                    break
                }
            }

            return isSelected
        },
        onRowsFiltered(event: any) {
            this.filteredRows = event.filteredValue
            this.allPhysicalSelected = true
            this.allBusinessSelected = true

            if (this.filteredRows.length === 0) {
                this.allPhysicalSelected = false
                this.allBusinessSelected = false
            }

            for (let i = 0; i < this.filteredRows.length; i++) {
                if (!this.selected[this.filteredRows[i].value].physical) {
                    this.allPhysicalSelected = false
                }
                if (!this.selected[this.filteredRows[i].value].business) {
                    this.allBusinessSelected = false
                }
            }
        }
    }
})
</script>

<style lang="scss">
.full-screen-dialog.p-dialog {
    max-height: 100%;
    height: 100vh;
    width: calc(100vw - var(--kn-mainmenu-width));
    margin: 0;
}
.full-screen-dialog.p-dialog .p-dialog-content {
    padding: 0;
    margin: 0;
}
#metaweb-select-dialog .p-toolbar-group-right {
    height: 100%;
}

.metaweb-select-dialog-button {
    font-size: 0.8rem;
}
</style>
