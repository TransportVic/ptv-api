import { PTVAPIInterface } from "../ptv-api-interface.mjs"
import TransitInterface from "../types/transit-interface.mjs"
import BusDepartures from "./bus-departures.mjs"

export default class BusInterface extends TransitInterface {

  #api

  /**
   * Constructs a new PTV Bus data interface
   * 
   * @param {PTVAPIInterface} apiInstance An interface to the PTV API
   */
  constructor(apiInstance) {
    this.#api = apiInstance
  }

  async getDepartures(stopID, parameters) {
    let departures = new BusDepartures(this.#api, stopID)
    await departures.fetch(parameters)

    return departures
  }

}