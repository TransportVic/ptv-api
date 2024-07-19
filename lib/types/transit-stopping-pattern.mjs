import { dateLikeToISO, parseISOTime } from "../date-utils.mjs"
import generateQueryString from './query-strings.mjs'

export default class TransitStoppingPattern {

  #responseData
  runData
  routeData
  stops
  #runRef
  #api

  constructor(apiInterfance, runRef) {
    this.#api = apiInterfance
    this.#runRef = runRef
  }

  setResponseData(data) {
    this.#responseData = data
  }

  getResponseData(data) {
    return this.#responseData
  }

  /**
   * 
   * @param {dictionary} parameters A list of parameters to be passed into the PTV API as follows:
   * -> date {Date} The time to fetch departures for
   * -> expand {Array[string]} A list of other data data to expand. Run, stop, route and direction will be expanded for all runs.
   * @returns 
   */
  // generateQueryString(parameters) {
  //   return generateQueryString(parameters)
  // }

  /**
   * Adds required expand data to the API parameters. Required in order to calculate certain values in the response.
   * @param {dictionary} parameters A raw list of parameters provided by the user
   */
  addExpandData(parameters) {
    if (typeof parameters.expand === 'undefined') parameters.expand = []
    if (!parameters.expand.includes('run')) parameters.expand.push('run')
    if (!parameters.expand.includes('stop')) parameters.expand.push('stop')
    if (!parameters.expand.includes('route')) parameters.expand.push('route')
    if (!parameters.expand.includes('direction')) parameters.expand.push('direction')
  }

  /**
   * Gets the raw run data from the PTV response
   * @returns {dictionary} The run data
   */
  getRun() {
    return this.getResponseData().runs[this.#runRef]
  }

  /**
   * Gets the raw route data from the PTV response
   * @returns {string} The route data
   */
  getRoute() {
    return this.getResponseData().routes[this.getRun().route_id]
  }

  /**
   * Gets the raw direction data from the PTV response
   * @returns {string} The direction data
   */
  getDirection() {
    return this.getResponseData().directions[this.getRun().direction_id]
  }

  /**
   * Gets the run flags
   * @returns {string} The flags from the first departure
   */
  getFlags() {
    return this.getResponseData().departures[0].flags
  }

  getStops() {
    let rawStops = this.getResponseData().departures
    let stopsData = this.getResponseData().stops

    return rawStops.filter((stop, i) => {
      let stopID = stop.stop_id

      return i === 0 || rawStops[i - 1].stop_id !== stopID
    }).map(stop => {
      let stopID = stop.stop_id
      let stopData = stopsData[stopID]

      let stopName = stopData.stop_name
      let suburb = stopData.stop_suburb

      let position = {
        type: "Point",
        coordinates: [
          stopData.stop_longitude,
          stopData.stop_latitude
        ]
      }

      let platform = stop.platform_number
      let scheduledDepartureTime = parseISOTime(stop.scheduled_departure_utc)
      let estimatedDepartureTime = null
      if (stop.estimated_departure_utc) estimatedDepartureTime = parseISOTime(stop.estimated_departure_utc)

      return {
        stopName,
        suburb,
        position,
          
        platform,
        scheduledDepartureTime,
        estimatedDepartureTime
      }
    })
  }

  /**
   * Fetches the stopping pattern of a given run reference.
   * @param {dictionary} parameters A list of API parameters.
   */
  async fetch(parameters) {

  }

  async fetchBody(transitMode, parameters) {
    if (!parameters) parameters = {}
    this.addExpandData(parameters)
    let queryString = generateQueryString(parameters)
    let url = `/v3/pattern/run/${this.#runRef}/route_type/${transitMode}${queryString}`
    let body = await this.#api.apiCall(url)

    this.setResponseData(body)

    return body
  }

}