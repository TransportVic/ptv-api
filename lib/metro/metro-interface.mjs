import MetroDepartures from './metro-departures.mjs'

export default class MetroInterface {

  constructor(apiInterface) {
    this.api = apiInterface
  }

  getDepartures(stopGTFSID, parameters) {
    let departures = new MetroDepartures(this.api, stopGTFSID)
    departures.fetch(parameters)
  }

}