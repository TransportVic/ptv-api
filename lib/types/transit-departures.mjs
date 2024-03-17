export default class TransitDepartures {

  constructor() {
  }

  generateQueryString(parameters) {
    let queries = []
    if (parameters.platforms) queries.push(...parameters.platforms.map(platform => `platform_numbers=${platform}`))
    if (parameters.direction) queries.push(`direction_id=${parameters.direction}`)
    if (parameters.gtfs) queries.push(`gtfs=${parameters.gtfs}`)
    if (parameters.date) queries.push(`date_utc=${parameters.date.toISOString()}`)
    if (parameters.maxResults) queries.push(`max_results=${parameters.maxResults}`)
    if (parameters.includeCancelled) queries.push(`include_cancelled=${parameters.includeCancelled}`)
    if (parameters.backwards) queries.push(`look_backwards=${parameters.backwards}`)
    if (parameters.expand) queries.push(...parameters.expand.map(expand => `expand=${expand}`))

    return `?${queries.join('&')}`
  }

  async fetch(parameters) {
  }

  [Symbol.iterator]() {
    return []
  }

}