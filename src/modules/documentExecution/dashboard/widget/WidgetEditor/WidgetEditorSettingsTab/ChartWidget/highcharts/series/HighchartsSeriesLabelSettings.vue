<template>
    <div v-if="model" class="p-grid p-jc-center p-ai-center p-p-4">
        <div v-for="(serieSetting, index) in seriesSettings" :key="index" class="dynamic-form-item p-grid p-col-12 p-ai-center">
            <div class="p-col-12 p-md-6 p-d-flex p-flex-column p-p-2">
                <label class="kn-material-input-label"> {{ $t('dashboard.widgetEditor.series.title') }}</label>
                <Dropdown v-if="index === 0 && allSeriesOptionEnabled" v-model="serieSetting.names[0]" class="kn-material-input" :options="descriptor.allSerieOption" option-value="value" option-label="label" :disabled="true"> </Dropdown>
                <HighchartsSeriesMultiselect v-else :value="serieSetting.names" :available-series-options="availableSeriesOptions" :disabled="!allSeriesOptionEnabled" @change="onSeriesSelected($event, serieSetting)"> </HighchartsSeriesMultiselect>
            </div>

            <div v-if="labelOptionsVisible" class="p-col-5 p-pt-4 p-px-4">
                <InputSwitch v-model="serieSetting.label.enabled" @change="modelChanged"></InputSwitch>
                <label class="kn-material-input-label p-m-3">{{ $t('dashboard.widgetEditor.showLabel') }}</label>
            </div>

            <div v-if="serieColorPickerVisible" class="p-col-2 p-pt-4 p-px-4">
                <InputSwitch v-model="serieSetting.serieColorEnabled" @change="modelChanged"></InputSwitch>
                <label class="kn-material-input-label p-m-3">{{ $t('dashboard.widgetEditor.series.enableColor') }}</label>
            </div>

            <div v-if="serieColorPickerVisible" class="p-col-3 p-px-2 p-pt-4">
                <WidgetEditorColorPicker :initial-value="serieSetting.serieColor" :label="$t('common.color')" :disabled="!serieSetting.serieColorEnabled" @change="onSelectionColorChanged($event, serieSetting)"></WidgetEditorColorPicker>
            </div>

            <div v-if="allSeriesOptionEnabled" class="p-col-1 p-d-flex p-flex-column p-jc-center p-ai-center p-pl-2">
                <i :class="[index === 0 ? 'pi pi-plus-circle' : 'pi pi-trash']" class="kn-cursor-pointer p-ml-2 p-mt-4" @click="index === 0 ? addSerieSetting() : removeSerieSetting(index)"></i>
            </div>
            <div v-if="styleToolbarVisible" class="p-col-12 p-pt-4 p-pb-2">
                <WidgetEditorStyleToolbar :options="descriptor.noDataToolbarStyleOptions" :prop-model="toolbarModels[index]" :disabled="!serieSetting.label.enabled" @change="onStyleToolbarChange($event, index)"> </WidgetEditorStyleToolbar>
            </div>

            <div v-if="formattingSectionAvailable" class="p-col-12 p-md-6 p-lg-2 p-d-flex p-flex-column kn-flex">
                <label class="kn-material-input-label p-mr-2">{{ $t('dashboard.widgetEditor.prefix') }}</label>
                <InputText v-model="serieSetting.label.prefix" class="kn-material-input p-inputtext-sm" :disabled="!serieSetting.label.enabled" @change="modelChanged" />
            </div>
            <div v-if="formattingSectionAvailable" class="p-col-12 p-md-6 p-lg-2 p-d-flex p-flex-column kn-flex">
                <label class="kn-material-input-label p-mr-2">{{ $t('dashboard.widgetEditor.suffix') }}</label>
                <InputText v-model="serieSetting.label.suffix" class="kn-material-input p-inputtext-sm" :disabled="!serieSetting.label.enabled" @change="modelChanged" />
            </div>
            <div v-if="formattingSectionAvailable" class="p-col-12 p-md-6 p-lg-2 p-d-flex p-flex-column kn-flex">
                <label class="kn-material-input-label p-mr-2">{{ $t('dashboard.widgetEditor.precision') }}</label>
                <InputNumber v-model="serieSetting.label.precision" class="kn-material-input p-inputtext-sm" :disabled="!serieSetting.label.enabled" @blur="modelChanged" />
            </div>
            <div v-if="scaleVisible" class="p-col-6 p-d-flex p-flex-column kn-flex p-m-2">
                <label class="kn-material-input-label p-mr-2">{{ $t('dashboard.widgetEditor.series.scale') }}</label>
                <div class="p-d-flex p-flex-row p-ai-center">
                    <Dropdown v-model="serieSetting.label.scale" class="kn-material-input" :options="descriptor.scaleOptions" :disabled="!serieSetting.label.enabled" @change="modelChanged"> </Dropdown>
                    <i v-tooltip.top="$t('dashboard.widgetEditor.series.scaleHint')" class="pi pi-question-circle kn-cursor-pointer p-ml-2"></i>
                </div>
            </div>

            <div v-if="percentageAvailable" class="p-col-12 p-md-4 p-lg-2 p-pt-4 p-px-4 p-d-flex p-flex-column">
                <label class="kn-material-input-label">{{ $t('dashboard.widgetEditor.percentage') }}</label>
                <InputSwitch v-model="serieSetting.label.percentage" :disabled="!serieSetting.label.enabled" @change="modelChanged"></InputSwitch>
            </div>

            <div v-if="absoluteVisible" class="p-col-12 p-md-4 p-lg-2 p-pt-4 p-px-4 p-d-flex p-flex-column">
                <label class="kn-material-input-label">{{ $t('dashboard.widgetEditor.absolute') }}</label>
                <InputSwitch v-model="serieSetting.label.absolute" :disabled="!serieSetting.label.enabled" @change="modelChanged"></InputSwitch>
            </div>

            <div v-if="advancedSectionAvailable" class="p-col-12 p-py-4">
                <div class="p-d-flex p-flex-row p-jc-center">
                    <label class="kn-material-input-label kn-cursor-pointer" @click="advancedVisible[index] = !advancedVisible[index]">{{ $t('common.advanced') }}<i :class="advancedVisible[index] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'" class="p-ml-2"></i></label>
                    <i class=""></i>
                </div>
                <Transition>
                    <div v-if="advancedVisible[index]" class="p-d-flex p-flex-column">
                        <HighchartsGaugeSerieAdvancedSettings :serie-settings-prop="serieSetting" :disabled="!serieSetting.label.enabled" @modelChanged="modelChanged"></HighchartsGaugeSerieAdvancedSettings>
                    </div>
                </Transition>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IWidget, IWidgetColumn, IWidgetStyleToolbarModel } from '../../../../../../Dashboard'
