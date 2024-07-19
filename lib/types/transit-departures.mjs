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