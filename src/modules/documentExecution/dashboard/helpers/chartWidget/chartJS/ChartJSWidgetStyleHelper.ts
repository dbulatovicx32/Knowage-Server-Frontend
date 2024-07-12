

import { IChartJSWidgetStyle } from '../../../interfaces/chartJS/DashboardChartJSWidget'
import { getFormattedTitleStyle, getFormattedPaddingStyle, getFormattedBorderStyle, getFormattedShadowsStyle, getFormattedBackgroundStyle } from '../../common/WidgetStyleHelper'

export const getFormattedStyle = (widget: any) => {
    return {
        themeName: '',
        title: getFormattedTitleStyle(widget),
        padding: getFormattedPaddingStyle(widget),
        borders: getFormattedBorderStyle(widget),
        shadows: getFormattedShadowsStyle(widget),
        background: getFormattedBackgroundStyle(widget)
    } as IChartJSWidgetStyle
}
