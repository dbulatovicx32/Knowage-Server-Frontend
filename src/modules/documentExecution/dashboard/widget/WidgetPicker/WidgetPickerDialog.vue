<template>
    <Dialog class="dialog-no-padding" :visible="visible" :style="descriptor.style.dialog" :modal="true" :closable="false">
        <template #header>
            <Toolbar class="kn-toolbar kn-toolbar--primary kn-width-full">
                <template #start>
                    {{ $t('dashboard.widgetEditor.addWidget') }}
                </template>
                <template #end>
                    <Button icon="pi pi-times" class="p-button-text p-button-rounded p-button-plain p-mx-2" @click="$emit('closeWidgetPicker')" />
                </template>
            </Toolbar>
        </template>

        <div id="widget-card-container" class="p-grid p-jc-center p-m-2">
            <WidgetCard v-for="(widget, index) in widgetTypes" :key="index" :widget="widget" @click="openWidgetEditor(widget)" />
        </div>
    </Dialog>
</template>

<script lang="ts">
/**
 * ! this component is in charge of opening the correct widget editor and containing all the cards
 */
import { defineComponent } from 'vue'
import { IWidgetPickerType } from '../../Dashboard'
import { mapState } from 'pinia'
import appStore from '@/App.store'
import Dialog from 'primevue/dialog'
import WidgetCard from './WidgetPickerCard.vue'
import descriptor from './WidgetPickerDescriptor.json'

export default defineComponent({
    name: 'widget-picker-dialog',
    components: { Dialog, WidgetCard },
    inject: [],
    props: { visible: { type: Boolean } },
    emits: ['closeWidgetPicker', 'openNewWidgetEditor'],
    data() {
        return {
            descriptor,
            widgetTypes: [] as IWidgetPickerType[]
        }
    },
    computed: {
        ...mapState(appStore, {
            isEnterprise: 'isEnterprise',
            user: 'user'
        })
    },
    created() {
        this.widgetTypes = descriptor.widgets.filter((item: any) => {
            if (item.functionality) {
                return this.user.functionalities.includes(item.functionality)
            }
            return item
        })
    },
    methods: {
        openWidgetEditor(widget) {
            // TODO widgetChange
            if (widget.type === 'chart') widget.type = this.isEnterprise ? 'highcharts' : 'chartJS'
            if (widget.type === 'static-pivot-table') widget.type = this.isEnterprise ? 'ce-pivot-table' : 'ce-pivot-table'
            this.$emit('openNewWidgetEditor', widget)
        }
    }
})
</script>
<style lang="scss">
.dialog-no-padding.p-dialog .p-dialog-header,
.dialog-no-padding.p-dialog .p-dialog-content {
    padding: 0;
    margin: 0;
}
</style>
