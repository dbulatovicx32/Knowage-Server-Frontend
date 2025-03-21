<template>
    <div class="managerDetail">
        <Dialog class="kn-dialog--toolbar--primary knMetadataDialog" :visible="visibility" footer="footer" :header="$t('managers.resourceManagement.metadata.dialog.title')" :closable="false" modal @id="loadMetadata">
            <div class="p-grid p-m-3 p-fluid p-ai-start">
                <span class="p-float-label p-col-4">
                    <InputText id="name" v-model="metadata.name" class="kn-material-input" type="text" @change="setDirty" />
                    <label class="kn-material-input-label" for="name">{{ $t('common.name') }}</label>
                </span>

                <span class="p-float-label p-col-2">
                    <InputText id="name" v-model="metadata.version" class="kn-material-input" type="text" @change="setDirty" />
                    <label class="kn-material-input-label" for="name">{{ $t(descriptor.metadata.version.label) }}</label>
                </span>

                <span class="p-float-label p-col-3">
                    <Dropdown id="typeOfAnalytics" v-model="metadata.typeOfAnalytics" class="kn-material-input" :options="translatedOptions" option-label="name" option-value="value" @change="setDirty"> </Dropdown>
                    <label class="kn-material-input-label" for="outputType">{{ $t(descriptor.metadata.typeOfAnalytics.label) }}</label>
                </span>
                <span class="p-col-3 p-d-flex p-jc-end">
                    <label class="kn-material-input-label p-mr-2" for="name">{{ $t(descriptor.metadata.openSource.label) }}</label>
                    <InputSwitch v-model="metadata.openSource" @change="setDirty" />
                </span>
                <span class="p-float-label p-col-8 descriptionTextArea">
                    <Textarea id="description" v-model="metadata.description" class="kn-material-input" style="resize: none" rows="5" @change="setDirty" />
                    <label class="kn-material-input-label" for="description">{{ $t('common.description') }}</label>
                </span>
                <span class="p-col-4 kn-height-full">
                    <span class="p-d-flex p-jc-end p-ai-center">
                        <input id="inputImage" type="file" accept="image/png, image/jpeg" data-test="upload" @change="uploadFile" />
                        <label v-tooltip.bottom="$t('common.upload')" for="inputImage">
                            <i class="p-button-text p-button-sm p-button-rounded p-button-plain p-p-0 pi pi-upload" />
                        </label>
                        <i v-if="metadata.image" v-tooltip.bottom="$t('common.delete')" class="p-button-text p-button-sm p-button-rounded p-button-plain p-p-0 pi pi-times p-ml-2" @click="removeImage" />
                    </span>
                    <div class="imageContainer p-d-flex p-jc-center p-ai-center">
                        <i v-if="!metadata.image" class="far fa-image fa-5x icon" />
                        <img v-if="metadata.image" :src="metadata.image" height="100%" class="kn-no-select" />
                    </div>
                </span>
            </div>

            <Accordion class="p-col-12">
                <AccordionTab :header="$t(descriptor.metadata.accuracyAndPerformance.label)">
                    <Textarea id="accuracyAndPerformance" v-model="metadata.accuracyAndPerformance" class="kn-material-input metadataTextArea" style="resize: none" rows="3" @change="setDirty" />
                </AccordionTab>
                <AccordionTab :header="$t(descriptor.metadata.usageOfTheModel.label)">
                    <Textarea id="usageOfTheModel" v-model="metadata.usageOfTheModel" class="kn-material-input metadataTextArea" style="resize: none" rows="3" @change="setDirty" />
                </AccordionTab>
                <AccordionTab :header="$t(descriptor.metadata.formatOfData.label)">
                    <Textarea id="formatOfData" v-model="metadata.formatOfData" class="kn-material-input metadataTextArea" style="resize: none" rows="3" @change="setDirty" />
                </AccordionTab>
            </Accordion>

            <template #footer>
                <Button class="kn-button kn-button--secondary" @click="closeDialog">{{ $t('common.close') }} </Button>
                <Button class="kn-button kn-button--primary" :disabled="!dirty" data-test="save-button" @click="saveMetadata"> {{ $t('common.save') }}</Button>
            </template>
        </Dialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { AxiosResponse } from 'axios'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import { mapState } from 'pinia'
