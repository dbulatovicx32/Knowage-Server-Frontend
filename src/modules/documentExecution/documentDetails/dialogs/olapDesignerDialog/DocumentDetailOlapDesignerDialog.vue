<template>
    <Dialog class="full-screen-dialog" :visible="visible" :modal="false" :closable="false" position="right" :base-z-index="1" :auto-z-index="true">
        <template #header>
            <Toolbar class="kn-toolbar kn-toolbar--primary p-col-12">
                <template #start>
                    <span>{{ $t('documentExecution.documentDetails.designerDialog.olapDesigner') }}</span>
                </template>
                <template #end>
                    <Button class="kn-button kn-button--primary olap-designer-toolbar-button" @click="closeDialog"> {{ $t('common.back') }}</Button>
                    <Button class="kn-button kn-button--primary olap-designer-toolbar-button" @click="start"> {{ $t('common.start') }}</Button>
                </template>
            </Toolbar>
        </template>
        <ProgressSpinner v-if="loading" class="kn-progress-spinner" />

        <div class="p-fluid p-formgrid p-grid p-m-4">
            <div class="p-field p-col-4">
                <span class="p-float-label">
                    <Dropdown id="type" v-model="type" class="kn-material-input" :options="descriptor.typeOptions" option-value="value" option-disabled="disabled">
                        <template #value="slotProps">
                            <div v-if="slotProps.value">
                                <span>{{ $t(`documentExecution.documentDetails.designerDialog.${slotProps.value}`) }}</span>
                            </div>
                        </template>
                        <template #option="slotProps">
                            <div>
                                <span>{{ $t(slotProps.option.label) }}</span>
                            </div>
                        </template>
                    </Dropdown>
                    <label for="type" class="kn-material-input-label"> {{ $t('documentExecution.documentDetails.designerDialog.templateType') }}</label>
                </span>
            </div>
        </div>
        <DocumentDetailXMLAForm v-if="type === 'xmla'" class="p-m-4" :xml-model="xmlModel"></DocumentDetailXMLAForm>
        <DocumentDetailMondrianForm v-else class="p-m-4" :sbi-execution-id="sbiExecutionId" :mondrian-model="mondrianModel" :mondrian-schemas="mondrianSchemas"></DocumentDetailMondrianForm>
    </Dialog>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { AxiosResponse } from 'axios'
import { iDocument, iMondrianSchema, iXMLATemplate, iMondrianTemplate } from '../../DocumentDetails'
import { mapState, mapActions } from 'pinia'
import Dialog from 'primevue/dialog'
import descriptor from './DocumentDetailOlapDesignerDialogDescriptor.json'
import DocumentDetailXMLAForm from './DocumentDetailXMLAForm.vue'
import DocumentDetailMondrianForm from './DocumentDetailMondrianForm.vue'
import Dropdown from 'primevue/dropdown'
import ProgressSpinner from 'primevue/progressspinner'
import mainStore from '../../../../../App.store'

