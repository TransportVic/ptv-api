import TransitDeparture from "../types/transit-departure.mjs"
import MetroLine from "./metro-line.mjs"
import MetroRun from "./metro-run.mjs"
import cityStations from './metro-data/city-stations.json' assert { type: 'json' }

export default class MetroDeparture extends TransitDeparture {
  static #CITY_CIRCLE_ROUTE = {
    "route_type": 0,
    "route_id": 99,
    "route_name": "City Circle",
    "route_number": "",
    "route_gtfs_id": "2-CCL",
    "geopath": []
  }

  static #UP_DIRECTION = {
    directionID: 1,
    directionName: "City (Flinders Street)",
    railDirection: "Up"
  }

  platform
  useFormedByData

  static #addRailDirection(line, direction) {
    if (line.routeName === 'Stony Point') {
      direction.railDirection = runDestination === 'Frankston' ? 'Up' : 'Down'
    } else if (line.routeName === 'City Circle') {
      direction.railDirection = 'Down'
    } else {
      direction.railDirection = direction.directionName.includes('City') ? 'Up' : 'Down'
    }

    return direction
  }

  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, departureStopID, platform) {
    super(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, departureStopID)

    this.platform = platform
    this.useFormedByData = this.isFormingTrainInLoop()

    if (this.useFormedByData) {
      this.updateRunToFormedBy()
    }
  }

  updateRunToFormedBy() {
    let originalTDN = this.runData.tdn,
        originalRunRef = this.runData.runRef

    let formedBy = this.runData.formedBy

    this.runData.runRef = formedBy.runRef
    this.runData.destination = 'Flinders Street'
    this.runData.tdn = formedBy.tdn
    this.runData.viaCityLoop = true
    this.runData.direction = MetroDeparture.#UP_DIRECTION

    this.runData.formedBy = null
    this.runData.forming = {
      tdn: originalTDN,
      runRef: originalRunRef
    }
  }

  isFormingTrainInLoop() {
    let isInLoop = cityStations.loopStopIDs.includes(this.departureStopID)
    if (!isInLoop) return false

    return this.runData.viaCityLoop == false
  }

  static fromPTVData(departure, route, run, direction) {
    if (departure.route_id === 99) route = MetroDeparture.#CITY_CIRCLE_ROUTE

    let metroLine = MetroLine.fromPTVData(route)
    let metroDirection = MetroDeparture.#addRailDirection(metroLine, {
      directionID: direction.direction_id,
      directionName: direction.direction_name,
    })

    let metroRun = MetroRun.fromPTVData(run, departure.flags, metroLine, metroDirection)

    return new MetroDeparture(
      metroLine,
      metroRun,
      departure.scheduled_departure_utc,
      departure.estimated_departure_utc,
      departure.stop_id,
      departure.platform_number,
      metroDirection
    )
  }

}