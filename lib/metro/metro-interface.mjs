import MetroDepartures from './metro-departures.mjs'

export default class MetroInterface {

  #api

  constructor(apiInterface) {
    this.#api = apiInterface
  }

  async getDepartures(stopID, parameters) {
    let departures = new MetroDepartures(this.#api, stopID)
    await departures.fetch(parameters)
    
    return departures
  }

}