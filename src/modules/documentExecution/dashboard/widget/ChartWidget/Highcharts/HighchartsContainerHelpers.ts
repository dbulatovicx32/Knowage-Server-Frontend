import { IWidgetCrossNavigation, IWidgetInteractionParameter } from "../../../Dashboard";
import { IChartInteractionValues } from "../../../interfaces/chartJS/DashboardChartJSWidget";

export const formatForCrossNavigation = (chartEvent: any, crossNavigationOptions: IWidgetCrossNavigation, dataToShow: any, chartType: string) => {
    if (!chartEvent.point) return []
    const formattedChartValues = getFormattedChartValues(chartEvent, dataToShow, chartType)
    const formattedOutputParameters = getFormattedOutputParameters(formattedChartValues, crossNavigationOptions.parameters)
    return formattedOutputParameters

}

const getFormattedChartValues = (chartEvent: any, dataToShow: any, chartType: string) => {
    const categoryName = dataToShow?.metaData?.fields[1] ? dataToShow.metaData.fields[1].header : ''
    const chartPoint = chartEvent.point

    const formattedChartValues = { serieName: getSerieNameForCrossNavigation(chartPoint, chartType, dataToShow), serieValue: getSerieValueForCrossNavigation(chartPoint, chartType), categoryName: categoryName, categoryValue: getCategoryValueForCrossNavigation(chartPoint, chartType) } as IChartInteractionValues
    if (chartType === 'heatmap') {
        const groupingName = dataToShow?.metaData?.fields[2] ? dataToShow.metaData.fields[2].header : ''
        formattedChartValues.groupingName = groupingName
        formattedChartValues.groupingValue = chartPoint.options.groupingValue
    }
    return formattedChartValues
}

const getSerieNameForCrossNavigation = (chartPoint: any, chartType: string, dataToShow: any) => {
    if (['pictorial'].includes(chartType)) return dataToShow?.metaData?.fields[2] ? dataToShow?.metaData?.fields[2].header : ''
    if (['spline'].includes(chartType)) return chartPoint.category
    else return chartPoint.series.name
}

const getSerieValueForCrossNavigation = (chartPoint: any, chartType: string,) => {
    if (['pie', 'radar', 'area', 'bar', 'column', 'line', 'bubble', 'spline'].includes(chartType)) return chartPoint.options.y
    else if (['dependencywheel', 'pictorial'].includes(chartType)) return chartPoint.options.y ?? chartPoint.options.weight
    else return chartPoint.options.value
}

const getCategoryValueForCrossNavigation = (chartPoint: any, chartType: string) => {
    if (['dependencywheel', 'sankey'].includes(chartType)) return chartPoint.options.id ?? chartPoint.options.from
    else if (['spline', 'pictorial'].includes(chartType)) return chartPoint.series.name
    else return chartPoint.options.name
}

const getFormattedOutputParameters = (formattedChartValues: IChartInteractionValues, outputParameters: IWidgetInteractionParameter[]) => {
    const formattedOutputParameters = [] as IWidgetInteractionParameter[]
    outputParameters.forEach((outputParameter: IWidgetInteractionParameter) => {
        if (outputParameter.type === 'dynamic') {
            formattedOutputParameters.push(getFormattedDynamicOutputParameter(formattedChartValues, outputParameter))
        } else {
            formattedOutputParameters.push(outputParameter)
        }
    })
    return formattedOutputParameters
}

const getFormattedDynamicOutputParameter = (formattedChartValues: IChartInteractionValues, outputParameter: IWidgetInteractionParameter) => {
    let value = ''
    switch (outputParameter.column) {
        case "SERIE_NAME":
            value = formattedChartValues.serieName;
            break
        case "SERIE_VALUE":
            value = formattedChartValues.serieValue;
            break
        case "CATEGORY_NAME":
            value = formattedChartValues.categoryName;
            break
        case "CATEGORY_VALUE":
            value = formattedChartValues.categoryValue;
            break
        case "GROUPING_NAME":
            value = formattedChartValues.groupingName as string;
            break
        case "GROUPING_VALUE":
            value = formattedChartValues.groupingValue as string;
            break
    }
    return { ...outputParameter, value: value }
}