import TransitInterface from "../types/transit-interface.mjs"
import { VLineAPIInterface } from "../vline-api-interface.mjs"
import { GetPlannedDisruptionsAPI, VLineDisruptions } from "./get-disruptions.mjs"
import { GetLocationsAPI, VLineLocations } from "./get-locations.mjs"

export default class VLineInterface extends TransitInterface {

  #api

  /**
   * Constructs a new V/Line API interface
   * 
   * @param {VLineAPIInterface} apiInterface An interface to the V/Line API
   */
  constructor(apiInterface) {
    super(apiInterface)
    this.#api = apiInterface
  }

 /**
  * Gets all V/Line locations available from V/Net
  * 
  * @returns {VLineLocations} A list of V/Line locations
  */
 async getAllLocations() {
    let locations = new GetLocationsAPI()
    return await locations.fetch(this.#api)
  }

  /**
   * Gets planned disruption data for a given line
   * 
   * @param {string} line The line code to retrieve disruptions for
   * @param {int} days The number of days worth of disruptions to retrieve
   * @param {boolean} includeProposed If proposed disruptions should be included
   * @returns {VLineDisruptions} A list of planned V/Line disruptions
   */
 async getPlannedDisruptions(line, days, includeProposed) {
    let disruptions = new GetPlannedDisruptionsAPI(line, days, includeProposed)
    return await disruptions.fetch(this.#api)
  }

}