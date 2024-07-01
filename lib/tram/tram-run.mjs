import TransitRun from "../types/transit-run.mjs"

export default class TramRun extends TransitRun {

  runNumber

  /**
   * Constructs a new Tram instance
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

  /**
   * Sets the tram run's vehicle data
   * 
   * @param {dictionary} vehicle The vehicle data
   */
  setVehicle(vehicle) {
    this.vehicle = vehicle
  }

  /**
   * Gets the destination of a tram
   * 
   * @param {TramPrediction} departure The raw TramTracker departure data
   * @returns {string} The tram's destination
   */
  static getDestination(departure) {
    return departure.Destination
  }

  /**
   * Gets the vehicle data of a tram
   * 
   * @param {TramPrediction} departure The raw TramTracker departure data
   * @returns {dictionary} The tram's vehicle data, or null if unavailable
   */
  static getVehicleData(departure) {
    if (departure.VehicleNo === 0) return null

    return {
      operator: 'Yarra Trams',
      id: departure.VehicleNo,
      lowFloor: departure.LowFloor,
      airConditioned: departure.DisplayAirCondition,
      dataSource: 'TramTracker'
    }
  }

  /**
   * Gets the run number of a tram
   * 
   * @param {TramPrediction} departure The raw TramTracker departure data
   * @returns {string} The tram's run number
   */
  static getRunNumber(departure) {
    return departure.RunNo.trim()
  }

  /**
   * Constructs a TramRun instance from the TramTracker API response
   * 
   * @param {TramPrediction} departure The raw TramTracker departure data
   * @returns {TramRun} A TramRun instance based on the data provided
   */
  static fromTramTrackerData(departure) {
    return new TramRun(
      null,
      this.getDestination(departure),
      this.getRunNumber(departure),
      null,
      this.getVehicleData(departure)
    )
  }

}