export default defineComponent({
    name: 'document-detail-olap-designer-dialog',
    components: {
        Dialog,
        DocumentDetailXMLAForm,
        DocumentDetailMondrianForm,
        Dropdown,
        ProgressSpinner
    },
    props: {
        visible: { type: Boolean },
        selectedDocument: { type: Object as PropType<iDocument> }
    },
    emits: ['designerStarted', 'close'],
    data() {
        return {
            descriptor,
            document: null as iDocument | null,
            mondrianSchemas: [] as iMondrianSchema[],
            type: 'mondrian' as string,
            xmlModel: { address: '', parameters: [] } as iXMLATemplate,
            mondrianModel: {} as iMondrianTemplate,
            sbiExecutionId: '',
            loading: false
        }
    },
    computed: {
        ...mapState(mainStore, {
            user: 'user'
        })
    },
    watch: {
        selectedDocument() {
            this.loadDocument()
        }
    },
    async created() {
        this.sbiExecutionId = crypto.randomUUID()
        this.loadDocument()
    },
    methods: {
        ...mapActions(mainStore, ['setLoading']),
        async loadDocument() {
            this.document = this.selectedDocument ? { ...this.selectedDocument } : ({} as iDocument)
            this.sbiExecutionId = crypto.randomUUID()

            this.initialize()
            this.loadMondrianSchemaResources()
        },
        async initialize() {
            if (!this.document || !this.user) return

            const language = this.user.locale?.split('_')[0]
            const uniqueID = this.user.userUniqueIdentifier
            const country = this.user.locale?.split('_')[1]

            const hiddenFormData = new URLSearchParams()
            hiddenFormData.set('document', decodeURIComponent('' + this.document.id))
            hiddenFormData.set('user_id', decodeURIComponent(uniqueID))
            hiddenFormData.set('DOCUMENT_LABEL', decodeURIComponent(this.document.label))
            hiddenFormData.set('SBI_COUNTRY', decodeURIComponent(country))
            hiddenFormData.set('DOCUMENT_AUTHOR', decodeURIComponent(this.document.creationUser))
            hiddenFormData.set('DOCUMENT_DESCRIPTION', decodeURIComponent(this.document.description))
            hiddenFormData.set('SBI_LANGUAGE', decodeURIComponent(language))
            hiddenFormData.set('DOCUMENT_NAME', decodeURIComponent(this.document.name))
            hiddenFormData.set('NEW_SESSION', decodeURIComponent('TRUE'))
            hiddenFormData.set('SBI_EXECUTION_ID', decodeURIComponent(this.sbiExecutionId))
            hiddenFormData.set('EDIT_MODE', decodeURIComponent('null'))
            hiddenFormData.set('timereloadurl', decodeURIComponent('' + new Date().getTime()))
            hiddenFormData.set('ENGINE', 'knowageolapengine')

            this.setLoading(true)
            await this.$http
                .post(import.meta.env.VITE_KNOWAGEWHATIF_CONTEXT + `/restful-services/olap/startolap/edit`, hiddenFormData, {
                    headers: {
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9'
                    }
                })
                .then(() => {})
            this.setLoading(false)
        },
        async loadMondrianSchemaResources() {
            this.setLoading(true)
            await this.$http.get(import.meta.env.VITE_KNOWAGE_CONTEXT + `/restful-services/2.0/mondrianSchemasResource`).then((response: AxiosResponse<any>) => (this.mondrianSchemas = response.data))
            this.setLoading(false)
        },
        closeDialog() {
            this.$emit('close')
            this.type = 'xmla'
            this.xmlModel = { address: '', parameters: [] }
            this.mondrianModel = {} as iMondrianTemplate
        },
        async start() {
            const postData = this.type === 'xmla' ? { ...this.xmlModel } : { ...this.mondrianModel }
            this.setLoading(true)
            await this.$http
                .post(import.meta.env.VITE_KNOWAGEWHATIF_CONTEXT + `/restful-services/1.0/designer/cubes?SBI_EXECUTION_ID=${this.sbiExecutionId}`, postData)
                .then(() => {
                    this.$emit('designerStarted', {
                        ...this.selectedDocument,
                        sbiExecutionId: this.sbiExecutionId,
                        reference: this.mondrianModel?.mondrianSchema,
                        artifactId: this.mondrianModel.mondrianSchemaId
                    })
                })
                .catch(() => {})
            this.setLoading(false)
        }
    }
})
</script>

<style lang="scss">
.full-screen-dialog.p-dialog {
    max-height: 100%;
    height: 100vh;
    width: calc(100vw - #{var(--kn-mainmenu-width)});
    margin: 0;
    .p-dialog-content {
        padding: 0;
        margin: 0;
        flex: 1;
        overflow: hidden;
    }
    .p-dialog-header {
        padding: 0;
        margin: 0;
    }
}

.olap-designer-toolbar-button {
    font-size: 0.75rem;
}
</style>
