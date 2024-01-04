export interface iNode {
    key: number | string
    icon: string
    id?: number
    parentId?: number
    label: string
    children?: iNode[]
    selectable?: boolean
    data: string | any
    customIcon?: string
    path?: string
    exportable?: boolean
}
