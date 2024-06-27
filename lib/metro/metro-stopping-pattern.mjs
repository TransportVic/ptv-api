import TransitStoppingPattern from "../types/transit-stopping-pattern.mjs"
import MetroLine from "./metro-line.mjs"
import MetroRun from "./metro-run.mjs"
import MetroUtils from "./metro-utils.mjs"
import CITY_CIRCLE_ROUTE from './metro-data/city-circle.route.json' assert { type: 'json' }

export default class MetroStoppingPattern extends TransitStoppingPattern {

  #responseData
  #api
  #runRef

  constructor(apiInterface, runRef) {
    super()
    this.#api = apiInterface
    this.#runRef = runRef
  }

  #getRun() {
    return this.#responseData.runs[this.#runRef]
  }
  
  #getRoute() {
    let routeID = this.#getRun().route_id
    if (routeID === 99) return CITY_CIRCLE_ROUTE

    return this.#responseData.routes[routeID]
  }

  #getDirection() {
    return this.#responseData.directions[this.#getRun().direction_id]
  }

  #getFlags() {
    return this.#responseData.departures[0].flags
  }

  extractRunData() {
    let direction = this.#getDirection()

    let metroDirection = MetroUtils.addRailDirection(this.routeData, {
      directionID: direction.direction_id,
      directionName: direction.direction_name,
    })

    this.runData = MetroRun.fromPTVData(this.#getRun(), this.#getFlags(), this.routeData, metroDirection)
  }

  processStops() {
    let rawStops = this.#responseData.departures
    let stopData = this.#responseData.stops
    this.stops = rawStops.map(stop => {
      let stopID = stop.stop_id
      let stationData = stopData[stopID]

      let stationName = stationData.stop_name
      let platform = stop.platform_number
      let scheduledDepartureTime = new Date(stop.scheduled_departure_utc)
      let estimatedDepartureTime = null
      if (stop.estimated_departure_utc) estimatedDepartureTime = new Date(stop.estimated_departure_utc)

      return new MetroTripStop(stationName, platform, scheduledDepartureTime, estimatedDepartureTime)
    })
  }

  async fetch(parameters) {
    if (!parameters) parameters = {}
    this.addExpandData(parameters)
    let queryString = this.generateQueryString(parameters)
    let url = `/v3/pattern/run/${this.#runRef}/route_type/0${queryString}`
    let body = await this.#api.apiCall(url)

    this.#responseData = body

    this.routeData = MetroLine.fromPTVData(this.#getRoute())

    this.extractRunData()
    this.processStops()
  }
}

class MetroTripStop {

  stationName
  platform
  scheduledDepartureTime
  estimatedDepartureTime

  constructor(stationName, platform, scheduledDepartureTime, estimatedDepartureTime) {
    this.stationName = stationName
    this.platform = platform
    this.scheduledDepartureTime = scheduledDepartureTime
    this.estimatedDepartureTime = estimatedDepartureTime
  }

}