import TransitRoute from "../types/transit-route.mjs"
import MetroUtils from "./metro-utils.mjs"

export default class MetroLine extends TransitRoute {

  /**
   * Constructs a new MetroLine instance
   * 
   * @param {int} ptvRouteID The PTV Route ID from the PTV API
   * @param {string} routeName The route name
   * @param {string} gtfsRouteID The route GTFS ID
   */
  constructor(ptvRouteID, routeName, gtfsRouteID) {
    super(ptvRouteID, routeName, null, gtfsRouteID)
    this.correctRouteName()
  }

  /**
   * Corrects the route name. Required for Flemington Racecourse.
   */
  correctRouteName() {
    this.routeName = MetroUtils.correctRouteName(this.routeName)
  }

  /**
   * Constructs a new MetroLine instance from the PTV API response
   * 
   * @param {dictionary} data The raw PTV API data
   * @returns A MetroLine instance from the data provided
   */
  static fromPTVData(data) {
    return new MetroLine(data.route_id, data.route_name, data.route_gtfs_id)
  }

}