<template>
    <div class="p-d-flex p-flex-row p-ai-center">
        <InputSwitch v-if="model" v-model="model.enabled" class="p-mr-3" @click.stop="() => {}"></InputSwitch>
        <label class="kn-material-input-label">{{ title ? $t(title) : '' }}</label>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IWidget } from '@/modules/documentExecution/dashboard/Dashboard'
import InputSwitch from 'primevue/inputswitch'

export default defineComponent({
    name: 'pivot-table-settings-accordion-header',
    components: { InputSwitch },
    props: { widgetModel: { type: Object as PropType<IWidget>, required: true }, title: { type: String }, type: { type: String, required: true } },
    data() {
        return {
            model: null as any
        }
    },
    computed: {},
    watch: {
        type() {
            this.model = this.loadModel()
        }
    },
    created() {
        this.model = this.loadModel()
    },
    methods: {
        loadModel() {
            if (!this.widgetModel || !this.widgetModel.settings) return null
            switch (this.type) {
                case 'Conditions':
                    return this.widgetModel.settings.conditionalStyles
                case 'Title':
                    return this.widgetModel.settings.style.title
                case 'ColumnStyle':
                    return this.widgetModel.settings.style.columns
                case 'BackgroundColorStyle':
                    return this.widgetModel.settings.style.background
                case 'BordersStyle':
                    return this.widgetModel.settings.style.borders
                case 'PaddingStyle':
                    return this.widgetModel.settings.style.padding
                case 'ShadowsStyle':
                    return this.widgetModel.settings.style.shadows
                case 'Selection':
                    return this.widgetModel.settings.interactions.selection
                case 'CrossNavigation':
                    return this.widgetModel.settings.interactions.crossNavigation
                case 'Link':
                    return this.widgetModel.settings.interactions.link
                case 'FieldPicker':
                    return this.widgetModel.settings.configuration.fieldPicker
                case 'FieldPanel':
                    return this.widgetModel.settings.configuration.fieldPanel
                case 'Totals':
                    return this.widgetModel.settings.style.totals
                case 'SubTotals':
                    return this.widgetModel.settings.style.subTotals
                case 'CrossTabHeaders':
                    return this.widgetModel.settings.style.crossTabHeaders
                case 'VisualizationType':
                    return this.widgetModel.settings.visualization.visualizationTypes
                default:
                    return null
            }
        }
    }
})
</script>
