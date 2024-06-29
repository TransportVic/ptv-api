import TransitStoppingPattern from "../types/transit-stopping-pattern.mjs"

export default class BusStoppingPattern extends TransitStoppingPattern {

  #responseData
  #api
  #runRef

  /**
   * Constructs a new BusStoppingPattern instance
   * 
   * @param {PTVAPIInterface} apiInterface The PTV API Interface to use
   * @param {string} runRef The run reference for the trip
   */
  constructor(apiInterface, runRef) {
    super(runRef)
    this.#api = apiInterface
    this.#runRef = runRef
  }

  async fetch() {

  }

}