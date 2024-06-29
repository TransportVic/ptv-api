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

  /**
   * Checks if a PTV API bus route is a combined route.
   * 
   * For instance, the 802, 804 and 862 have duplicated departures on the main route and the combined route.
   * 
   * @returns {boolean} True if it is a combined route
   */
  isCombinedRoute() {
    return this.routeNumber.toLowerCase().includes('combined')
  }

  /**
   * Corrects a bus route name and number.
   * 
   * Sometimes the people at PTV leave the bus route number blank and instead put it in the bus route name.
   * 
   * @param {string} routeName The bus route name
   * @param {string} routeNumber The bus route number
   * @returns {dictionary} The corrected bus route name and number
   */
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