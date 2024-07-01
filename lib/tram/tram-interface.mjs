import { TramTrackerAPIInterface } from "../tramtracker-api-interface.mjs"
import TransitInterface from "../types/transit-interface.mjs"
import TramDepartures from "./tram-departures.mjs"

export default class TramInterface extends TransitInterface {

  #api

  /**
   * Constructs a new TramTracker API interface
   * @param {TramTrackerAPIInterface} apiInterface An interface to the TramTracker API
   */
  constructor(apiInterface) {
    super(apiInterface)
    this.#api = apiInterface
  }

 /**
  * 
  * @param {string} stopID The Stop ID of the stop to fetch departures for. This is a TramTracker stop ID, which is different from a stop GTFS ID.
  * @param {dictionary} parameters A list of departure paremeters.
  * @returns {TramDepartures} A list of transit departures from the station.
  */
 async getDepartures(stopID, parameters) {
    let departures = new TramDepartures(this.#api, stopID)
    await departures.fetch(parameters)

    return departures
  }

}