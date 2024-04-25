import TransitDepartures from "../types/transit-departures.mjs"
import MetroDeparture from "./metro-departure.mjs"

export default class MetroDepartures extends TransitDepartures {

  constructor(apiInterface, stopID) {
    super()
    this.api = apiInterface
    this.stopID = stopID
  }

  getRoute(departure) {
    return this.responseData.routes[departure.route_id]
  }

  getRun(departure) {
    return this.responseData.runs[departure.run_ref]
  }

  async fetch(parameters) {
    this.addExpandData(parameters)
    let queryString = this.generateQueryString(parameters)
    let url = `/v3/departures/route_type/0/stop/${this.stopID}${queryString}`
    let body = await this.api.apiCall(url)

    this.responseData = body
    for (let departure of body.departures) {
      this.push(MetroDeparture.fromPTVData(departure, this.getRoute(departure), this.getRun(departure)))
    }
  }

}