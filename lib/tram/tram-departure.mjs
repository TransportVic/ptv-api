import { parseMSTime } from "../date-utils.mjs"
import { TramTrackerAPIInterface } from "../tramtracker-api-interface.mjs"
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
   * @param {TramPrediction} departure The raw TramTracker departure data
   * @returns {Date} The scheduled departure time
   */
  static getScheduledTime(departure) {
    return parseMSTime(TramTrackerAPIInterface.parseDateMS(departure.Schedule))
  }

  /**
   * Calculates the estimated departure time of a tram.
   * 
   * Formula: AVMTime + Prediction * 1000
   * 
   * @param {TramPrediction} departure The raw TramTracker departure data
   * @returns {Date} The estimated departure time
   */
  static getEstimatedTime(departure) {
    let avmTimeMS = TramTrackerAPIInterface.parseDateMS(departure.AVMTime)
    let prediction = departure.Prediction

    return parseMSTime(avmTimeMS + prediction * 1000)
  }

  /**
   * Gets the public facing route number, as shown on the tram's destination signage
   * 
   * @param {TramPrediction} departure The raw TramTracker departure data
   * @returns {string} The route number
   */
  static getRouteNumber(departure) {
    return departure.HeadBoardRouteNo
  }

  /**
   * Constructs a new TramDeparture instance from the TramTracker API response
   * 
   * @param {TramPrediction} departure The raw TramTracker departure data
   * @returns {TramDeparture} A TramDeparture instance based on the data provided
   */
  static fromTramTrackerData(departure) {
    let tramRoute = new TramRoute(this.getRouteNumber(departure))
    let tramRun = TramRun.fromTramTrackerData(departure)

    return new TramDeparture(
      tramRoute,
      tramRun,
      this.getScheduledTime(departure),
      this.getEstimatedTime(departure)
    )
  }

}