import { emitter } from '@/modules/documentExecution/dashboard/DashboardHelpers'
import { IHighchartsChartModel, IHighchartsSeriesLabelsSetting } from '@/modules/documentExecution/dashboard/interfaces/highcharts/DashboardHighchartsWidget'
import { getTranslatedLabel } from '@/helpers/commons/dropdownHelper'
import descriptor from '../HighchartsWidgetSettingsDescriptor.json'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import HighchartsSeriesMultiselect from '../common/HighchartsSeriesMultiselect.vue'
import WidgetEditorStyleToolbar from '../../../common/styleToolbar/WidgetEditorStyleToolbar.vue'
import HighchartsGaugeSerieAdvancedSettings from './HighchartsGaugeSerieAdvancedSettings.vue'
import * as highchartsDefaultValues from '../../../../helpers/chartWidget/highcharts/HighchartsDefaultValues'
import WidgetEditorColorPicker from '../../../common/WidgetEditorColorPicker.vue'

export default defineComponent({
    name: 'hihgcharts-series-label-settings',
    components: {
        Dropdown,
        InputNumber,
        InputSwitch,
        HighchartsSeriesMultiselect,
        WidgetEditorStyleToolbar,
        HighchartsGaugeSerieAdvancedSettings,
        WidgetEditorColorPicker
    },
    props: { propWidgetModel: { type: Object as PropType<IWidget>, required: true } },
    data() {
        return {
            descriptor,
            widgetModel: {} as IWidget,
            model: null as IHighchartsChartModel | null,
            seriesSettings: [] as IHighchartsSeriesLabelsSetting[],
            toolbarModels: [] as {
                'font-family': string
                'font-size': string
                'font-weight': string
                color: string
                'background-color': string
            }[],
            availableSeriesOptions: [] as string[],
            advancedVisible: {},
            getTranslatedLabel
        }
    },
    computed: {
        allSeriesOptionEnabled() {
            return this.model && !['pie', 'solidgauge', 'sunburst', 'treemap', 'dependencywheel', 'sankey', 'pictorial'].includes(this.model.chart.type)
        },
        formattingSectionAvailable() {
            return this.model && ['pie', 'gauge', 'solidgauge', 'radar', 'area', 'bar', 'column', 'line', 'scatter', 'bubble', 'sunburst', 'treemap', 'dependencywheel', 'sankey', 'pictorial'].includes(this.model.chart.type)
        },
        scaleVisible() {
            return this.model && ['pie', 'gauge', 'solidgauge', 'radar', 'area', 'bar', 'column', 'line', 'scatter', 'bubble', 'sunburst', 'treemap'].includes(this.model.chart.type)
        },
        percentageAvailable() {
            return this.model && ['pie', 'gauge', 'solidgauge'].includes(this.model.chart.type)
        },
        absoluteVisible() {
            return this.model && ['pie', 'gauge', 'solidgauge', 'radar', 'area', 'bar', 'column', 'line', 'scatter', 'bubble', 'sunburst', 'treemap'].includes(this.model.chart.type)
        },
        advancedSectionAvailable() {
            return this.model?.chart.type === 'gauge'
        },
        styleToolbarVisible() {
            return this.model && ['pie', 'gauge', 'radar', 'area', 'bar', 'column', 'line', 'scatter', 'bubble', 'sunburst', 'treemap', 'dependencywheel', 'sankey', 'pictorial'].includes(this.model.chart.type)
        },
        serieColorPickerVisible() {
            return this.model?.chart.type === 'activitygauge'
        },
        labelOptionsVisible() {
            return this.model && ['pie', 'gauge', 'solidgauge', 'radar', 'area', 'bar', 'column', 'line', 'scatter', 'bubble', 'sunburst', 'treemap', 'dependencywheel', 'sankey', 'pictorial'].includes(this.model.chart.type)
        }
    },
    watch: {
        propWidgetModel() {
            this.loadWidgetModel()
        }
    },
    created() {
        this.setEventListeners()
        this.loadWidgetModel()
        this.loadModel()
    },
    mounted() {
        this.loadWidgetModel()
        this.loadModel()
    },
    unmounted() {
        this.removeEventListeners()
    },
    methods: {
        loadWidgetModel() {
            this.widgetModel = this.propWidgetModel
        },
        setEventListeners() {
            emitter.on('seriesAdded', this.loadModel)
            emitter.on('seriesRemoved', this.loadModel)
            emitter.on('chartTypeChanged', this.onChartTypeChanged)
        },
        removeEventListeners() {
            emitter.off('seriesAdded', this.loadModel)
            emitter.off('seriesRemoved', this.loadModel)
            emitter.off('chartTypeChanged', this.onChartTypeChanged)
        },
        loadModel() {
            this.seriesSettings = []
            this.model = this.widgetModel.settings.chartModel ? this.widgetModel.settings.chartModel.model : null
            if (this.widgetModel.settings?.series?.seriesSettings) {
                this.widgetModel.settings.series.seriesSettings.forEach((seriesSettings: IHighchartsSeriesLabelsSetting) => {
                    if (this.model?.chart.type !== 'gauge') {
                        ;['dial', 'pivot'].forEach((property: string) => delete seriesSettings[property])
                    }
                    this.seriesSettings.push(seriesSettings)
                })
            }
            this.loadToolbarModels()
            this.loadSeriesOptions()
            this.removeSeriesFromAvailableOptions()
            this.removeAllSerieSettingsFromModel()
            if (this.seriesSettings.length === 0) this.addFirstSeriesSetting()
            if (!this.allSeriesOptionEnabled) this.seriesSettings.splice(1)
        },
        removeAllSerieSettingsFromModel() {
            if (this.seriesSettings[0]?.names[0] && this.seriesSettings[0].names[0] === 'all' && !this.allSeriesOptionEnabled) {
                this.seriesSettings.splice(0, 1)
                this.widgetModel.settings.series.seriesSettings.splice(0, 1)
            }
        },
        loadToolbarModels() {
            this.seriesSettings.forEach((serieSetting: IHighchartsSeriesLabelsSetting) => {
                this.toolbarModels.push({
                    'font-family': serieSetting.label.style.fontFamily,
                    'font-size': serieSetting.label.style.fontSize,
                    'font-weight': serieSetting.label.style.fontWeight,
                    color: serieSetting.label.style.color,
                    'background-color': serieSetting.label.backgroundColor
                })
            })
        },
        loadSeriesOptions() {
            this.availableSeriesOptions = []
            if (!this.widgetModel) return
            this.widgetModel.columns.forEach((column: IWidgetColumn) => {
                if (column.fieldType === 'MEASURE' && (!column.axis || column.axis === 'Y')) this.availableSeriesOptions.push(column.columnName)
            })
        },
        addFirstSeriesSetting() {
            if (!this.model) return
            this.seriesSettings = []
            if (this.availableSeriesOptions.length >= 1) {
                const name = this.allSeriesOptionEnabled ? 'all' : this.availableSeriesOptions[0]
                const formattedSeriesSettings = {
                    names: [name],
                    label: { ...highchartsDefaultValues.getDefaultSerieLabelSettings(), enabled: true }
                } as IHighchartsSeriesLabelsSetting
                if (this.model.chart.type === 'gauge') {
                    formattedSeriesSettings.dial = highchartsDefaultValues.getDefaultSerieDialSettings()
                    formattedSeriesSettings.pivot = highchartsDefaultValues.getDefaultSeriePivotSettings()
                }
                this.seriesSettings.push(formattedSeriesSettings)
                this.widgetModel.settings.series.seriesSettings.push(formattedSeriesSettings)
            }
        },
        removeSeriesFromAvailableOptions() {
            for (let i = 1; i < this.widgetModel.settings.series.seriesSettings?.length; i++) {
                for (let j = 0; j < this.widgetModel.settings.series.seriesSettings[i].names.length; j++) {
                    this.removeSerieFromAvailableOptions(this.widgetModel.settings.series.seriesSettings[i].names[j])
                }
            }
        },
        removeSerieFromAvailableOptions(seriesName: string) {
            const index = this.availableSeriesOptions.findIndex((tempSerieName: string) => tempSerieName === seriesName)
            if (index !== -1) this.availableSeriesOptions.splice(index, 1)
        },
        modelChanged() {
            emitter.emit('refreshChart', this.widgetModel.id)
        },
        onSeriesSelected(event: any, serieSetting: IHighchartsSeriesLabelsSetting) {
            const intersection = serieSetting.names.filter((el: string) => !event.value.includes(el))
            serieSetting.names = event.value
            intersection.length > 0 ? this.onSeriesRemovedFromMultiselect(intersection) : this.onSeriesAddedFromMultiselect(serieSetting)
            this.modelChanged()
        },
        onSeriesAddedFromMultiselect(serieSetting: IHighchartsSeriesLabelsSetting) {
            serieSetting.names.forEach((serieName: string) => {
                const index = this.availableSeriesOptions.findIndex((tempSerieName: string) => tempSerieName === serieName)
                if (index !== -1) this.availableSeriesOptions.splice(index, 1)
            })
        },
        onSeriesRemovedFromMultiselect(intersection: string[]) {
            intersection.forEach((serieName: string) => this.availableSeriesOptions.push(serieName))
        },
        addSerieSetting() {
            const newSerieSetting = {
                names: [],
                label: highchartsDefaultValues.getDefaultSerieLabelSettings()
            } as IHighchartsSeriesLabelsSetting
            if (this.model?.chart.type === 'gauge') {
                newSerieSetting.dial = highchartsDefaultValues.getDefaultSerieDialSettings()
                newSerieSetting.pivot = highchartsDefaultValues.getDefaultSeriePivotSettings()
            }
            this.seriesSettings.push(newSerieSetting)
            this.widgetModel.settings.series.seriesSettings.push(newSerieSetting)
            this.toolbarModels.push({
                'font-family': '',
                'font-size': '',
                'font-weight': '',
                color: '',
                'background-color': 'rgba(194,194,194, 1)'
            })
        },
        removeSerieSetting(index: number) {
            this.seriesSettings[index].names.forEach((serieName: string) => this.availableSeriesOptions.push(serieName))
            this.advancedVisible[index] = false
            this.widgetModel.settings.series.seriesSettings.splice(index, 1)
            this.seriesSettings.splice(index, 1)
            this.toolbarModels.splice(index, 1)
            this.modelChanged()
        },
        onStyleToolbarChange(model: IWidgetStyleToolbarModel, index: number) {
            if (!this.model || !this.toolbarModels[index]) return
            this.toolbarModels[index] = {
                'font-family': model['font-family'] ?? '',
                'font-size': model['font-size'] ?? '14px',
                'font-weight': model['font-weight'] ?? '',
                color: model.color ?? '',
                'background-color': model['background-color'] ?? ''
            }
            ;(this.seriesSettings[index].label.backgroundColor = this.toolbarModels[index]['background-color'] ?? ''),
                (this.seriesSettings[index].label.style = {
                    color: this.toolbarModels[index].color ?? '',
                    fontSize: this.toolbarModels[index]['font-size'] ?? '14px',
                    fontFamily: this.toolbarModels[index]['font-family'] ?? '',
                    fontWeight: this.toolbarModels[index]['font-weight'] ?? ''
                })
            this.modelChanged()
        },
        onSelectionColorChanged(event: string | null, serieSetting: IHighchartsSeriesLabelsSetting) {
            if (!event) return
            serieSetting.serieColor = event
            this.modelChanged()
        },
        onChartTypeChanged() {
            this.widgetModel.settings.series.seriesSettings = []
            this.loadModel()
        }
    }
})
</script>
