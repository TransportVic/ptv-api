import generateQueryString from './query-strings.mjs'

export default class TransitDepartures extends Array {

  #responseData
  #api
  #stopID

  /**
   * @abstract
   * 
   * An abstract class used to store transit departures
   */
  constructor(apiInterface, stopID) {
    super()
    this.#api = apiInterface
    this.#stopID = stopID
  }

  // TODO: Move all generateQueryStrings to a common function
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
  // generateQueryString(parameters) {
  //   return generateQueryString(parameters)
  // }

  /**
   * Adds required expand data to the API parameters. Required in order to calculate certain values in the response.
   * @param {dictionary} parameters A raw list of parameters provided by the user
   */
  addExpandData(parameters) {
    if (typeof parameters.expand === 'undefined') parameters.expand = []
    if (!parameters.expand.includes('stop')) parameters.expand.push('stop')
    if (!parameters.expand.includes('run')) parameters.expand.push('run')
    if (!parameters.expand.includes('route')) parameters.expand.push('route')
    if (!parameters.expand.includes('direction')) parameters.expand.push('direction')
  }

  /**
   * Gets the route data of a specified departure
   * 
   * @param {dictionary} departure The departure to use
   * @returns {dictionary} The route data
   */
  getRoute(departure) {
    return this.#responseData.routes[departure.route_id]
  }

  /**
   * Gets the run data of a specified departure
   * 
   * @param {dictionary} departure The departure to use
   * @returns {dictionary} The run data
   */
  getRun(departure) {
    return this.#responseData.runs[departure.run_ref]
  }

  /**
   * Gets the direction data of a specified departure
   * 
   * @param {dictionary} departure The departure to use
   * @returns {dictionary} The direction data
   */
  getDirection(departure) {
    return this.#responseData.directions[departure.direction_id]
  }

  /**
   * @abstract
   * Fetches the departure data
   * @param {dictionary} parameters A list of API parameters
   */
  async fetch(parameters) {
  }

  getResponseData() {
    return this.#responseData
  }

  async fetchBody(transitMode, parameters) {
    if (!parameters) parameters = {}
    this.addExpandData(parameters)
    let queryString = generateQueryString(parameters)
    let url = `/v3/departures/route_type/${transitMode}/stop/${this.#stopID}${queryString}`
    let body = await this.#api.apiCall(url)

    this.#responseData = body

    return body
  }

}