import { parseISOTime } from "../date-utils.mjs"

export default class TransitRun {

  runRef
  destination
  direction
  position = null
  vehicle = null
  cancelled = false

  /**
   * Constructs a new TransitRun instance
   * 
   * @param {string} runRef The PTV API run reference of the run.
   * @param {string} destination The destination of the run
   * @param {dictionary} direction Direction data of the trip
   * @param {dictionary} position The current position of the train as a GeoJSON feature, if available
   * @param {dictionary} description Specific consist data for the trip, if available
   */
  constructor(runRef, destination, direction, position, description) {
    this.runRef = runRef
    this.destination = destination
    this.direction = direction

    if (position) this.setPosition(position)
    if (description && description.id) this.setVehicle(description)
  }

  /**
   * Sets the position data of the run
   * 
   * @param {dictionary} position The raw PTV API position data
   */
  setPosition(position) {
    this.position = {
      type: "Feature",
      properties: {
        bearing: position.bearing,
        positionTime: parseISOTime(position.datetime_utc),
        expiry: parseISOTime(position.expiry_time)
      },
      geometry: {
        type: "Point",
        coordinates: [
          position.longitude,
          position.latitude
        ]
      }
    }
  }

  /**
   * Sets the vehicle (consist) data for the run
   * 
   * @param {dictionary} vehicle The raw PTV API vehicle data
   */
  setVehicle(vehicle) {
    this.vehicle = {
      operator: vehicle.operator,
      id: vehicle.id,
      description: vehicle.description,
      lowFloor: vehicle.low_floor,
      airConditioned: vehicle.air_conditioned,
      length: vehicle.length,
      dataSource: vehicle.supplier
    }
  }

  /**
   * Constructs a new TransitRun from the PTV API data
   * 
   * @param {dictionary} data The raw PTV API run data
   * @param {TransitDirection} direction The direction data
   * @returns A new TransitRun instance with the associated data from the PTV API response
   */
  static fromPTVData(data, direction) {
    let run = new TransitRun(data.run_ref, data.destination_name, direction, data.vehicle_position, data.vehicle_descriptor)
    if (data.status === 'cancelled') run.cancelled = true
    return run
  }

}