import { IPivotTableStyle } from '../../interfaces/pivotTable/DashboardPivotTableWidget'
import { getFormattedBorderStyle, getFormattedPaddingStyle, getFormattedShadowsStyle, getFormattedTitleStyle, getFormattedBackgroundStyle } from '../common/WidgetStyleHelper'
import * as pivotTableDefaultValues from '../../widget/WidgetEditor/helpers/pivotTableWidget/PivotTableDefaultValues'

export const getFormattedStyle = (widget: any) => {
    return {
        title: getFormattedTitleStyle(widget),
        fields: getFormattedFieldsStyle(widget, 'measures'),
        fieldHeaders: getFormattedFieldsStyle(widget, 'measuresHeaders'),
        borders: getFormattedBorderStyle(widget),
        background: getFormattedBackgroundStyle(widget),
        padding: getFormattedPaddingStyle(widget),
        shadows: getFormattedShadowsStyle(widget),
        totals: getFormattedTotalsStyle(widget),
        subTotals: getFormattedSubTotalsStyle(widget)
    } as IPivotTableStyle
}


const getFormattedFieldsStyle = (widget: any, fieldType) => {
    const formattedStyles = pivotTableDefaultValues.getDefaultFields()
    if (!widget.content.style || !widget.content.style[fieldType]) return formattedStyles
    else {
        formattedStyles.styles[0].properties = {
            'font-weight': widget.content.style[fieldType]['font-weight'],
            'font-style': widget.content.style[fieldType]['font-style'],
            'font-size': widget.content.style[fieldType]['font-size'],
            'font-family': widget.content.style[fieldType]['font-family'],
            'text-align': widget.content.style[fieldType]['text-align'],
            color: widget.content.style[fieldType].color,
            'background-color': widget.content.style[fieldType]['background-color']
        }
        return formattedStyles
    }
}

const getFormattedTotalsStyle = (widget: any) => {
    const formattedStyles = pivotTableDefaultValues.getDefaultTotals()
    if (!widget.content.style || !widget.content.style.totals) return formattedStyles
    else {
        formattedStyles.enabled = true
        formattedStyles.properties['background-color'] = widget.content.style.totals['background-color']
        formattedStyles.properties.color = widget.content.style.totals.color

        return formattedStyles
    }
}
const getFormattedSubTotalsStyle = (widget: any) => {
    const formattedStyles = pivotTableDefaultValues.getDefaultTotals()
    if (!widget.content.style || !widget.content.style.subTotals) return formattedStyles
    else {
        formattedStyles.enabled = true
        formattedStyles.properties['background-color'] = widget.content.style.subTotals['background-color']
        formattedStyles.properties.color = widget.content.style.subTotals.color

        return formattedStyles
    }
}