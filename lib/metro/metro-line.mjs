import TransitRoute from "../types/transit-route.mjs"

export default class MetroLine extends TransitRoute {

  constructor(ptvRouteID, routeName, gtfsRouteID) {
    super(ptvRouteID, routeName, null, gtfsRouteID)

  }

  static fromPTVData(data) {
    return new MetroLine(data.route_id, data.route_name, data.route_gtfs_id)
  }

}