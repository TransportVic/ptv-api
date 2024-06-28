import { PTVAPIInterface } from '../ptv-api-interface.mjs'
import TransitDepartures from './transit-departures.mjs'
import TransitStoppingPattern from './transit-stopping-pattern.mjs'

export default class TransitInterface {

  #api

  /**
   * Constructs a new Transit data interface
   * @param {PTVAPIInterface} apiInterface An interface to the PTV API
   */
  constructor(apiInterface) {
    this.#api = apiInterface
  }

 /**
  * 
  * @param {string} stopID The Stop ID of the stop to fetch departures for. Could be a PTV API ID or a customer facing GTFS ID.
  * @param {dictionary} parameters A list of departure paremeters as specified in the TransitDepartures class.
  * @returns {TransitDepartures} A list of transit departures from the station
  */
  async getDepartures(stopID, parameters) {
  }


  /**
   * Fetches the stopping pattern of a given run reference.
   * @param {string} runRef The run reference to fetch the stopping pattern for.
   * @param {dictionary} parameters A list of API parameters.
   * @returns {TransitStoppingPattern} The stopping pattern of the trip, or null if the run reference is invalid
   */
  async getStoppingPatternFromRunRef(runRef, parameters) {
  }

}