export default class TransitDeparture {

  /**
   * Constructs a new TransitDeparture instance
   * 
   * @param {TransitRoute} routeData The route name for this departure
   * @param {TransitRun} runData The run data for this departure
   * @param {Date} scheduledDepartureTime The scheduled departure time
   * @param {Date} estimatedDepartureTime The estimated departure time, if available. Null otherwise
   * @param {string} departureStopID The PTV API Stop ID this departure is from
   */
  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, departureStopID) {
    this.routeData = routeData
    this.runData = runData
    this.departureStopID = departureStopID.toString()
    
    this.scheduledDeparture = new Date(scheduledDepartureTime)

    if (estimatedDepartureTime) {
      this.estimatedDeparture = new Date(estimatedDepartureTime)
      this.actualDeparture = this.estimatedDeparture
    } else {
      this.estimatedDeparture = null
      this.actualDeparture = this.scheduledDeparture
    }
  }

}