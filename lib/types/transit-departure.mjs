import { parseISOTime } from "../date-utils.mjs"

export default class TransitDeparture {

  routeData
  runData
  scheduledDeparture
  estimatedDeparture
  actualDeparture

  /**
   * Constructs a new TransitDeparture instance
   * 
   * @param {TransitRoute} routeData The route name for this departure
   * @param {TransitRun} runData The run data for this departure
   * @param {Date} scheduledDepartureTime The scheduled departure time
   * @param {Date} estimatedDepartureTime The estimated departure time, if available. Null otherwise
   */
  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime) {
    this.routeData = routeData
    this.runData = runData
    
    this.scheduledDeparture = parseISOTime(scheduledDepartureTime)

    if (estimatedDepartureTime) {
      this.estimatedDeparture = parseISOTime(estimatedDepartureTime)
      this.actualDeparture = this.estimatedDeparture
    } else {
      this.estimatedDeparture = null
      this.actualDeparture = this.scheduledDeparture
    }
  }

}