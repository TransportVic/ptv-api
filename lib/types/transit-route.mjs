export default class TransitRoute {

  /**
   * Constructs a new TransitRoute instance
   * 
   * @param {int} ptvRouteID The PTV Route ID from the PTV API
   * @param {string} routeName The route name
   * @param {string} routeNumber The route number
   * @param {string} gtfsRouteID The route GTFS ID
   */
  constructor(ptvRouteID, routeName, routeNumber, gtfsRouteID) {
    this.ptvRouteID = ptvRouteID
    this.routeName = routeName
    this.routeNumber = routeNumber
    this.gtfsRouteID = gtfsRouteID
  }

}