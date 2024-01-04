<template>
    <div class="kn-page">
        <Toolbar class="kn-toolbar kn-toolbar--primary">
            <template #start>
                <!-- {{ $t('managers.importExportDocs.title') }} -->
                <p>Import/Export Menu</p>
            </template>
            <template #end>
                <Button class="kn-button p-button-text" @click="toggleImportDialog">
                    {{ $t('common.import') }}
                </Button>
                <Button class="kn-button p-button-text" :disabled="Object.values(selectedDocumentsKeys).length == 0" @click="toggleExportDialog">{{ $t('common.export') }}</Button>
            </template>
        </Toolbar>
        <ProgressBar v-if="loading" mode="indeterminate" class="kn-progress-bar" />
        <div class="kn-page-content p-d-flex p-flex-column p-m-0">
            <!-- <form class="p-fluid p-formgrid p-grid p-m-2 p-pt-2 p-ai-center">
            <div class="p-field p-col-5">
                <span class="p-float-label">
                    <Calendar id="startDate" v-model="dateFilter" class="kn-material-input" :show-icon="true" :manual-input="true" :show-button-bar="true" />
                    <label for="attributes" class="kn-material-input-label"> {{ $t('managers.importExportDocs.date') }} </label>
                </span>
            </div>
            <div class="p-field p-col-6">
                <span class="p-float-label kn-height-full">
                    <Multiselect v-model="selectedFilters" class="kn-material-input kn-height-full" :options="availableFilters" option-label="label" option-value="value"> </Multiselect>
                    <label for="attributes" class="kn-material-input-label"> {{ $t('managers.importExportDocs.status') }} </label>
                </span>
            </div>
            <Button icon="fas fa-magnifying-glass p-field p-col-1" class="p-button-rounded p-button-text p-button-plain expand-button" :disabled="loading" @click="loadDocuments" />
        </form> -->

            <Tree
                v-model:selectionKeys="selectedDocumentsKeys"
                class="import-export-document-tree kn-tree"
                :value="nodes"
                :loading="loading"
                selection-mode="checkbox"
                :meta-key-selection="false"
                :filter="true"
                filter-mode="lenient"
                @node-expand="setOpenFolderIcon($event)"
                @node-collapse="setClosedFolderIcon($event)"
            >
            </Tree>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// import { exportMenuDialog } from './exportDialog/ExportMenuDialog.vue'
// import { importMenuDialog } from './exportDialog/ImportMenuDialog.vue'
import { iNode } from './ImportExportMenu'
import mainStore from '../../../App.store'
import ProgressBar from 'primevue/progressbar'
import Tree from 'primevue/tree'
import { findObjectById } from './ImportExportMenuHelpers'
import { mapState } from 'pinia'
import deepcopy from 'deepcopy'

// import Dialog from 'primevue/dialog'
// import Checkbox from 'primevue/checkbox'

