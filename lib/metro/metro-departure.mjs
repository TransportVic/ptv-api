import TransitDeparture from "../types/transit-departure.mjs"
import MetroLine from "./metro-line.mjs"
import MetroRun from "./metro-run.mjs"

export default class MetroDeparture extends TransitDeparture {
  static #CITY_CIRCLE_ROUTE = {
    "route_type": 0,
    "route_id": 99,
    "route_name": "City Circle",
    "route_number": "",
    "route_gtfs_id": "2-CCL",
    "geopath": []
  }

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

  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, platform, direction) {
    super(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, platform, direction)
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
      departure.platform_number,
      metroDirection
    )
  }

}