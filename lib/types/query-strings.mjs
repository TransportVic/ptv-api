import { dateLikeToISO } from '../date-utils.mjs'


/**
 * 
 * @param {dictionary} parameters A list of parameters to be passed into the PTV API as follows:
 * -> platforms {Array[string]} The list of platform to fetch departures for
 * -> direction {integer} The PTV API direction (not rail direction) to fetch departures for
 * -> gtfs {boolean} True if the stopID provided is a customer facing GTFS ID
 * -> date {Date} The time to fetch departures for
 * -> maxResults {integer} The maximum number of departures (per direction) to fetch. NOTE: This field must exist in order for realtime data to be returned.
 * -> includeCancelled {boolean} True if cancelled trains should be returned in the data
 * -> backwards {boolean} True to return departures before the departure time instead of after
 * -> expand {Array[string]} A list of other data data to expand. Run, route and direction will be expanded for all runs.
 * @returns 
 */
export default function generateQueryString(parameters) {
  if (!parameters) return ''

  let queries = []
  if (typeof parameters.platforms !== 'undefined') queries.push(...parameters.platforms.map(platform => `platform_numbers=${platform}`))
  if (typeof parameters.direction !== 'undefined') queries.push(`direction_id=${parameters.direction}`)
  if (typeof parameters.gtfs !== 'undefined') queries.push(`gtfs=${parameters.gtfs}`)
  if (typeof parameters.date !== 'undefined') queries.push(`date_utc=${dateLikeToISO(parameters.date)}`)
  if (typeof parameters.maxResults !== 'undefined') queries.push(`max_results=${parameters.maxResults}`)
  if (typeof parameters.includeCancelled !== 'undefined') queries.push(`include_cancelled=${parameters.includeCancelled}`)
  if (typeof parameters.backwards !== 'undefined') queries.push(`look_backwards=${parameters.backwards}`)
  if (typeof parameters.expand !== 'undefined') queries.push(...parameters.expand.map(expand => `expand=${expand}`))
  if (typeof parameters.includeForming !== 'undefined') queries.push(`include_advertised_interchange=${parameters.includeForming}`)

  return `?${queries.join('&')}`
}