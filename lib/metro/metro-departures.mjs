import TransitDepartures from "../types/transit-departures.mjs"

export default class MetroDepartures extends TransitDepartures {

  constructor(apiInterface, stopID) {
    this.api = apiInterface
    this.stopID = stopID
  }

  async fetch() {
    let queryString = this.generateQueryString(parameters)
    let url = `/v3/departures/route_type/0/stop/${this.stopID}`
    let body = this.api.apiCall(url)
  }

}