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
  #api

  constructor(apiInterface, routeData, runData, scheduledDepartureTime, estimatedDepartureTime, departureStopID, platform) {
    super(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, departureStopID)

    this.#api = apiInterface

    this.platform = platform
    this.useFormedByData = this.isFormingTrainInLoop()

    if (this.useFormedByData) {
      this.runData.updateToFormedBy()
    }
  }

  isFormingTrainInLoop() {
    let isInLoop = cityStations.loopStopIDs.includes(this.departureStopID)
    if (!isInLoop) return false

    return this.runData.viaCityLoop == false
  }

  static fromPTVData(apiInterface, departure, route, run, direction) {
    if (departure.route_id === 99) route = CITY_CIRCLE_ROUTE

    let metroLine = MetroLine.fromPTVData(route)
    let metroDirection = MetroUtils.addRailDirection(metroLine, {
      directionID: direction.direction_id,
      directionName: direction.direction_name,
    })

    let metroRun = MetroRun.fromPTVData(run, departure.flags, metroLine, metroDirection)

    return new MetroDeparture(
      apiInterface,
      metroLine,
      metroRun,
      departure.scheduled_departure_utc,
      departure.estimated_departure_utc,
      departure.stop_id,
      departure.platform_number,
      metroDirection
    )
  }

  async getStoppingPattern(parameters) {
    let stoppingPattern = new MetroStoppingPattern(this.#api, this.runData.runRef)
    await stoppingPattern.fetch(parameters)
    return stoppingPattern
  }
}