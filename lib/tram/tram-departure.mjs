import TransitDeparture from "../types/transit-departure.mjs"
import TramRoute from "./tram-route.mjs"
import TramRun from "./tram-run.mjs"

export default class TramDeparture extends TransitDeparture {

  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime) {
    super(routeData, runData, scheduledDepartureTime, estimatedDepartureTime)
  }

  /**
   * Gets the scheduled departure time of a tram.
   * 
   * @param {PredictionsCollection} departure The raw TramTracker response
   * @returns {Date} The scheduled departure time
   */
  static getScheduledTime(departure) {
    return new Date(departure.Schedule)
  }

  /**
   * Calculates the estimated departure time of a tram.
   * 
   * Formula: AVMTime + Prediction * 1000
   * 
   * @param {PredictionsCollection} departure The raw TramTracker response
   * @returns {Date} The estimated departure time
   */
  static getEstimatedTime(departure) {
    let avmTimeMS = +new Date(departure.AVMTime)
    let prediction = departure.Prediction

    return new Date(avmTimeMS + prediction * 1000)
  }

  static getDestination(departure) {
    return departure.Destination
  }

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

  static getRouteNumber(departure) {
    return departure.HeadBoardRouteNo
  }

  static getRunNumber(departure) {
    return departure.RunNo.trim()
  }

  static fromTramTrackerData(departure) {
    let tramRoute = new TramRoute(this.getRouteNumber(departure))
    let tramRun = new TramRun(
      null,
      this.getDestination(departure),
      this.getRunNumber(departure),
      null,
      this.getVehicleData(departure)
    )

    return new TramDeparture(tramRoute, tramRun)
  }

}