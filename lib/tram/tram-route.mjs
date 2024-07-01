import TransitRoute from "../types/transit-route.mjs"

export default class TramRoute extends TransitRoute {

  /**
   * Constructs a new TramRoute instance
   * 
   * @param {string} routeNumber The route number
   */
  constructor(routeNumber) {
    super(null, null, routeNumber, `3-${routeNumber}`)
  }
}