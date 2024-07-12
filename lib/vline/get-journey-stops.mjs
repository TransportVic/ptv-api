import { VLineJPMethod } from './api-methods.mjs'

export class GetJourneyStopsAPI extends VLineJPMethod {

  #origin
  #destination
  #departureTime
  #runID

  #BASE_URL = '/VLineServices.svc/web/GetJourneyStops?LocationName={0}&DestinationName={1}&originDepartureTime={2}&originServiceIdentifier={3}'

  constructor(origin, destination, departureTime, runID) {
    super()
    this.#origin = origin
    this.#destination = destination
    this.#departureTime = departureTime
    this.#runID = runID
  }


  getMethodName() {
    return 'JP_GETJOURNEYSTOPS'
  }

  getMethodURLPath() {
    return this.#BASE_URL.replace('{0}', this.#origin)
    .replace('{1}', this.#destination)
    .replace('{2}', this.#departureTime)
    .replace('{2}', this.#runID)
  }

  async fetch(apiInterface) {
    let $ = await super.fetch(apiInterface)
    let stopData = $('VStop')

    let stops = new VLineJourneyStops()
    
    for (let stop of stopData) {
      stops.push(VLineJourneyStop.fromVLineData($, stop))
    }

    return stops
  }
}

export class VLineJourneyStops extends Array {

  push(stop) {

  }

}

export class VLineJourneyStop {

  static fromVLineData($, stop) {
    
  }

}