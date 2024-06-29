import TransitDepartures from "../types/transit-departures.mjs"
import BusDeparture from "./bus-departure.mjs"

export default class BusDepartures extends TransitDepartures {

  responseData
  #api
  #stopID


  /**
   * Constructs a new BusDepartures class used to store departures from a bus stop
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
      let busDeparture = BusDeparture.fromPTVData(this.#api, departure, this.getRoute(departure), this.getRun(departure), this.getDirection(departure))

      // Filter out combined routes such as the 4-C17 802-804-862 combined
      if (busDeparture.routeData.isCombinedRoute()) continue

      this.push(busDeparture)
    }
  }
}