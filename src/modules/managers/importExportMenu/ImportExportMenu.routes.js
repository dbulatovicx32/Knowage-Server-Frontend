const routes = [
    {
        path: '/import-export-menu',
        name: 'import-export-menu',
        component: () => import('@/modules/managers/importExportMenu/ImportExportMenu.vue'),
        children: []
    }
]

export default routes
