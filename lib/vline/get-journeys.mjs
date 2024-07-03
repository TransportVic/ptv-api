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

}