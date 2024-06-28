import TransitRun from "../types/transit-run.mjs"

export default class BusRun extends TransitRun {

  /**
   * Constructs a new BusRun instance
   * 
   * @param {string} runRef The PTV API run reference of the run.
   * @param {string} destination The destination of the run
   * @param {dictionary} direction Direction data of the trip
   * @param {dictionary} position The current position of the train as a GeoJSON feature, if available
   * @param {dictionary} description Specific consist data for the trip, if available
   */
  constructor(runRef, destination, direction, position, description) {
    super(runRef, destination, position, description)
    this.direction = direction
  }
}
