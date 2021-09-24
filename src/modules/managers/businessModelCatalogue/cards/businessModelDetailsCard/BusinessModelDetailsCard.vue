<template>
    <Card>
        <template #header>
            <Toolbar class="kn-toolbar kn-toolbar--primary">
                <template #left>
                    {{ $t('managers.businessModelManager.driversDetails') }}
                </template>
            </Toolbar>
        </template>
        <template #content>
            <form class="p-fluid p-m-5">
                <div class="p-field">
                    <span class="p-float-label">
                        <InputText
                            id="name"
                            class="kn-material-input"
                            type="text"
                            v-model.trim="v$.businessModel.name.$model"
                            :class="{
                                'p-invalid': v$.businessModel.name.$invalid && v$.businessModel.name.$dirty
                            }"
                            maxLength="100"
                            :disabled="businessModel.id"
                            @blur="v$.businessModel.name.$touch()"
                            @input="onFieldChange('name', $event.target.value)"
                            data-test="name-input"
                        />
                        <label for="label" class="kn-material-input-label"> {{ $t('common.name') }} * </label>
                    </span>
                    <KnValidationMessages
                        :vComp="v$.businessModel.name"
                        :additionalTranslateParams="{
                            fieldName: $t('common.name')
                        }"
                    />
                </div>
                <div class="p-field">
                    <span class="p-float-label">
                        <InputText
                            id="description"
                            class="kn-material-input"
                            type="text"
                            v-model.trim="v$.businessModel.description.$model"
                            :class="{
                                'p-invalid': v$.businessModel.description.$invalid && v$.businessModel.description.$dirty
                            }"
                            maxLength="500"
                            @blur="v$.businessModel.description.$touch()"
                            @input="onFieldChange('description', $event.target.value)"
                            :disabled="readonly"
                            data-test="description-input"
                        />
                        <label for="description" class="kn-material-input-label"> {{ $t('managers.businessModelManager.description') }}</label>
                    </span>
                    <KnValidationMessages
                        :vComp="v$.businessModel.description"
                        :additionalTranslateParams="{
                            fieldName: $t('managers.businessModelManager.description')
                        }"
                    />
                </div>

                <div class="p-field">
                    <span>
                        <label for="category" class="kn-material-input-label">{{ $t('common.category') }} * </label>
                        <Dropdown
                            id="category"
                            class="kn-material-input"
                            :class="{
                                'p-invalid': v$.businessModel.category.$invalid && v$.businessModel.category.$dirty
                            }"
                            v-model="v$.businessModel.category.$model"
                            :options="categories"
                            :placeholder="$t('common.category')"
                            :disabled="readonly"
                            @before-show="v$.businessModel.category.$touch()"
                            @change="onFieldChange('category', $event.value.VALUE_ID)"
                        >
                            <template #value="slotProps">
                                <div v-if="slotProps.value">
                                    <span>{{ slotProps.value.VALUE_NM }}</span>
                                </div>
                            </template>
                            <template #option="slotProps">
                                <div>
                                    <span>{{ slotProps.option.VALUE_NM }}</span>
                                </div>
                            </template>
                        </Dropdown>
                    </span>
                    <KnValidationMessages
                        :vComp="v$.businessModel.category"
                        :additionalTranslateParams="{
                            fieldName: $t('managers.businessModelManager.analyticalDriver')
                        }"
                    />
                </div>

                <div class="p-field">
                    <span>
                        <label for="dataSourceLabel" class="kn-material-input-label">{{ $t('managers.businessModelManager.dataSource') }} * </label>
                        <Dropdown
                            id="dataSourceLabel"
                            class="kn-material-input"
                            :class="{
                                'p-invalid': v$.businessModel.dataSourceLabel.$invalid && v$.businessModel.dataSourceLabel.$dirty
                            }"
                            v-model="v$.businessModel.dataSourceLabel.$model"
                            :options="datasources"
                            :placeholder="$t('managers.businessModelManager.dataSourceLabelPlaceholder')"
                            :disabled="readonly"
                            @before-show="v$.businessModel.dataSourceLabel.$touch()"
                            @change="onFieldChange('dataSourceLabel', $event.value)"
                        >
                            <template #value="slotProps">
                                <div v-if="slotProps.value">
                                    <span>{{ slotProps.value }}</span>
                                </div>
                            </template>
                            <template #option="slotProps">
                                <div>
                                    <span>{{ slotProps.option }}</span>
                                </div>
                            </template>
                        </Dropdown>
                    </span>
                    <KnValidationMessages
                        :vComp="v$.businessModel.dataSourceLabel"
                        :additionalTranslateParams="{
                            fieldName: $t('managers.businessModelManager.dataSource')
                        }"
                    />
                </div>

                <div class="p-d-flex p-flex-row">
                    <div class="input-container" v-if="!metaWebVisible && !readonly">
                        <label for="upload" class="kn-material-input-label">{{ $t('managers.businessModelManager.uploadFile') }}:</label>
                        <KnInputFile :changeFunction="uploadFile" :visibility="true" />
                    </div>
                    <div class="input-container p-d-flex p-flex-row" v-else-if="metaWebVisible">
                        <div class="p-m-2">
                            <Button class="kn-button kn-button--primary" :label="$t('managers.businessModelManager.metaWeb')" @click="goToMetaWeb" data-test="metaweb-button"></Button>
                        </div>
                        <div class="p-m-2" v-if="toGenerate">
                            <Button class="kn-button kn-button--primary" :label="$t('managers.businessModelManager.generate')" @click="generateDatamartVisible = true"></Button>
                        </div>
                    </div>

                    <div class="input-container">
                        <div class="p-d-flex p-flex-row">
                            <div v-if="selectedBusinessModel.id" class="p-mr-2">
                                <InputSwitch id="enable-metadata" class="p-mr-2" v-model="metaWebVisible" :disabled="readonly" data-test="metaweb-switch" />
                                <label for="enable-metadata" class="kn-material-input-label">{{ $t('managers.businessModelManager.enableMetaweb') }}</label>
                            </div>
                            <div>
                                <InputSwitch id="model-lock" class="p-mr-2" v-model="businessModel.modelLocked" :disabled="readonly" @change="onLockedChange" />
                                <label for="model-lock" class="kn-material-input-label">{{ businessModel.modelLocked ? $t('managers.businessModelManager.unlockModel') : $t('managers.businessModelManager.lockModel') }}</label>
                            </div>
                        </div>
                        <div class="p-mt-2">
                            <InputSwitch id="smart-view" class="p-mr-2" v-model="businessModel.smartView" :disabled="readonly" @change="onSmartViewChange" />
                            <label for="smart-view" class="kn-material-input-label" v-tooltip.bottom="$t('managers.businessModelManager.smartViewTooltip')">{{ businessModel.smartView ? $t('managers.businessModelManager.smartView') : $t('managers.businessModelManager.advancedView') }}</label>
                        </div>
                    </div>
                </div>

                <div class="p-mt-5" v-if="metaWebVisible">
                    <Toolbar class="kn-toolbar kn-toolbar--secondary">
                        <template #left>
                            {{ $t('managers.businessModelManager.configurationTablePrefixTitle') }}
                        </template>
                        <template #right>
                            <i class="fa fa-info-circle" v-tooltip.bottom="$t('managers.businessModelManager.prefixTooltip')"></i>
                        </template>
                    </Toolbar>
                    <div class="p-fluid p-m-5">
                        <div class="p-field p-d-flex">
                            <div class="kn-flex">
                                <span class="p-float-label p-mr-2">
                                    <InputText
                                        id="tablePrefixLike"
                                        class="kn-material-input"
                                        type="text"
                                        v-model.trim="v$.businessModel.tablePrefixLike.$model"
                                        :class="{
                                            'p-invalid': v$.businessModel.tablePrefixLike.$invalid && v$.businessModel.tablePrefixLike.$dirty
                                        }"
                                        maxLength="500"
                                        v-tooltip.bottom="$t('managers.businessModelManager.tablePrefixLikeExampleTooltip')"
                                        :disabled="readonly"
                                        @blur="v$.businessModel.tablePrefixLike.$touch()"
                                        @input="onFieldChange('tablePrefixLike', $event.target.value)"
                                        data-test="prefix-input"
                                    />
                                    <label for="label" class="kn-material-input-label"> {{ $t('managers.businessModelManager.tablePrefixLike') }}</label>
                                </span>
                                <KnValidationMessages
                                    :vComp="v$.businessModel.tablePrefixLike"
                                    :additionalTranslateParams="{
                                        fieldName: $t('managers.businessModelManager.tablePrefixLike')
                                    }"
                                />
                            </div>
                            <div class="kn-flex">
                                <span class="p-float-label">
                                    <InputText
                                        id="tablePrefixNotLike"
                                        class="kn-material-input"
                                        type="text"
                                        v-model.trim="v$.businessModel.tablePrefixNotLike.$model"
                                        :class="{
                                            'p-invalid': v$.businessModel.tablePrefixNotLike.$invalid && v$.businessModel.tablePrefixNotLike.$dirty
                                        }"
                                        maxLength="500"
                                        v-tooltip.bottom="$t('managers.businessModelManager.tablePrefixNotLikeExampleTooltip')"
                                        :disabled="readonly"
                                        @blur="v$.businessModel.tablePrefixNotLike.$touch()"
                                        @input="onFieldChange('tablePrefixNotLike', $event.target.value)"
                                        data-test="prefix-not-like-input"
                                    />
                                    <label for="label" class="kn-material-input-label"> {{ $t('managers.businessModelManager.tablePrefixNotLike') }}</label>
                                </span>
                                <KnValidationMessages
                                    :vComp="v$.businessModel.tablePrefixNotLike"
                                    :additionalTranslateParams="{
                                        fieldName: $t('managers.businessModelManager.tablePrefixNotLike')
                                    }"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            <Dialog :contentStyle="businessModelDetailsCardDescriptor.dialog.style" :visible="showMetaWeb" :modal="true" class="full-screen-dialog p-fluid kn-dialog--toolbar--primary" :closable="false">
                <iframe :style="businessModelDetailsCardDescriptor.iframe.style" :src="metaModelUrl"></iframe>
            </Dialog>

            <GenerateDatamartCard v-if="generateDatamartVisible" :businessModel="selectedBusinessModel" :user="user" @close="generateDatamartVisible = false" @generated="onDatamartGenerated"></GenerateDatamartCard>
        </template>
    </Card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { iBusinessModel } from '../../BusinessModelCatalogue'
