import { PTVAPIInterface } from "../ptv-api-interface.mjs"
import TransitDepartures from "../types/transit-departures.mjs"
import MetroDeparture from "./metro-departure.mjs"

export default class MetroDepartures extends TransitDepartures {

  responseData
  #api
  #stopID

  /**
   * Constructs a new MetroDepartures class used to store departures from a station
   * 
   * @param {PTVAPIInterface} apiInterface The PTV API Interface to use
   * @param {string} stopID The Stop ID to fetch departures from
   */
  constructor(apiInterface, stopID) {
    super(apiInterface, stopID)
    this.#api = apiInterface
    this.#stopID = stopID
  }

  /**
   * Fetches the departures from the PTV API and populates the instance with the departure data.
   * 
   * @param {dictionary} parameters The parameters passed to the PTV API
   */
  async fetch(parameters) {
    let body = await this.fetchBody(0, parameters)

    for (let departure of body.departures) {
      this.push(MetroDeparture.fromPTVData(this.#api,
        departure,
        this.getRoute(departure),
        this.getRun(departure),
        this.getDirection(departure),
        body.stops
      ))
    }
  }

}