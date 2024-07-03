import TransitInterface from "../types/transit-interface.mjs"
import { VLineAPIInterface } from "../vline-api-interface.mjs"
import { GetLocationsAPI } from "./get-locations.mjs"

export default class VLineInterface extends TransitInterface {

  #api

  /**
   * Constructs a new V/Line API interface
   * @param {VLineAPIInterface} apiInterface An interface to the V/Line API
   */
  constructor(apiInterface) {
    super(apiInterface)
    this.#api = apiInterface
  }

 /**
  * 
  * @param {string} stopID The Stop ID of the stop to fetch departures for. This is a V/Line stop ID, which is different from a stop GTFS ID.
  * @param {dictionary} parameters A list of departure paremeters.
  * @returns {TramDepartures} A list of transit departures from the station.
  */
 async getAllLocations() {
    let locations = new GetLocationsAPI()
    return await locations.fetch(this.#api)
  }

}