import TransitDeparture from "../types/transit-departure.mjs"
import MetroLine from "./metro-line.mjs"
import MetroRun from "./metro-run.mjs"
import cityStations from './metro-data/city-stations.json' assert { type: 'json' }
import MetroUtils from "./metro-utils.mjs"
import CITY_CIRCLE_ROUTE from './metro-data/city-circle.route.json' assert { type: 'json' }
import MetroStoppingPattern from "./metro-stopping-pattern.mjs"

export default class MetroDeparture extends TransitDeparture {

  platform
  useFormedByData
  #departureStop
  #api

  /**
   * Constructs a new Metro departure
   * 
   * @param {PTVAPIInterface} apiInterface An instance of a PTV API Interface
   * @param {MetroLine} routeData The Metro line for this departure
   * @param {MetroRun} runData The Metro run data for this departure
   * @param {Date} scheduledDepartureTime The scheduled departure time
   * @param {Date} estimatedDepartureTime The estimated departure time, if available. Null otherwise
   * @param {string} departureStop The name of the stop this departure is from
   * @param {string} platform The platform this departure is from, if available. Null otherwise
   */
  constructor(apiInterface, routeData, runData, scheduledDepartureTime, estimatedDepartureTime, departureStop, platform) {
    super(routeData, runData, scheduledDepartureTime, estimatedDepartureTime)

    this.#api = apiInterface

    this.platform = platform
    this.#departureStop = departureStop

    this.correctStationName()
    this.correctPlatform()

    this.useFormedByData = this.isFormingTrainInLoop()

    if (this.useFormedByData) {
      this.runData.updateToFormedBy()
    }

  }

  /**
   * Checks if the departure is from the city loop, and if the train is showing the next trip.
   * 
   * More specifically, this is when an Up Via Loop train is shown as the next Down Direct train when viewed from the City Loop.
   * 
   * @returns {boolean} True if the criteria above is specified
   */
  isFormingTrainInLoop() {
    let isInLoop = cityStations.loop.includes(this.#departureStop)

    if (!isInLoop) return false

    let lineGroup = this.runData.getLineGroup()

    /// NOR Direct trains at SSS are the exception to this
    if (this.#departureStop === 'Southern Cross' && lineGroup === 'northern') {
      // NME -> SSS 13 (this one) -> FSS -> SSS 14 -> NME
      return this.platform === '13' && this.runData.direction.railDirection === 'Down'
    }

    return this.runData.viaCityLoop == false
  }

  /**
   * Corrects the station name. Required for Jolimont and St. Albans
   */
  correctStationName() {
    this.#departureStop = MetroUtils.correctStationName(this.#departureStop)
  }

  /**
   * Corrects the platform number. Required for Flemington Racecourse
   */
  correctPlatform() {
    this.platform = MetroUtils.correctPlatform(this.#departureStop, this.platform)
  }

  /**
   * Constructs a new MetroDeparture instance from the PTV API response 
   * 
   * @param {PTVAPIInterface} apiInterface The PTV API Interface to use
   * @param {dictionary} departure The raw departure data from the PTV API
   * @param {dictionary} route The raw route data from the PTV API
   * @param {dictionary} run The raw run data from the PTV API
   * @param {dictionary} direction The raw direction data from the PTV API
   * @param {dictionary} stops The raw stop data from the PTV API
   * @returns {MetroDeparture} A MetroDeparture instance based on the data provided
   */
  static fromPTVData(apiInterface, departure, route, run, direction, stops) {
    if (departure.route_id === 99) route = CITY_CIRCLE_ROUTE

    let metroLine = MetroLine.fromPTVData(route)
    let metroDirection = MetroUtils.createDirection(metroLine, direction.direction_id, direction.direction_name)

    let metroRun = MetroRun.fromPTVData(run, departure.flags, metroLine, metroDirection)
    let stopName = stops[departure.stop_id].stop_name.trim()

    return new MetroDeparture(
      apiInterface,
      metroLine,
      metroRun,
      departure.scheduled_departure_utc,
      departure.estimated_departure_utc,
      stopName,
      departure.platform_number,
      metroDirection
    )
  }

  /**
   * Convenience function to the stopping pattern data for the departure
   * 
   * @param {dictionary} parameters The API parameters for the stopping pattern data
   * @returns {MetroStoppingPattern} The stopping pattern of the departure
   */
  async getStoppingPattern(parameters) {
    let stoppingPattern = new MetroStoppingPattern(this.#api, this.runData.runRef)
    await stoppingPattern.fetch(parameters)
    return stoppingPattern
  }
}