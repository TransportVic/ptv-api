export default class TransitDeparture {

  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, departureStopID) {
    this.routeData = routeData
    this.runData = runData
    this.departureStopID = departureStopID.toString()
    
    this.scheduledDepartureTime = new Date(scheduledDepartureTime)

    if (estimatedDepartureTime) {
      this.estimatedDepartureTime = new Date(estimatedDepartureTime)
      this.actualDepartureTime = this.estimatedDepartureTime
    } else {
      this.estimatedDepartureTime = null
      this.actualDepartureTime = this.scheduledDepartureTime
    }
  }

}