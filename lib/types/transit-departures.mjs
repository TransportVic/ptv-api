export default class TransitDepartures extends Array {

  departures = []

  constructor() {
    super()
  }

  generateQueryString(parameters) {
    let queries = []
    if (typeof parameters.platforms !== 'undefined') queries.push(...parameters.platforms.map(platform => `platform_numbers=${platform}`))
    if (typeof parameters.direction !== 'undefined') queries.push(`direction_id=${parameters.direction}`)
    if (typeof parameters.gtfs !== 'undefined') queries.push(`gtfs=${parameters.gtfs}`)
    if (typeof parameters.date !== 'undefined') queries.push(`date_utc=${parameters.date.toISOString()}`)
    if (typeof parameters.maxResults !== 'undefined') queries.push(`max_results=${parameters.maxResults}`)
    if (typeof parameters.includeCancelled !== 'undefined') queries.push(`include_cancelled=${parameters.includeCancelled}`)
    if (typeof parameters.backwards !== 'undefined') queries.push(`look_backwards=${parameters.backwards}`)
    if (typeof parameters.expand !== 'undefined') queries.push(...parameters.expand.map(expand => `expand=${expand}`))

    return `?${queries.join('&')}`
  }

  addExpandData(parameters) {
    if (typeof parameters.expand === 'undefined') parameters.expand = []
    if (!parameters.expand.includes('run')) parameters.expand.push('run')
    if (!parameters.expand.includes('route')) parameters.expand.push('route')
  }

  async fetch(parameters) {
  }

}