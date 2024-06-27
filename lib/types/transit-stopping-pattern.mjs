export default class TransitStoppingPattern {

  constructor() {
  }

  /**
   * 
   * @param {dictionary} parameters A list of parameters to be passed into the PTV API as follows:
   * -> date {Date} The time to fetch departures for
   * -> expand {Array[string]} A list of other data data to expand. Run, stop, route and direction will be expanded for all runs.
   * @returns 
   */
  generateQueryString(parameters) {
    let queries = []
    if (typeof parameters.date !== 'undefined') queries.push(`date_utc=${parameters.date.toISOString()}`)
    if (typeof parameters.expand !== 'undefined') queries.push(...parameters.expand.map(expand => `expand=${expand}`))

    return `?${queries.join('&')}`
  }

  /**
   * Adds required expand data to the API parameters. Required in order to calculate certain values in the response.
   * @param {dictionary} parameters A raw list of parameters provided by the user
   */
  addExpandData(parameters) {
    if (typeof parameters.expand === 'undefined') parameters.expand = []
    if (!parameters.expand.includes('run')) parameters.expand.push('run')
    if (!parameters.expand.includes('stop')) parameters.expand.push('stop')
    if (!parameters.expand.includes('route')) parameters.expand.push('route')
    if (!parameters.expand.includes('direction')) parameters.expand.push('direction')
  }

  /**
   * Fetches the stopping pattern of a given run reference.
   * @param {dictionary} parameters A list of API parameters.
   */
  async fetch(parameters) {

  }

}