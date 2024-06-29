import { PTVAPIInterface } from "../ptv-api-interface.mjs"
import TransitInterface from "../types/transit-interface.mjs"
import BusDepartures from "./bus-departures.mjs"
import BusStoppingPattern from "./bus-stopping-pattern.mjs"

export default class BusInterface extends TransitInterface {

  #api

  /**
   * Constructs a new PTV Bus data interface
   * 
   * @param {PTVAPIInterface} apiInstance An interface to the PTV API
   */
  constructor(apiInstance) {
    super(apiInstance)
    this.#api = apiInstance
  }

  async getDepartures(stopID, parameters) {
    let departures = new BusDepartures(this.#api, stopID)
    await departures.fetch(parameters)

    return departures
  }

  /**
   * Fetches the stopping pattern of a given run reference.
   * @param {string} runRef The run reference to fetch the stopping pattern for.
   * @param {dictionary} parameters A list of API parameters.
   * @returns {BusStoppingPattern} The stopping pattern of the trip, or null if the run reference is invalid
   */
  async getStoppingPatternFromRunRef(runRef, parameters) {
    let stoppingPattern = new BusStoppingPattern(this.#api, runRef)
    await stoppingPattern.fetch(parameters)

    return stoppingPattern
  }

}