export default defineComponent({
    name: 'import-export',
    components: { ProgressBar, Tree },
    props: {},
    emits: ['close', 'export'],
    setup() {
        const store = mainStore()
        return { store }
    },
    data() {
        return {
            nodes: [] as iNode[],
            loading: false,
            selectedDocumentsKeys: {} as any,
            folders: [] as any[]
        }
    },
    computed: {
        ...mapState(mainStore, {
            user: 'user',
            isEnterprise: 'isEnterprise',
            licenses: 'licenses'
        })
    },
    created() {
        this.loadMenues()
    },
    methods: {
        loadMenues() {
            this.loading = true
            this.$http
                .get(import.meta.env.VITE_KNOWAGE_CONTEXT + `/restful-services/1.0/serverManager/importExport/menu/getAllMenu`)
                .then((response: AxiosResponse<any>) => {
                    this.folders = response.data.currentMenu
                    this.folders?.sort((a: any, b: any) => {
                        return a.id - b.id
                    })
                })
                .catch((error: any) => {
                    console.log('error', error)
                })
                .finally(() => {
                    this.loading = false
                    this.createNodeTree()
                })
        },
        createNodeTree() {
            this.nodes = []
            const foldersWithMissingParent = [] as iNode[]

            this.folders.forEach((file: any) => {
                if (file.codType != 'USER_FUNCT') {
                    console.log('file:', file)
                    const node = {
                        key: file.menuId,
                        id: file.menuId,
                        parentId: file.parentId,
                        label: file.name,
                        children: this.formatFolderChildren(file.biObjects, file.path),
                        data: file,
                        icon: 'pi pi-folder',
                        selectable: true,
                        path: file.path,
                        isFolder: true
                    }

                    const temp = foldersWithMissingParent.filter((folder: iNode) => node.id === folder.parentId)
                    temp.forEach((el: any) => node.children.push(el))
                    this.attachFolderToTree(node, foldersWithMissingParent)
                }
            })
        },
        // createNodeTree() {
        //     this.nodes = []
        //     const foldersWithMissingParent = [] as iNode[]
        //     this.folders.forEach((folder: any) => {
        //         const node = { key: folder.name, icon: 'pi pi-folder', id: folder.menuId, parentId: folder.parentId, label: folder.name, children: [] as iNode[], data: { name: folder.name } }
        //         node.children = foldersWithMissingParent.filter((folder: iNode) => node.menuId === folder.parentId)

        //         this.attachDocumentsToNode(folder, node)
        //         this.attachFolderToTree(node, foldersWithMissingParent)
        //     })
        // },
        formatFolderChildren(folderChildren: any[], filePath: string) {
            console.log('filePath:', filePath)
            console.log('folderChildren:', folderChildren)
            const formattedChildren = [] as iNode[]
            // folderChildren.forEach((document: any) => {
            //     console.log('document:', document)
            //     if (document.visible) {
            //         formattedChildren.push({ key: document.menuId, icon: 'pi pi-file', id: document.menuId, label: document.name, data: document, selectable: true, path: filePath })
            //     }
            // })

            return formattedChildren
        },
        attachFolderToTree(folder: iNode, foldersWithMissingParent: iNode[]) {
            if (folder.parentId) {
                let parentFolder = null as iNode | null
                for (let i = 0; i < foldersWithMissingParent.length; i++) {
                    if (folder.parentId === foldersWithMissingParent[i].id) {
                        foldersWithMissingParent[i].children?.push(folder)
                        parentFolder = foldersWithMissingParent[i]
                        break
                    }
                }
                for (let i = 0; i < this.nodes.length; i++) {
                    parentFolder = this.findParentFolder(folder, this.nodes[i])
                    if (parentFolder && !parentFolder.data.stateCode) {
                        parentFolder.children?.push(deepcopy(folder))
                        break
                    }
                }
                if (!parentFolder) {
                    foldersWithMissingParent.push(folder)
                }
            } else {
                this.nodes.push(folder)
            }
        },
        exportMenu(exportPayload) {
            this.store.setLoading(true)

            exportPayload.DOCUMENT_ID_LIST = []
            for (const fileId in this.selectedDocumentsKeys) {
                const file = findObjectById(this.nodes, fileId)
                if (file && !file.isFolder) {
                    if (exportPayload.EXPORT_SELECTED_FUNCTIONALITY) exportPayload.DOCUMENT_ID_LIST.push({ id: file.id, folder: file.path })
                    else exportPayload.DOCUMENT_ID_LIST.push(fileId)
                }
            }

            console.log('exportPayload', exportPayload)

            this.$http
                .post(import.meta.env.VITE_KNOWAGE_CONTEXT + '/restful-services/1.0/serverManager/importExport/menu/export', exportPayload)
                .then(() => {
                    this.downloadExportedDocuments(exportPayload)
                })
                .catch((error) => console.error('error', error))
                .finally(() => {
                    this.store.setLoading(false)
                    this.toggleExportDialog()
                })
        },
        setOpenFolderIcon(node: iNode) {
            node.icon = 'pi pi-folder-open'
        },
        setClosedFolderIcon(node: iNode) {
            node.icon = 'pi pi-folder'
        },
        toggleImportDialog() {
            this.displayImportDialog = !this.displayImportDialog
        },
        toggleExportDialog() {
            this.displayExportDialog = !this.displayExportDialog
        }
    }
})
</script>
<style lang="scss">
.import-export-document-tree {
    display: flex;
    flex-direction: column;
    flex: 1;
    border: none;
    padding-top: 0;
    overflow: auto;
}
</style>
