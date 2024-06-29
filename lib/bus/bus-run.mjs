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
    super(runRef, destination, direction, position, description)
  }

  /**
   * Sets the vehicle (consist) data for the run
   * 
   * @param {dictionary} vehicle The raw PTV API vehicle data
   */
  setVehicle(vehicle) {
    if (vehicle.id.match(/^\d+$/)) {
      this.vehicle = {
        operator: vehicle.operator,
        smartrakID: parseInt(vehicle.id),
        dataSource: vehicle.supplier
      }
    }
  }

  /**
   * Constructs a new BusRun from the PTV API data
   * 
   * @param {dictionary} data The raw PTV API run data
   * @param {TransitDirection} direction The direction data
   * @returns {BusRun} A new BusRun instance with the associated data from the PTV API response
   */
  static fromPTVData(data, direction) {
    return new BusRun(data.run_ref, data.destination_name, direction, data.vehicle_position, data.vehicle_descriptor)
  }
}
