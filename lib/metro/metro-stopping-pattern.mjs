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
    let metroLine = MetroLine.fromPTVData(this.#getRoute())
    let direction = this.#getDirection()

    let metroDirection = MetroUtils.addRailDirection(metroLine, {
      directionID: direction.direction_id,
      directionName: direction.direction_name,
    })

    return MetroRun.fromPTVData(this.#getRun(), this.#getFlags(), metroLine, metroDirection)
  }

  async fetch(parameters) {
    if (!parameters) parameters = {}
    this.addExpandData(parameters)
    let queryString = this.generateQueryString(parameters)
    let url = `/v3/pattern/run/${this.#runRef}/route_type/0${queryString}`
    let body = await this.#api.apiCall(url)

    this.#responseData = body    
  }
}