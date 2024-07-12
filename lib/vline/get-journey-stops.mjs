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
    .replace('{3}', this.#runID)
  }

  async fetch(apiInterface) {
    let $ = await super.fetch(apiInterface)
    let stopData = $('VStop')

    let stops = new VLineStoppingPattern()
    
    for (let stop of stopData) {
      stops.push(VLineTripStop.fromVLineData($, stop))
    }

    return stops
  }
}

export class VLineStoppingPattern extends Array {

  push(stop) {
    // TODO: Handle stop duplication during works
    super.push(stop)
  }

}

export class VLineTripStop {

  static #UNSET_TIME = '0001-01-01T00:00:00'

  location
  arrivalTime
  departureTime

  constructor(location, arrivalTime, departureTime) {
    this.location = location
    this.arrivalTime = arrivalTime
    this.departureTime = departureTime
  }

  static fromVLineData($, stop) {
    let arrivalTime = $('VArrivalTime', stop).text()
    let departureTime = $('VDepartureTime', stop).text()
    let location = $('VLocationName', stop).text()

    if (arrivalTime === this.#UNSET_TIME) arrivalTime = departureTime
    else if (departureTime === this.#UNSET_TIME) departureTime = arrivalTime

    // TODO: Account for timezone as this is given as Melbourne time
    return new VLineTripStop(location, new Date(arrivalTime), new Date(departureTime))
  }

}