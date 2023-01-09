<template>
    <div v-if="backgroundStyleModel" class="p-grid p-jc-center p-ai-center kn-flex p-p-4">
        <div class="p-col-12 p-d-flex p-flex-row p-ai-center p-mb-4">
            <div class="kn-flex p-m-2">
                <InputSwitch v-model="backgroundStyleModel.enabled" @change="backgroundColorStyleChanged"></InputSwitch>
                <label class="kn-material-input-label p-ml-2">{{ $t('common.enable') }}</label>
            </div>
        </div>

        <div class="p-col-12">
            <WidgetEditorColorPicker :initialValue="backgroundStyleModel.properties['background-color']" :label="$t('dashboard.widgetEditor.iconTooltips.backgroundColor')" :disabled="backgroundStyleDisabled" @change="onBackroundColorChanged"></WidgetEditorColorPicker>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { IWidget, IWidgetBackgroundStyle } from '@/modules/documentExecution/Dashboard/Dashboard'
import { emitter } from '../../../../../DashboardHelpers'
import { getTranslatedLabel } from '@/helpers/commons/dropdownHelper'
import descriptor from '../../WidgetEditorSettingsTabDescriptor.json'
import InputSwitch from 'primevue/inputswitch'
import WidgetEditorColorPicker from '../WidgetEditorColorPicker.vue'

export default defineComponent({
    name: 'widget-background-color-style',
    components: { InputSwitch, WidgetEditorColorPicker },
    props: {
        widgetModel: { type: Object as PropType<IWidget>, required: true }
    },
    data() {
        return {
            descriptor,
            backgroundStyleModel: null as IWidgetBackgroundStyle | null,
            widgetType: '' as string,
            getTranslatedLabel
        }
    },
    computed: {
        backgroundStyleDisabled() {
            return !this.backgroundStyleModel || !this.backgroundStyleModel.enabled
        }
    },
    created() {
        this.loadBackgroundColor()
    },
    methods: {
        loadBackgroundColor() {
            if (!this.widgetModel) return
            this.widgetType = this.widgetModel.type
            if (this.widgetModel.settings?.style?.background) this.backgroundStyleModel = this.widgetModel.settings.style.background
        },
        backgroundColorStyleChanged() {
            emitter.emit('backgroundColorStyleChanged', this.backgroundStyleModel)
            switch (this.widgetType) {
                case 'selector':
                    emitter.emit('refreshSelector', this.widgetModel.id)
                    break
                case 'selection':
                    emitter.emit('refreshSelection', this.widgetModel.id)
                    break
                case 'selection':
                    emitter.emit('refreshSelection', this.widgetModel.id)
            }
        },
        onBackroundColorChanged(event: string | null) {
            if (!event || !this.backgroundStyleModel) return
            this.backgroundStyleModel.properties['background-color'] = event
            this.backgroundColorStyleChanged()
        }
    }
})
</script>