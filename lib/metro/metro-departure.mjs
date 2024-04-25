import TransitDeparture from "../types/transit-departure.mjs"
import MetroLine from "./metro-line.mjs"
import MetroRun from "./metro-run.mjs"

export default class MetroDeparture extends TransitDeparture {

  constructor(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, platform) {
    super(routeData, runData, scheduledDepartureTime, estimatedDepartureTime, platform)
  }

  static fromPTVData(departure, route, run) {
    return new MetroDeparture(
      MetroLine.fromPTVData(route),
      MetroRun.fromPTVData(run, departure.flags),
      departure.scheduled_departure_utc,
      departure.estimated_departure_utc,
      departure.platform_number
    )
  }

}