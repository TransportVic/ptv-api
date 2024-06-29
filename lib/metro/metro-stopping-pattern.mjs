import TransitStoppingPattern from "../types/transit-stopping-pattern.mjs"
import MetroLine from "./metro-line.mjs"
import MetroRun from "./metro-run.mjs"
import MetroUtils from "./metro-utils.mjs"
import CITY_CIRCLE_ROUTE from './metro-data/city-circle.route.json' assert { type: 'json' }
import { PTVAPIInterface } from "../ptv-api-interface.mjs"

export default class MetroStoppingPattern extends TransitStoppingPattern {

  #responseData
  #api
  #runRef

  /**
   * Constructs a new MetroStoppingPattern instance
   * 
   * @param {PTVAPIInterface} apiInterface The PTV API Interface to use
   * @param {string} runRef The run reference for the trip
   */
  constructor(apiInterface, runRef) {
    super()
    this.#api = apiInterface
    this.#runRef = runRef
  }

  /**
   * Gets the raw run data from the PTV response
   * @returns {dictionary} The run data
   */
  #getRun() {
    return this.#responseData.runs[this.#runRef]
  }

  /**
   * Gets the raw route data from the PTV response
   * @returns {string} The route data
   */
  #getRoute() {
    let routeID = this.#getRun().route_id
    if (routeID === 99) return CITY_CIRCLE_ROUTE

    return this.#responseData.routes[routeID]
  }

  /**
   * Gets the raw direction data from the PTV response
   * @returns {string} The direction data
   */
  #getDirection() {
    return this.#responseData.directions[this.#getRun().direction_id]
  }

  /**
   * Gets the run flags
   * @returns {string} The flags from the first departure
   */
  #getFlags() {
    return this.#responseData.departures[0].flags
  }

  /**
   * Sets the MetroRun data for this trip
   */
  extractRunData() {
    let direction = this.#getDirection()

    let metroDirection = MetroUtils.createDirection(this.routeData, direction.direction_id, direction.direction_name)

    this.runData = MetroRun.fromPTVData(this.#getRun(), this.#getFlags(), this.routeData, metroDirection)
  }

  /**
   * Processes the stop data for this trip as as series of `MetroTripStop`s
   */
  processStops() {
    let rawStops = this.#responseData.departures
    let stopData = this.#responseData.stops
    this.stops = rawStops.map((stop, i) => {
      let stopID = stop.stop_id
      let stationData = stopData[stopID]

      if (i > 0 && rawStops[i - 1].stop_id === stopID) return null

      let stationName = stationData.stop_name
      let platform = stop.platform_number
      let scheduledDepartureTime = new Date(stop.scheduled_departure_utc)
      let estimatedDepartureTime = null
      if (stop.estimated_departure_utc) estimatedDepartureTime = new Date(stop.estimated_departure_utc)

      return new MetroTripStop(stationName, platform, scheduledDepartureTime, estimatedDepartureTime)
    }).filter(Boolean)
  }

  /**
   * Fetches the stopping pattern data from the PTV API
   * 
   * @param {dictionary} parameters The PTV API parameter
   */
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
  scheduledDeparture
  estimatedDeparture

  constructor(stationName, platform, scheduledDepartureTime, estimatedDepartureTime) {
    this.stationName = stationName
    this.platform = platform
    this.scheduledDeparture = scheduledDepartureTime
    this.estimatedDeparture = estimatedDepartureTime
  }

}