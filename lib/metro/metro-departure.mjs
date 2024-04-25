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

  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, platform) {
    super(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, platform)
  }

  static fromPTVData(departure, route, run) {
    if (departure.route_id === 99) route = MetroDeparture.CITY_CIRCLE_ROUTE

    return new MetroDeparture(
      MetroLine.fromPTVData(route),
      MetroRun.fromPTVData(run, departure.flags),
      departure.scheduled_departure_utc,
      departure.estimated_departure_utc,
      departure.platform_number
    )
  }

}