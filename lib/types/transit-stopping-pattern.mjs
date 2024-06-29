export default class TransitStoppingPattern {

  responseData
  runData
  routeData
  stops
  #runRef

  constructor(runRef) {
    this.#runRef = runRef
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
   * Gets the raw run data from the PTV response
   * @returns {dictionary} The run data
   */
  getRun() {
    return this.responseData.runs[this.#runRef]
  }

  /**
   * Gets the raw route data from the PTV response
   * @returns {string} The route data
   */
  getRoute() {
    return this.responseData.routes[this.getRun().route_id]
  }

  /**
   * Gets the raw direction data from the PTV response
   * @returns {string} The direction data
   */
  getDirection() {
    return this.responseData.directions[this.getRun().direction_id]
  }

  /**
   * Gets the run flags
   * @returns {string} The flags from the first departure
   */
  getFlags() {
    return this.responseData.departures[0].flags
  }


  /**
   * Fetches the stopping pattern of a given run reference.
   * @param {dictionary} parameters A list of API parameters.
   */
  async fetch(parameters) {

  }

}