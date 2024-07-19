import { PTVAPIInterface } from '../ptv-api-interface.mjs'

export default class TransitRuns extends Array {
  
  #responseData
  #api
  #routeID

  /**
   * 
   * @param {PTVAPIInterface} api The PTV API Interface
   * @param {number} routeID The PTV API Route ID
   */
  constructor(api, routeID) {
    super()
    this.#api = api
    this.#routeID = routeID
  }

  generateQueryString(parameters) {
    let queries = []
    if (typeof parameters.expand !== 'undefined') queries.push(...parameters.expand.map(expand => `expand=${expand}`))
    if (typeof parameters.includeForming !== 'undefined') queries.push(`include_advertised_interchange=${parameters.includeForming}`)

    return `?${queries.join('&')}`
  }

  async fetch(parameters) {
    
  }

  async fetchBody(parameters) {
    if (!parameters) parameters = {}
    let queryString = this.generateQueryString(parameters)
    let url = `/v3/runs/route/${this.#routeID}${queryString}`
    let body = await this.#api.apiCall(url)

    this.#responseData = body

    return body
  }
}