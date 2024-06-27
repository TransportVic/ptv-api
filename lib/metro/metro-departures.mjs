import { PTVAPIInterface } from "../ptv-api-interface.mjs"
import TransitDepartures from "../types/transit-departures.mjs"
import MetroDeparture from "./metro-departure.mjs"

export default class MetroDepartures extends TransitDepartures {

  #responseData
  #api
  #stopID

  /**
   * Constructs a new MetroDepartures class used to store departures from a station
   * 
   * @param {PTVAPIInterface} apiInterface The PTV API Interface to use
   * @param {string} stopID The Stop ID to fetch departures from
   */
  constructor(apiInterface, stopID) {
    super()
    this.#api = apiInterface
    this.#stopID = stopID
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
   * Fetches the departures from the PTV API and populates the instance with the departure data.
   * 
   * @param {dictionary} parameters The parameters passed to the PTV API
   */
  async fetch(parameters) {
    if (!parameters) parameters = {}
    this.addExpandData(parameters)
    let queryString = this.generateQueryString(parameters)
    let url = `/v3/departures/route_type/0/stop/${this.#stopID}${queryString}`
    let body = await this.#api.apiCall(url)

    this.#responseData = body
    for (let departure of body.departures) {
      this.push(MetroDeparture.fromPTVData(this.#api, departure, this.getRoute(departure), this.getRun(departure), this.getDirection(departure)))
    }
  }

}