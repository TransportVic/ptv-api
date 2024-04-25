export default class TransitDeparture {

  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, platform) {
    this.routeData = routeData
    this.runData = runData
    
    this.scheduledDepartureTime = new Date(scheduledDepartureTime)

    if (estimatedDepartureTime) {
      this.estimatedDepartureTime = new Date(estimatedDepartureTime)
      this.actualDepartureTime = this.estimatedDepartureTime
    } else {
      this.estimatedDepartureTime = null
      this.actualDepartureTime = this.scheduledDepartureTime
    }

    this.platform = platform
  }

}