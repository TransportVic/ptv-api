import { VLineJPMethod } from './api-methods.mjs'

export class GetJourneysAPI extends VLineJPMethod {

  #origin
  #destination
  #lookBackwards

  #BASE_URL = '/VLineServices.svc/web/GetNextPrevious5Journeys?LocationName={0}&DestinationName={1}&hasPrevious={2}'

  constructor(origin, destination, lookBackwards) {
    super()
    if (typeof lookBackwards === 'undefined') lookBackwards = false

    this.#origin = origin
    this.#destination = destination
    this.#lookBackwards = lookBackwards
  }

  getMethodName() {
    return 'JP_GETNEXTPREVIOUS5JOURNEYS'
  }

  getMethodURLPath() {
    return this.#BASE_URL.replace('{0}', this.#origin)
      .replace('{1}', this.#destination)
      .replace('{2}', this.#lookBackwards)
  }

  async fetch(apiInterface) {
    let $ = await super.fetch(apiInterface)
    let journeyData = $('VJourney')

    let journeys = new VLineJourneys()
    
    for (let journey of journeyData) {
      journeys.push(VLineJourney.fromVLineData($, journey))
    }

    return journeys
  }

}

export class VLineJourneys extends Array {

}

export class VLineJourney {

  legs
  duration

  constructor(legs, duration) {
    this.legs = legs
    this.duration = duration
  }

  static fromVLineData($, journey) {
    let legs = Array.from($('VLeg', journey)).map(leg => this.processLeg($, leg))
    return new VLineJourney(legs, 0)
  }

  static processLeg($, leg) {
    return new VLineJourneyLeg()
  }

}

export class VLineJourneyLeg {

}