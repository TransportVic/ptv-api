import TransitDepartures from "../types/transit-departures.mjs"
import TramDeparture from "./tram-departure.mjs"

export default class TramDepartures extends TransitDepartures {

  responseData
  #api
  #stopID

  /**
   * Constructs a new TramDepartures class used to store departures from a tram stop
   * 
   * @param {TramTrackerAPIInterface} apiInterface The TramTracker API Interface to use
   * @param {string} stopID The Stop ID to fetch departures from
   */
  constructor(apiInterface, stopID) {
    super(apiInterface, stopID)
    this.#api = apiInterface
    this.#stopID = stopID
  }

  /**
   * Gets the API URL for a given set of parameters
   * 
   * @param {dictionary} parameters Parameters for retrieving the departure data
   * @returns {string} The path of the API URL
   */
  getAPIURL(parameters) {
    if (!parameters) parameters = {}
    let route = parameters.route || '0'
    let lowFloorOnly = parameters.lowFloorOnly || false

    return `GetPredictionsCollection/${this.#stopID}/${route}/${lowFloorOnly}`
  }

  /**
   * Fetches the departures from the TramTracker API and populates the instance with the departure data.
   * 
   * @param {dictionary} parameters The parameters passed to the PTV API
   */
  async fetch(parameters) {
    let path = this.getAPIURL(parameters)
    let body = await this.#api.apiCall(path)

    for (let departure of body.responseObject) {
      let tramDeparture = TramDeparture.fromTramTrackerData(departure)

      this.push(tramDeparture)
    }

    return body
  }

}