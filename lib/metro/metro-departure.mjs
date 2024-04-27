import TransitDeparture from "../types/transit-departure.mjs"
import MetroLine from "./metro-line.mjs"
import MetroRun from "./metro-run.mjs"

export default class MetroDeparture extends TransitDeparture {
  static CITY_CIRCLE_ROUTE = {
    "route_type": 0,
    "route_id": 99,
    "route_name": "City Circle",
    "route_number": "",
    "route_gtfs_id": "2-CCL",
    "geopath": []
  }

  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, platform, direction) {
    super(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, platform, direction)

    if (routeData.routeName === 'Stony Point') {
      this.direction.railDirection = runDestination === 'Frankston' ? 'Up' : 'Down'
    } else if (routeData.routeName === 'City Circle') {
      this.direction.railDirection = 'Down'
    } else {
      this.direction.railDirection = this.direction.directionName.includes('City') ? 'Up' : 'Down'
    }
  }

  static fromPTVData(departure, route, run, direction) {
    if (departure.route_id === 99) route = MetroDeparture.CITY_CIRCLE_ROUTE

    return new MetroDeparture(
      MetroLine.fromPTVData(route),
      MetroRun.fromPTVData(run, departure.flags),
      departure.scheduled_departure_utc,
      departure.estimated_departure_utc,
      departure.platform_number,
      {
        directionID: direction.direction_id,
        directionName: direction.direction_name,
      }
    )
  }

}