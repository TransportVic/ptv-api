import TransitStoppingPattern from "../types/transit-stopping-pattern.mjs";

export default class MetroStoppingPattern extends TransitStoppingPattern {

  #responseData
  #api
  #runRef

  constructor(apiInterface, runRef) {
    super()
    this.#api = apiInterface
    this.#runRef = runRef
  }

  async fetch(parameters) {
    this.addExpandData(parameters)
    let queryString = this.generateQueryString(parameters)
    let url = `/v3/pattern/run/${this.#runRef}/route_type/0${queryString}`
    let body = await this.#api.apiCall(url)
  }
}