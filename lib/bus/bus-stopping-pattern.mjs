import TransitDirection from "../types/transit-direction.mjs"
import TransitStoppingPattern from "../types/transit-stopping-pattern.mjs"
import BusRoute from "./bus-route.mjs"
import BusRun from "./bus-run.mjs"

export default class BusStoppingPattern extends TransitStoppingPattern {

  #responseData
  #api
  #runRef

  /**
   * Constructs a new BusStoppingPattern instance
   * 
   * @param {PTVAPIInterface} apiInterface The PTV API Interface to use
   * @param {string} runRef The run reference for the trip
   */
  constructor(apiInterface, runRef) {
    super(apiInterface, runRef)
    this.#api = apiInterface
    this.#runRef = runRef
  }

  /**
   * Sets the BusRun data for this trip
   */
  extractRunData() {
    let direction = this.getDirection()

    let busDirection = new TransitDirection(direction.direction_id, direction.direction_name)

    this.runData = BusRun.fromPTVData(this.getRun(), busDirection)
  }

  /**
   * Processes the stop data for this trip as as series of `BusTripStop`s
   */
  processStops() {
    let stopData = this.getStops()
    this.stops = stopData.map(stop => {
      let {stopName, suburb, position, scheduledDepartureTime, estimatedDepartureTime} = stop

      return new BusTripStop(stopName, suburb, position, scheduledDepartureTime, estimatedDepartureTime)
    })
  }

  /**
   * Fetches the stopping pattern data from the PTV API
   * 
   * @param {dictionary} parameters The PTV API parameter
   */
  async fetch(parameters) {
    await this.fetchBody(2, parameters)

    this.routeData = BusRoute.fromPTVData(this.getRoute())

    this.extractRunData()
    this.processStops()
  }

}

class BusTripStop {

  stationName
  suburb
  position
  scheduledDeparture
  estimatedDeparture

  constructor(stationName, suburb, position, scheduledDepartureTime, estimatedDepartureTime) {
    this.stationName = stationName.trim()
    this.suburb = suburb
    this.position = position
    this.scheduledDeparture = scheduledDepartureTime
    this.estimatedDeparture = estimatedDepartureTime
  }

}