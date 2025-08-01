import { PTVAPIInterface } from '../ptv-api-interface.mjs'
import TransitInterface from '../types/transit-interface.mjs'
import MetroDepartures from './metro-departures.mjs'
import MetroRuns from './metro-runs.mjs'
import MetroStoppingPattern from './metro-stopping-pattern.mjs'
import MetroUtils from './metro-utils.mjs'

export default class MetroInterface extends TransitInterface {

  #api

  /**
   * Constructs a new Metro API interface
   * @param {PTVAPIInterface} apiInterface An interface to the PTV API
   */
  constructor(apiInterface) {
    super(apiInterface)
    this.#api = apiInterface
  }

 /**
  * 
  * @param {string} stopID The Stop ID of the stop to fetch departures for. Could be a PTV API ID or a customer facing GTFS ID.
  * @param {dictionary} parameters A list of departure paremeters as specified in the TransitDepartures class.
  * @returns {Promise<MetroDepartures>} A list of metro departures from the station
  */
  async getDepartures(stopID, parameters) {
    let departures = new MetroDepartures(this.#api, stopID)
    await departures.fetch(parameters)
    
    return departures
  }

  /**
   * Fetches the stopping pattern of a given TDN.
   * @param {string} tdn The TDN to fetch the stopping pattern for.
   * @param {dictionary} parameters A list of API parameters.
   * @returns {Promise<MetroStoppingPattern>} The stopping pattern of the train, or null if the TDN is invalid
   */
  async getStoppingPatternFromTDN(tdn, parameters) {
    let runRef = MetroUtils.getRunRefFromTDN(tdn)
    if (!runRef) return null
    let pattern = await this.getStoppingPatternFromRunRef(runRef, parameters)
    if (!pattern.valid) return null
    return pattern
  }

  /**
   * Fetches the stopping pattern of a given run reference.
   * @param {string} runRef The run reference to fetch the stopping pattern for.
   * @param {dictionary} parameters A list of API parameters.
   * @returns {Promise<MetroStoppingPattern>} The stopping pattern of the train, or null if the run reference is invalid
   */
  async getStoppingPatternFromRunRef(runRef, parameters) {
    let stoppingPattern = new MetroStoppingPattern(this.#api, runRef)
    await stoppingPattern.fetch(parameters)

    return stoppingPattern
  }

  /**
   * Returns a list of all runs on a route for today.
   * 
   * @param {number} routeID The PTV API Route ID
   * @param {dictionary} parameters A list of API parameters.
   * @returns {Promise<MetroRuns>} A list of runs on the specified line.
   */
  async getRouteRuns(routeID, parameters) {
    let runs = new MetroRuns(this.#api, routeID)
    await runs.fetch(parameters)

    return runs
  }
}