import InputSwitch from 'primevue/inputswitch'
import resourceManagementDescriptor from './ResourceManagementDescriptor.json'
import Textarea from 'primevue/textarea'

import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import { iModelMetadataTemplate } from './ResourceManagement'
import mainStore from '../../../App.store'

export default defineComponent({
    name: 'metadata-dialog',
    components: { Dialog, Dropdown, InputSwitch, Accordion, AccordionTab, Textarea },
    props: {
        id: String,
        visibility: Boolean
    },
    emits: ['update:visibility'],
    setup() {
        const store = mainStore()
        return { store }
    },
    data() {
        return {
            dirty: false,
            loading: true,
            metadata: {} as iModelMetadataTemplate,
            checked: false,
            descriptor: resourceManagementDescriptor,
            translatedOptions: Array<any>()
        }
    },
    created() {
        this.loadMetadata()
        const notTranslatedOptions = this.descriptor.metadata.typeOfAnalytics.options
        for (const idx in notTranslatedOptions) {
            const translatedOption = notTranslatedOptions[idx]
            translatedOption.name = this.$t(translatedOption.name)
            this.translatedOptions.push(translatedOption)
        }
    },
    methods: {
        closeDialog() {
            this.$emit('update:visibility', false)
        },
        loadMetadata() {
            this.loading = true

            if (this.id) {
                this.$http
                    .get(import.meta.env.VITE_KNOWAGE_API_CONTEXT + `/api/2.0/resources/files/metadata?key=` + this.id)
                    .then((response: AxiosResponse<any>) => {
                        this.metadata = response.data
                    })
                    .catch(() => {
                        this.store.setError({
                            title: this.$t('common.toast.metadata'),
                            msg: this.$t('common.toast.metadataLoadingFailed')
                        })
                    })
            }
            this.loading = false
        },
        removeImage() {
            this.metadata.image = ''
            this.setDirty()
        },
        saveMetadata(): void {
            this.loading = true
            if (this.id) {
                this.$http
                    .post(import.meta.env.VITE_KNOWAGE_API_CONTEXT + `/api/2.0/resources/files/metadata?key=` + this.id, this.metadata, {
                        responseType: 'arraybuffer', // important...because we need to convert it to a blob. If we don't specify this, response.data will be the raw data. It cannot be converted to blob directly.

                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(() => {
                        this.store.setInfo({
                            title: this.$t('common.toast.updateTitle'),
                            msg: this.$t('common.toast.updateSuccess')
                        })
                    })
                    .catch((error) => {
                        this.store.setError({
                            title: this.$t('common.toast.updateTitle'),
                            msg: this.$t(error)
                        })
                    })
            }
            this.loading = false
            this.closeDialog()
        },
        setDirty(): void {
            this.dirty = true
        },
        uploadFile(event): void {
            const reader = new FileReader()
            const self = this
            reader.addEventListener(
                'load',
                function () {
                    self.metadata.image = reader.result || ''
                },
                false
            )
            if (event.srcElement.files[0] && event.srcElement.files[0].size < import.meta.env.VITE_MAX_UPLOAD_IMAGE_SIZE) {
                reader.readAsDataURL(event.srcElement.files[0])
                this.setDirty()
            } else this.store.setError({ title: this.$t('common.error.uploading'), msg: this.$t('common.error.exceededSize', { size: '(200KB)' }) })
        }
    },
    computed: {
        ...mapState(mainStore, {
            locale: 'locale'
        })
    },
    watch: {
        id() {
            this.loadMetadata()
        }
    }
})
</script>

<style scoped lang="scss">
#inputImage {
    display: none;
}
.knMetadataDialog {
    &:deep(.p-dialog-content) {
        width: 600px;
        min-width: 600px;
        max-width: 1200px;

        height: 600px;
        min-height: 600px;
        max-height: 900px;
    }

    .p-fileupload-buttonbar {
        border: none;

        .p-button:not(.p-fileupload-choose) {
            display: none;
        }

        .p-fileupload-choose {
            @extend .kn-button--primary;
        }
    }

    .metadataTextArea {
        width: 100%;
    }
    .imageContainer {
        height: 100%;
        .icon {
            color: var(--kn-color-secondary);
        }
        img {
            height: 150px;
            max-width: 300px;
        }
    }

    .descriptionTextArea {
        height: 200px;

        &:deep(.p-inputtextarea) {
            height: 200px;
        }
    }
}
</style>