import { createValidations } from '@/helpers/commons/validationHelper'
import businessModelDetailsCardDescriptor from './BusinessModelDetailsCardDescriptor.json'
import businessModelDetailsCardValidation from './BusinessModelDetailsCardValidation.json'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import GenerateDatamartCard from './GenerateDatamartCard.vue'
import InputSwitch from 'primevue/inputswitch'
import KnInputFile from '@/components/UI/KnInputFile.vue'
import KnValidationMessages from '@/components/UI/KnValidatonMessages.vue'
import useValidate from '@vuelidate/core'

export default defineComponent({
    name: 'business-model-details-card',
    components: {
        Card,
        Dialog,
        Dropdown,
        GenerateDatamartCard,
        InputSwitch,
        KnInputFile,
        KnValidationMessages
    },
    props: {
        selectedBusinessModel: {
            type: Object,
            required: true
        },
        domainCategories: {
            type: Array,
            required: true
        },
        datasourcesMeta: {
            type: Array,
            required: true
        },
        user: {
            type: Object,
            required: true
        },
        toGenerate: {
            type: Boolean
        },
        readonly: {
            type: Boolean
        }
    },
    emits: ['fieldChanged', 'fileUploaded', 'datamartGenerated'],
    watch: {
        selectedBusinessModel() {
            this.v$.$reset()
            this.loadBusinessModel()
        },
        domainCategories() {
            this.loadCategories()
        },
        datasourcesMeta() {
            this.loadDatasources()
        }
    },
    computed: {
        metaModelUrl(): any {
            return `/knowagemeta/restful-services/1.0/pages/edit?datasourceId=${this.businessModel.dataSourceId}&user_id=${this.user.userUniqueIdentifier}&bmId=${this.businessModel.id}&bmName=${this.businessModel.name}`
        }
    },
    created() {
        window.addEventListener('message', (event: any) => {
            if (event.action == 'closeDialog') {
                this.showMetaWeb = false
                this.loadBusinessModel()
                this.loadCategories()
            }
        })
        this.loadBusinessModel()
        this.loadCategories()
        this.loadDatasources()
    },
    unmounted() {
        window.removeEventListener('message', (event: any) => {
            if (event.action == 'closeDialog') {
                this.showMetaWeb = false
            }
        })
    },
    data() {
        return {
            businessModelDetailsCardDescriptor,
            businessModelDetailsCardValidation,
            businessModel: {} as iBusinessModel,
            categories: [] as any[],
            datasources: [] as any[],
            metaWebVisible: false,
            showMetaWeb: false,
            generateDatamartVisible: false,
            touched: false,
            v$: useValidate() as any
        }
    },
    validations() {
        return {
            businessModel: createValidations('businessModel', businessModelDetailsCardValidation.validations.businessModel)
        }
    },
    methods: {
        loadBusinessModel() {
            this.businessModel = { ...this.selectedBusinessModel } as iBusinessModel
        },
        loadCategories() {
            this.categories = this.domainCategories as any[]
        },
        loadDatasources() {
            this.datasources = this.datasourcesMeta as any[]
        },
        uploadFile(event) {
            this.$emit('fileUploaded', event.target.files[0])
        },
        onFieldChange(fieldName: string, value: any) {
            this.$emit('fieldChanged', { fieldName, value })
        },
        onLockedChange() {
            this.$emit('fieldChanged', { fieldName: 'modelLocked', value: this.businessModel.modelLocked })
        },
        onSmartViewChange() {
            this.$emit('fieldChanged', { fieldName: 'smartView', value: this.businessModel.smartView })
        },
        goToMetaWeb() {
            this.showMetaWeb = true
        },
        onDatamartGenerated() {
            this.$emit('datamartGenerated')
        }
    }
})
</script>

<style lang="scss" scoped>
.input-container {
    flex: 0.5;
}
</style>
<style lang="scss">
.full-screen-dialog.p-dialog {
    max-height: 100%;
}
.full-screen-dialog.p-dialog .p-dialog-content {
    padding: 0;
}
</style>