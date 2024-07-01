import TransitRun from "../types/transit-run.mjs"

export default class TramRun extends TransitRun {

  runNumber

  /**
   * Constructs a new BusRun instance
   * 
   * @param {string} runRef The run reference of the run.
   * @param {string} destination The destination of the run
   * @param {string} runNumber The run number of the trip.
   * @param {dictionary} position The current position of the train as a GeoJSON feature, if available
   * @param {dictionary} description Specific consist data for the trip, if available
   */
  constructor(runRef, destination, runNumber, position, description) {
    super(runRef, destination, null, position, description)
    this.runNumber = runNumber
  }

  setVehicle(vehicle) {
    this.vehicle = vehicle
  }

}