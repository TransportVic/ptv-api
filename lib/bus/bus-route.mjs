import TransitRoute from "../types/transit-route.mjs"

export default class BusRoute extends TransitRoute {

  /**
   * Constructs a new BusRoute instance
   * 
   * @param {int} ptvRouteID The PTV Route ID from the PTV API
   * @param {string} routeName The route name
   * @param {string} routeNumber The route number
   * @param {string} gtfsRouteID The route GTFS ID
   */
  constructor(ptvRouteID, routeName, routeNumber, gtfsRouteID) {
    super(ptvRouteID, routeName, routeNumber, gtfsRouteID)
  }

  isCombinedRoute() {
    return this.routeNumber.toLowerCase().includes('combined')
  }

  static correctRouteNumber(routeName, routeNumber) {
    let parts
    if (!routeNumber.match(/\d/) && (parts = routeName.match(/Route (\d+)/i))) {
      return {
        routeNumber: parts[1],
        routeName: routeName.replace(/ ?\(?Route \d+\)?/i, '')
      }
    }

    return { routeName, routeNumber }
  }

  /**
   * Constructs a new BusRoute instance from the PTV API response
   * 
   * @param {dictionary} data The raw PTV API data
   * @returns {BusRoute} A BusRoute instance from the data provided
   */
  static fromPTVData(data) {
    let { routeName, routeNumber } = BusRoute.correctRouteNumber(data.route_name, data.route_number)

    return new BusRoute(data.route_id, routeName, routeNumber, data.route_gtfs_id)
  }

}