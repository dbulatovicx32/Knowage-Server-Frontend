import moment from 'moment'
import { DateTime } from 'luxon'
import store from '@/App.store.js'

import formats from '@/helpers/commons/localeDateFormats.json'
import timezones from '@/helpers/commons/localeTimeZones.json'

export let fallbackLocale = 'en_US'

export function getLocale(js?: boolean): string {
    let locale = ''
    if (localStorage.getItem('locale')) locale = localStorage.getItem('locale') || ''
    else locale = store.locale ? store.local : fallbackLocale
    return js ? locale.replace('_', '-') : locale
}

export function formatDate(dateString?: string, format?: string, incomingFormat?: string) {
    let tmp = moment(dateString || new Date(), incomingFormat).locale(getLocale())

    if (format === 'toISOString') return tmp.toISOString()
    else return tmp.format(format || 'L')
}

export function formatDateLuxon(dateString: string, format: string, incomingFormat: string) {
    const baseLocale = getLocale()?.split('_')[0] ?? fallbackLocale
    const dt = DateTime.fromFormat(dateString, incomingFormat, { locale: baseLocale })

    if (!dt.isValid) {
        return null
    }

    return getFormattedDateTimeUsingToLocaleString(format, dt)
}

export const getFormattedDateTimeUsingToLocaleString = (format: string, dt: DateTime) => {
    switch (format) {
        case 'LT':
            return dt.toLocaleString(DateTime.TIME_SIMPLE)
        case 'LTS':
            return dt.toLocaleString(DateTime.TIME_WITH_SECONDS)
        case 'L':
            return dt.toLocaleString(DateTime.DATE_SHORT)
        case 'l':
            return dt.toLocaleString(DateTime.DATE_SHORT).replace(/^0+/, '')
        case 'LL':
            return dt.toLocaleString(DateTime.DATE_MED)
        case 'll':
            return dt.toLocaleString(DateTime.DATE_MED).replace(/(\w{3})/, (match) => match.toUpperCase())
        case 'LLL':
            return dt.toLocaleString(DateTime.DATETIME_MED)
        case 'lll':
            return dt.toLocaleString(DateTime.DATETIME_MED)
        case 'LLLL':
            return dt.toLocaleString(DateTime.DATETIME_FULL)
        case 'llll':
            return dt.toLocaleString(DateTime.DATETIME_FULL)
        default:
            return dt.toLocaleString(DateTime.DATE_SHORT)
    }
}

export function formatDateWithLocale(dateString?: string | number, format?: any, keepNull?: boolean): string {
    if (keepNull && !dateString) return ''
    let dateToFormat = new Date()
    if (dateString) {
        if (typeof dateString == 'string') {
            for (var key in timezones) dateString = dateString.replace(key, timezones[key])
        }
        dateToFormat = new Date(dateString)
    }

    return Intl.DateTimeFormat(getLocale(true), format).format(dateToFormat)
}

export function formatNumberWithLocale(number: number, precision?: number, format?: any) {
    // return Intl.NumberFormat(getLocale(true), { ...format, minimumFractionDigits: precision || 2, maximumFractionDigits: precision || 2 }).format(number)
    return Intl.NumberFormat(getLocale(true), { ...format, minimumFractionDigits: precision != null ? precision : 2, maximumFractionDigits: precision != null ? precision : 2 }).format(number)
}

export function luxonFormatDate(dateString: any | Date, inputFormat?: string, outputFormat?: string) {
    let tempDate = inputFormat ? DateTime.fromFormat(dateString, inputFormat).setLocale(getLocale(true)) : DateTime.fromJSDate(dateString).setLocale(getLocale(true))
    if (!tempDate.isValid) tempDate = DateTime.fromFormat(dateString, 'dd/MM/yyyy')
    if (outputFormat) return tempDate.toFormat(outputFormat)
    else return tempDate.toLocaleString({ year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function localeDate(locale?: any): String {
    let loc = locale
    if (!loc) loc = getLocale(true)
    return formats[loc].replaceAll('m', 'M')
}

export function primeVueDate(locale?: any): String {
    let loc = locale
    if (!loc) loc = getLocale(true)
    return convertToPrimeVueFormat(formats[loc])
}

export function convertToPrimeVueFormat(format: String) {
    return format.replaceAll('yy', 'y').replaceAll('M', 'm')
}

export function getJSDateFromDateString(dateString: string, inputFormat: string) {
    if (!dateString) return
    return DateTime.fromFormat(dateString, inputFormat).toJSDate()
}

export function getDateStringFromJSDate(date: Date, outputFormat: string) {
    if (!date) return
    return DateTime.fromJSDate(date).toFormat(outputFormat)
}
